import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { assessmentId, answers, score, totalPoints, timeTakenSeconds } = await request.json()
  if (!assessmentId) {
    return NextResponse.json({ error: 'Missing assessment ID' }, { status: 400 })
  }

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
  const passed = percentage >= 70

  const { data: existingAttempts } = await supabase
    .from('assessment_attempts')
    .select('attempt_number')
    .eq('assessment_id', assessmentId)
    .eq('student_id', user.id)
    .order('attempt_number', { ascending: false })
    .limit(1)

  const attemptNumber = (existingAttempts?.[0]?.attempt_number || 0) + 1

  await supabase.from('assessment_attempts').insert({
    assessment_id: assessmentId,
    student_id: user.id,
    answers,
    score,
    total_points: totalPoints,
    percentage,
    passed,
    time_taken_seconds: timeTakenSeconds,
    attempt_number: attemptNumber,
    completed_at: new Date().toISOString(),
  })

  let xpEarned = 0
  let coinsEarned = 0

  if (passed) {
    xpEarned = percentage === 100 ? 200 : 100
    coinsEarned = percentage === 100 ? 50 : 25

    const { data: stats } = await supabase
      .from('student_stats')
      .select('total_xp, coins, total_quizzes_taken')
      .eq('student_id', user.id)
      .single()

    if (stats) {
      await supabase.from('student_stats').update({
        total_xp: stats.total_xp + xpEarned,
        coins: stats.coins + coinsEarned,
        total_quizzes_taken: stats.total_quizzes_taken + 1,
      }).eq('student_id', user.id)
    }
  }

  await supabase.from('activity_log').insert({
    user_id: user.id,
    event_type: passed ? 'quiz_passed' : 'quiz_failed',
    entity_type: 'assessment',
    entity_id: assessmentId,
    metadata: { score, percentage, attempt_number: attemptNumber, xp_earned: xpEarned },
  })

  return NextResponse.json({ passed, percentage, xpEarned, coinsEarned, attemptNumber })
}
