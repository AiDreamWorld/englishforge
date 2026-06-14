import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/client'
import { explainPrompt } from '@/lib/openai/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { concept, level } = await request.json()
  if (!concept) {
    return NextResponse.json({ error: 'Missing concept' }, { status: 400 })
  }

  const explanation = await generateCompletion(explainPrompt(concept, level || 1))

  return NextResponse.json({ explanation })
}
