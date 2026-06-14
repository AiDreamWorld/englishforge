import { createClient } from '@/lib/supabase/client'

export interface BadgeDefinition {
  slug: string
  name: string
  description: string
  category: string
  rarity: string
  condition: { type: string; value: number }
  xp_bonus: number
  coin_bonus: number
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges
  { slug: 'streak-3', name: '3 Days on Fire', description: 'Maintain a 3-day streak', category: 'streak', rarity: 'common', condition: { type: 'streak', value: 3 }, xp_bonus: 50, coin_bonus: 10 },
  { slug: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streak', rarity: 'rare', condition: { type: 'streak', value: 7 }, xp_bonus: 250, coin_bonus: 75 },
  { slug: 'streak-30', name: 'Month Master', description: 'Maintain a 30-day streak', category: 'streak', rarity: 'epic', condition: { type: 'streak', value: 30 }, xp_bonus: 1000, coin_bonus: 300 },
  { slug: 'streak-100', name: '100 Day Legend', description: 'Maintain a 100-day streak', category: 'streak', rarity: 'legendary', condition: { type: 'streak', value: 100 }, xp_bonus: 5000, coin_bonus: 1000 },

  // Level badges
  { slug: 'level-5', name: 'First Steps', description: 'Reach Level 5', category: 'level', rarity: 'common', condition: { type: 'level', value: 5 }, xp_bonus: 100, coin_bonus: 25 },
  { slug: 'level-10', name: 'Rising Star', description: 'Reach Level 10', category: 'level', rarity: 'common', condition: { type: 'level', value: 10 }, xp_bonus: 200, coin_bonus: 50 },
  { slug: 'level-25', name: 'Explorer', description: 'Reach Level 25', category: 'level', rarity: 'rare', condition: { type: 'level', value: 25 }, xp_bonus: 500, coin_bonus: 150 },
  { slug: 'level-50', name: 'Champion', description: 'Reach Level 50', category: 'level', rarity: 'epic', condition: { type: 'level', value: 50 }, xp_bonus: 1500, coin_bonus: 500 },
  { slug: 'level-75', name: 'Master', description: 'Reach Level 75', category: 'level', rarity: 'epic', condition: { type: 'level', value: 75 }, xp_bonus: 3000, coin_bonus: 800 },
  { slug: 'level-100', name: 'Legend', description: 'Reach Level 100', category: 'level', rarity: 'legendary', condition: { type: 'level', value: 100 }, xp_bonus: 10000, coin_bonus: 2500 },

  // Quiz badges
  { slug: 'first-perfect', name: 'First A+', description: 'Score 100% on any quiz', category: 'quiz', rarity: 'common', condition: { type: 'perfect_score', value: 1 }, xp_bonus: 100, coin_bonus: 25 },
  { slug: 'quiz-50', name: 'Quiz Machine', description: 'Complete 50 quizzes', category: 'quiz', rarity: 'rare', condition: { type: 'quizzes_taken', value: 50 }, xp_bonus: 500, coin_bonus: 150 },
  { slug: 'perfect-5-row', name: 'Unbeatable', description: '5 perfect scores in a row', category: 'quiz', rarity: 'legendary', condition: { type: 'perfect_streak', value: 5 }, xp_bonus: 2000, coin_bonus: 500 },

  // Skill badges
  { slug: 'grammar-guru', name: 'Grammar Guru', description: 'Master grammar exercises', category: 'skill', rarity: 'rare', condition: { type: 'skill_mastery', value: 1 }, xp_bonus: 300, coin_bonus: 100 },
  { slug: 'vocab-king', name: 'Vocabulary King', description: 'Learn 500 new words', category: 'skill', rarity: 'rare', condition: { type: 'words_learned', value: 500 }, xp_bonus: 300, coin_bonus: 100 },
  { slug: 'reading-pro', name: 'Reading Pro', description: 'Complete 50 reading lessons', category: 'skill', rarity: 'rare', condition: { type: 'reading_lessons', value: 50 }, xp_bonus: 300, coin_bonus: 100 },
  { slug: 'listening-legend', name: 'Listening Legend', description: 'Complete 50 listening exercises', category: 'skill', rarity: 'epic', condition: { type: 'listening_lessons', value: 50 }, xp_bonus: 500, coin_bonus: 200 },

  // Special badges
  { slug: 'early-bird', name: 'Early Bird', description: 'Log in before 8 AM', category: 'special', rarity: 'common', condition: { type: 'login_hour', value: 8 }, xp_bonus: 50, coin_bonus: 10 },
  { slug: 'night-owl', name: 'Night Owl', description: 'Log in after 9 PM', category: 'special', rarity: 'common', condition: { type: 'login_hour_after', value: 21 }, xp_bonus: 50, coin_bonus: 10 },
  { slug: 'speed-demon', name: 'Speed Demon', description: 'Complete a quiz in under 2 minutes', category: 'special', rarity: 'rare', condition: { type: 'quiz_speed', value: 120 }, xp_bonus: 200, coin_bonus: 50 },
  { slug: 'helpful-hero', name: 'Helpful Hero', description: 'Submit all assignments on time', category: 'special', rarity: 'epic', condition: { type: 'all_assignments', value: 1 }, xp_bonus: 500, coin_bonus: 200 },
]

export async function checkAndAwardBadge(
  studentId: string,
  badgeSlug: string
): Promise<boolean> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from('student_badges')
    .select('id')
    .eq('student_id', studentId)
    .eq('badge_id', badgeSlug)
    .single()

  if (existing) return false

  const { data: badge } = await supabase
    .from('badges')
    .select('*')
    .eq('slug', badgeSlug)
    .single()

  if (!badge) return false

  await supabase.from('student_badges').insert({
    student_id: studentId,
    badge_id: badge.id,
  })

  await supabase
    .from('student_stats')
    .update({
      badges_earned: supabase.rpc('increment_badges', { student_id_input: studentId }),
    })
    .eq('student_id', studentId)

  await supabase.from('notifications').insert({
    user_id: studentId,
    title: `Badge Earned: ${badge.name}!`,
    body: badge.description || `You earned the ${badge.name} badge!`,
    type: 'achievement',
    icon: 'badge',
  })

  return true
}
