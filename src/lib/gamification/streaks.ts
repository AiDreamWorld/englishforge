import { createClient } from '@/lib/supabase/client'

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 100, 365]

export async function updateStreak(studentId: string): Promise<{
  currentStreak: number
  isNewRecord: boolean
  streakMilestone?: number
}> {
  const supabase = createClient()

  const { data: stats } = await supabase
    .from('student_stats')
    .select('streak_days, longest_streak, last_activity_date')
    .eq('student_id', studentId)
    .single()

  if (!stats) throw new Error('Student stats not found')

  const today = new Date().toISOString().split('T')[0]

  if (stats.last_activity_date === today) {
    return {
      currentStreak: stats.streak_days,
      isNewRecord: false,
    }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak: number
  if (stats.last_activity_date === yesterdayStr) {
    newStreak = stats.streak_days + 1
  } else {
    newStreak = 1
  }

  const isNewRecord = newStreak > stats.longest_streak
  const longestStreak = Math.max(newStreak, stats.longest_streak)

  await supabase
    .from('student_stats')
    .update({
      streak_days: newStreak,
      longest_streak: longestStreak,
      last_activity_date: today,
    })
    .eq('student_id', studentId)

  const streakMilestone = STREAK_MILESTONES.find((m) => m === newStreak)

  if (streakMilestone) {
    await supabase.from('notifications').insert({
      user_id: studentId,
      title: `${streakMilestone}-Day Streak!`,
      body: `You've been learning for ${streakMilestone} days in a row! That's incredible!`,
      type: 'achievement',
      icon: 'streak',
    })
  }

  return { currentStreak: newStreak, isNewRecord, streakMilestone }
}
