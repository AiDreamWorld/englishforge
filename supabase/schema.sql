-- EnglishForge Complete Database Schema
-- Run this in the Supabase SQL editor

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Auto-update timestamp function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- User Profiles
create type user_role as enum ('student', 'teacher', 'admin', 'super_admin');
create type account_status as enum ('active', 'suspended', 'pending', 'banned');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  display_name text,
  avatar_url text,
  role user_role default 'student',
  status account_status default 'active',
  date_of_birth date,
  age_group text,
  country text default 'PK',
  city text,
  phone text,
  parent_email text,
  parent_phone text,
  timezone text default 'Asia/Karachi',
  preferred_language text default 'en',
  onboarding_completed boolean default false,
  last_seen_at timestamptz,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

-- Learning Levels
create type level_difficulty as enum ('very_easy', 'easy', 'medium', 'hard', 'extreme', 'extra_extreme');

create table learning_levels (
  id uuid default uuid_generate_v4() primary key,
  level_number integer unique not null check (level_number between 1 and 100),
  title text not null,
  description text,
  difficulty level_difficulty not null,
  xp_required integer not null default 0,
  xp_reward integer not null default 100,
  coin_reward integer not null default 50,
  thumbnail_url text,
  is_locked boolean default true,
  unlock_condition jsonb,
  skills_covered text[],
  estimated_hours integer,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- Seed 100 levels
insert into learning_levels (level_number, title, difficulty, xp_required, xp_reward, coin_reward, is_locked)
select
  n,
  'Level ' || n,
  case
    when n between 1 and 20 then 'very_easy'
    when n between 21 and 40 then 'easy'
    when n between 41 and 60 then 'medium'
    when n between 61 and 80 then 'hard'
    when n between 81 and 90 then 'extreme'
    else 'extra_extreme'
  end::level_difficulty,
  (n - 1) * 500,
  100 + (n * 10),
  50 + (n * 5),
  case when n = 1 then false else true end
from generate_series(1, 100) as n;

-- Courses & Lessons
create type content_status as enum ('draft', 'published', 'archived');
create type content_type as enum ('class', 'course', 'lab');

create table courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  description text,
  content_type content_type default 'course',
  status content_status default 'draft',
  level_id uuid references learning_levels(id),
  teacher_id uuid references profiles(id),
  thumbnail_url text,
  intro_video_url text,
  price decimal(10,2) default 0,
  is_free boolean default false,
  skills text[],
  tags text[],
  age_group text[],
  total_lessons integer default 0,
  total_duration_minutes integer default 0,
  enrolled_count integer default 0,
  rating decimal(3,2) default 0,
  rating_count integer default 0,
  meta jsonb default '{}',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);
create trigger update_courses_updated_at before update on courses
  for each row execute function update_updated_at_column();

create table lessons (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  content text,
  lesson_type text,
  video_url text,
  audio_url text,
  attachments jsonb default '[]',
  duration_minutes integer default 0,
  order_index integer not null,
  xp_reward integer default 50,
  is_preview boolean default false,
  status content_status default 'draft',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);
create trigger update_lessons_updated_at before update on lessons
  for each row execute function update_updated_at_column();

-- Assessments
create type assessment_type as enum (
  'quick_quiz', 'practice', 'vocabulary_check',
  'unit_test', 'skill_eval', 'progress_review',
  'mid_level', 'comprehensive',
  'end_of_level', 'certification'
);

create type question_type as enum (
  'multiple_choice', 'true_false', 'fill_blank',
  'match_pairs', 'drag_drop', 'listen_choose',
  'image_select', 'short_answer', 'reorder'
);

create table assessments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  assessment_type assessment_type not null,
  course_id uuid references courses(id),
  level_id uuid references learning_levels(id),
  teacher_id uuid references profiles(id),
  time_limit_minutes integer,
  total_questions integer default 0,
  total_points integer default 0,
  passing_score integer default 70,
  max_attempts integer default 3,
  shuffle_questions boolean default true,
  shuffle_options boolean default true,
  show_results_immediately boolean default true,
  xp_reward integer default 100,
  coin_reward integer default 25,
  badge_reward text,
  is_mandatory boolean default false,
  available_from timestamptz,
  available_until timestamptz,
  status content_status default 'draft',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table questions (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references assessments(id) on delete cascade,
  question_text text not null,
  question_type question_type not null,
  options jsonb default '[]',
  correct_answer jsonb,
  explanation text,
  hint text,
  points integer default 1,
  media_url text,
  order_index integer not null,
  difficulty text default 'medium',
  tags text[],
  created_at timestamptz default timezone('utc', now()) not null
);

create table assessment_attempts (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references assessments(id),
  student_id uuid references profiles(id),
  answers jsonb default '{}',
  score integer default 0,
  total_points integer default 0,
  percentage decimal(5,2) default 0,
  passed boolean default false,
  time_taken_seconds integer,
  started_at timestamptz default timezone('utc', now()),
  completed_at timestamptz,
  feedback text,
  attempt_number integer default 1
);

-- Student Progress & Gamification
create table student_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  lesson_id uuid references lessons(id),
  completed boolean default false,
  completion_percentage integer default 0,
  time_spent_seconds integer default 0,
  last_position_seconds integer default 0,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null,
  unique(student_id, lesson_id)
);

