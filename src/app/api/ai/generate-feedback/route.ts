import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/client'
import { feedbackPrompt } from '@/lib/openai/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { studentAnswer, correctAnswer, context } = await request.json()
  if (!studentAnswer || !correctAnswer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const raw = await generateCompletion(feedbackPrompt(studentAnswer, correctAnswer, context || ''))

  try {
    const feedback = JSON.parse(raw)
    return NextResponse.json(feedback)
  } catch {
    return NextResponse.json({ score: 0, feedback: raw })
  }
}
