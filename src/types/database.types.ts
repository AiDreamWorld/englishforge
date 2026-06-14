export type UserRole = 'student' | 'teacher' | 'admin' | 'super_admin'
export type AccountStatus = 'active' | 'suspended' | 'pending' | 'banned'
export type LevelDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'extreme' | 'extra_extreme'
export type ContentStatus = 'draft' | 'published' | 'archived'
export type ContentType = 'class' | 'course' | 'lab'
export type AssessmentType =
  | 'quick_quiz' | 'practice' | 'vocabulary_check'
  | 'unit_test' | 'skill_eval' | 'progress_review'
  | 'mid_level' | 'comprehensive'
  | 'end_of_level' | 'certification'
export type QuestionType =
  | 'multiple_choice' | 'true_false' | 'fill_blank'
  | 'match_pairs' | 'drag_drop' | 'listen_choose'
  | 'image_select' | 'short_answer' | 'reorder'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending' | 'trialing'
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'family' | 'teacher' | 'school'

export interface Profile {
  id: string
  email: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  avatar_emoji: string | null
  role: UserRole
  status: AccountStatus
  date_of_birth: string | null
  age_group: string | null
  country: string
  city: string | null
  phone: string | null
  parent_email: string | null
  parent_phone: string | null
  timezone: string
  preferred_language: string
  onboarding_completed: boolean
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface LearningLevel {
  id: string
  level_number: number
  title: string
  description: string | null
  difficulty: LevelDifficulty
  xp_required: number
  xp_reward: number
  coin_reward: number
  thumbnail_url: string | null
  is_locked: boolean
  unlock_condition: Record<string, unknown> | null
  skills_covered: string[] | null
  estimated_hours: number | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  content_type: ContentType
  status: ContentStatus
  level_id: string | null
  teacher_id: string | null
  thumbnail_url: string | null
  intro_video_url: string | null
  price: number
  is_free: boolean
  skills: string[] | null
  tags: string[] | null
  age_group: string[] | null
  total_lessons: number
  total_duration_minutes: number
  enrolled_count: number
  rating: number
  rating_count: number
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  content: string | null
  lesson_type: string | null
  video_url: string | null
  audio_url: string | null
  attachments: Record<string, unknown>[]
  duration_minutes: number
  order_index: number
  xp_reward: number
  is_preview: boolean
  status: ContentStatus
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  title: string
  description: string | null
  assessment_type: AssessmentType
  course_id: string | null
  level_id: string | null
  teacher_id: string | null
  time_limit_minutes: number | null
  total_questions: number
  total_points: number
  passing_score: number
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_results_immediately: boolean
  xp_reward: number
  coin_reward: number
  badge_reward: string | null
  is_mandatory: boolean
  available_from: string | null
  available_until: string | null
  status: ContentStatus
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  assessment_id: string
  question_text: string
  question_type: QuestionType
  options: McqOption[]
  correct_answer: unknown
  explanation: string | null
  hint: string | null
  points: number
  media_url: string | null
  order_index: number
  difficulty: string
  tags: string[] | null
  created_at: string
}

export interface McqOption {
  id: string
  text: string
  is_correct: boolean
}

export interface AssessmentAttempt {
  id: string
  assessment_id: string
  student_id: string
  answers: Record<string, unknown>
  score: number
  total_points: number
  percentage: number
  passed: boolean
  time_taken_seconds: number | null
  started_at: string
  completed_at: string | null
  feedback: string | null
  attempt_number: number
}

export interface StudentStats {
  id: string
  student_id: string
  total_xp: number
  current_level: number
  coins: number
  gems: number
  streak_days: number
  longest_streak: number
  last_activity_date: string | null
  total_lessons_completed: number
  total_quizzes_taken: number
  total_time_minutes: number
  avg_quiz_score: number
  badges_earned: number
  rank: number | null
  updated_at: string
}

export interface Badge {
  id: string
  slug: string
  name: string
  description: string | null
  icon_url: string
  category: string | null
  condition: Record<string, unknown> | null
  rarity: string
  xp_bonus: number
  coin_bonus: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  price: number | null
  currency: string
  billing_cycle: string | null
  gateway: string | null
  gateway_subscription_id: string | null
  gateway_transaction_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  trial_end: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: string | null
  action_url: string | null
  icon: string | null
  is_read: boolean
  created_at: string
}
