import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lessonId, courseId, timeSpentSeconds } = await request.json()
  if (!lessonId || !courseId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await supabase.from('student_progress').upsert({
    student_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    completed: true,
    completion_percentage: 100,
    time_spent_seconds: timeSpentSeconds || 0,
    completed_at: new Date().toISOString(),
  })

  const { data: stats } = await supabase
    .from('student_stats')
    .select('total_xp, current_level, coins, total_lessons_completed, total_time_minutes')
    .eq('student_id', user.id)
    .single()

  if (stats) {
    await supabase.from('student_stats').update({
      total_xp: stats.total_xp + 50,
      coins: stats.coins + 10,
      total_lessons_completed: stats.total_lessons_completed + 1,
      total_time_minutes: stats.total_time_minutes + Math.floor((timeSpentSeconds || 0) / 60),
    }).eq('student_id', user.id)
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    event_type: 'lesson_completed',
    entity_type: 'lesson',
    entity_id: lessonId,
    metadata: { course_id: courseId, xp_earned: 50, coins_earned: 10 },
  })

  return NextResponse.json({ success: true, xp_earned: 50, coins_earned: 10 })
}
