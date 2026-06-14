import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are an education platform analyst for EnglishForge, a gamified children's English learning platform. Analyze the provided platform data and generate a comprehensive report with:

1. **Platform Health Summary** - Overall status, growth trends
2. **Student Engagement Analysis** - Active rate, XP trends, at-risk indicators
3. **Content & Curriculum Insights** - Course utilization, quiz completion rates
4. **Revenue & Subscription Analysis** - MRR trends, plan distribution
5. **Actionable Recommendations** - 3-5 specific steps to improve outcomes

Keep the tone professional but accessible. Use bullet points. Be specific with numbers.`

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

  const { provider, studentData } = await request.json()
  if (!studentData) {
    return NextResponse.json({ error: 'Missing student data' }, { status: 400 })
  }

  const userMessage = `Here is the current platform data for EnglishForge:\n\n${JSON.stringify(studentData, null, 2)}\n\nGenerate a detailed platform health report.`

  try {
    let report: string

    if (provider === 'anthropic') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment variables' }, { status: 500 })

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `Anthropic API error: ${res.status}`, details: err }, { status: 500 })
      }

      const data = await res.json()
      report = data.content?.[0]?.text || 'No response from Claude'
    } else {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not set in environment variables' }, { status: 500 })

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 1500,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ error: `OpenAI API error: ${res.status}`, details: err }, { status: 500 })
      }

      const data = await res.json()
      report = data.choices?.[0]?.message?.content || 'No response from OpenAI'
    }

    return NextResponse.json({ report })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
