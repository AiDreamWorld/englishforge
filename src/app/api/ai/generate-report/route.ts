import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCompletion } from '@/lib/openai/client'
import { monthlyReportPrompt } from '@/lib/openai/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { studentData, targetId, reportMonth } = await request.json()
  if (!studentData) {
    return NextResponse.json({ error: 'Missing student data' }, { status: 400 })
  }

  const raw = await generateCompletion(monthlyReportPrompt(JSON.stringify(studentData)), {
    model: 'gpt-4o',
    maxTokens: 1500,
  })

  try {
    const insights = JSON.parse(raw)

    await supabase.from('ai_reports').upsert({
      report_type: 'student_monthly',
      report_month: reportMonth || new Date().toISOString().slice(0, 10),
      target_id: targetId,
      insights,
      recommendations: insights.recommendations || [],
    })

    return NextResponse.json({ insights })
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 })
  }
}
