import { createClient } from '@/lib/supabase/client'

export interface LeaderboardEntry {
  rank: number
  student_id: string
  full_name: string
  display_name: string | null
  avatar_url: string | null
  total_xp: number
  current_level: number
  streak_days: number
}

export async function getLeaderboard(
  type: 'all_time' | 'weekly' = 'all_time',
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_stats')
    .select(`
      student_id,
      total_xp,
      current_level,
      streak_days,
      profiles!inner (
        full_name,
        display_name,
        avatar_url
      )
    `)
    .order('total_xp', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((entry, index) => {
    const profile = entry.profiles as unknown as {
      full_name: string
      display_name: string | null
      avatar_url: string | null
    }
    return {
      rank: index + 1,
      student_id: entry.student_id,
      full_name: profile.full_name,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      total_xp: entry.total_xp,
      current_level: entry.current_level,
      streak_days: entry.streak_days,
    }
  })
}
