import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: stats } = await supabase
    .from('student_stats')
    .select('streak_days, longest_streak, last_activity_date')
    .eq('student_id', user.id)
    .single()

  if (!stats) return NextResponse.json({ error: 'Stats not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  if (stats.last_activity_date === today) {
    return NextResponse.json({ streak: stats.streak_days, isNew: false })
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = stats.last_activity_date === yesterdayStr ? stats.streak_days + 1 : 1
  const longestStreak = Math.max(newStreak, stats.longest_streak)

  await supabase.from('student_stats').update({
    streak_days: newStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
  }).eq('student_id', user.id)

  return NextResponse.json({ streak: newStreak, isNew: newStreak > stats.longest_streak })
}
