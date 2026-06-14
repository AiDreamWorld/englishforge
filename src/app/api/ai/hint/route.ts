import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/client'
import { hintPrompt } from '@/lib/openai/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionText, wrongAnswer, ageGroup } = await request.json()
  if (!questionText || !wrongAnswer) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const hint = await generateCompletion(hintPrompt(questionText, wrongAnswer, ageGroup || '8-10'))

  return NextResponse.json({ hint })
}