create table student_level_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade,
  level_id uuid references learning_levels(id),
  current_xp integer default 0,
  is_unlocked boolean default false,
  is_completed boolean default false,
  unlocked_at timestamptz,
  completed_at timestamptz,
  unique(student_id, level_id)
);

create table student_stats (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade unique,
  total_xp integer default 0,
  current_level integer default 1,
  coins integer default 0,
  gems integer default 0,
  streak_days integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  total_lessons_completed integer default 0,
  total_quizzes_taken integer default 0,
  total_time_minutes integer default 0,
  avg_quiz_score decimal(5,2) default 0,
  badges_earned integer default 0,
  rank integer,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table badges (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  description text,
  icon_url text not null,
  category text,
  condition jsonb,
  rarity text default 'common',
  xp_bonus integer default 0,
  coin_bonus integer default 0,
  created_at timestamptz default timezone('utc', now()) not null
);

create table student_badges (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade,
  badge_id uuid references badges(id),
  earned_at timestamptz default timezone('utc', now()),
  unique(student_id, badge_id)
);

-- Subscriptions & Payments
create type subscription_status as enum ('active', 'cancelled', 'expired', 'pending', 'trialing');
create type subscription_plan as enum ('free', 'basic', 'premium', 'family', 'teacher', 'school');

create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  plan subscription_plan not null,
  status subscription_status default 'pending',
  price decimal(10,2),
  currency text default 'PKR',
  billing_cycle text,
  gateway text,
  gateway_subscription_id text,
  gateway_transaction_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  cancelled_at timestamptz,
  trial_end timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  enrolled_at timestamptz default timezone('utc', now()),
  expires_at timestamptz,
  payment_id text,
  is_active boolean default true,
  unique(student_id, course_id)
);

create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  amount decimal(10,2) not null,
  currency text default 'PKR',
  gateway text not null,
  gateway_ref text,
  status text default 'pending',
  type text,
  reference_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

-- Activity & Notifications
create table activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz default timezone('utc', now()) not null
);
create index on activity_log (user_id, created_at desc);
create index on activity_log (event_type, created_at desc);

create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text,
  action_url text,
  icon text,
  is_read boolean default false,
  created_at timestamptz default timezone('utc', now()) not null
);
create index on notifications (user_id, is_read, created_at desc);

-- Live Classes & Assignments
create table live_classes (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id),
  teacher_id uuid references profiles(id),
  title text not null,
  description text,
  meeting_url text,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  max_students integer default 30,
  enrolled_count integer default 0,
  recording_url text,
  status text default 'scheduled',
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table assignments (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id),
  teacher_id uuid references profiles(id),
  title text not null,
  description text not null,
  instructions text,
  attachments jsonb default '[]',
  due_date timestamptz,
  max_score integer default 100,
  xp_reward integer default 75,
  allow_late_submission boolean default false,
  created_at timestamptz default timezone('utc', now()) not null,
  updated_at timestamptz default timezone('utc', now()) not null
);

create table assignment_submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references assignments(id),
  student_id uuid references profiles(id),
  content text,
  attachments jsonb default '[]',
  score integer,
  feedback text,
  status text default 'submitted',
  submitted_at timestamptz default timezone('utc', now()),
  graded_at timestamptz,
  graded_by uuid references profiles(id),
  is_late boolean default false
);

-- AI Reports
create table ai_reports (
  id uuid default uuid_generate_v4() primary key,
  report_type text not null,
  report_month date not null,
  target_id uuid,
  insights jsonb not null default '{}',
  recommendations jsonb default '[]',
  generated_by text default 'openai-gpt-4o',
  tokens_used integer,
  created_at timestamptz default timezone('utc', now()) not null,
  unique(report_type, report_month, target_id)
);

-- RLS Policies
alter table profiles enable row level security;
alter table student_stats enable row level security;
alter table student_progress enable row level security;
alter table student_level_progress enable row level security;
alter table student_badges enable row level security;
alter table notifications enable row level security;
alter table assessment_attempts enable row level security;
alter table enrollments enable row level security;
alter table subscriptions enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for all using (
  exists(select 1 from profiles where id = auth.uid() and role in ('admin', 'super_admin'))
);
create policy "Students see own progress" on student_progress for all using (auth.uid() = student_id);
create policy "Students see own stats" on student_stats for all using (auth.uid() = student_id);
create policy "Students see own badges" on student_badges for all using (auth.uid() = student_id);
create policy "Students see own notifications" on notifications for all using (auth.uid() = user_id);
create policy "Students see own attempts" on assessment_attempts for all using (auth.uid() = student_id);

-- Public read for courses, levels, badges
alter table courses enable row level security;
create policy "Published courses visible to all" on courses for select using (status = 'published');
create policy "Teachers manage own courses" on courses for all using (auth.uid() = teacher_id);

alter table learning_levels enable row level security;
create policy "Levels visible to all authenticated" on learning_levels for select using (auth.uid() is not null);

alter table badges enable row level security;
create policy "Badges visible to all authenticated" on badges for select using (auth.uid() is not null);
