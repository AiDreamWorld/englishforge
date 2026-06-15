import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are an expert curriculum designer for EnglishForge, a children's English learning platform.

Your job: convert raw PDF text into a structured course with sections and lessons.

RULES:
- Identify natural chapter/day/unit/topic breaks → make them SECTIONS
- Within each section, create individual LESSONS, LABS, QUIZZES, READINGS, and RESOURCES
- A LESSON teaches a concept (explanation, examples, theory)
- A READING is an annotated text extract or reading comprehension activity
- A LAB is a hands-on writing/creative task the student submits (teacher grades)
- A QUIZ is a knowledge checkpoint (questions about the content)
- A RESOURCE is a cheat sheet, reference card, or template
- Aim for 3-8 items per section
- Write real HTML content for each item using <h2>, <p>, <ul>, <li>, <strong>, <em>, <blockquote>, <ol>, <table>
- Content should be educational and engaging for children ages 8-16
- Each lesson should be self-contained and meaningful
- Include XP rewards (15-50 based on difficulty) and duration in minutes (5-45)
- Mark the very first lesson as is_preview: true so students can try before enrolling

RESPOND WITH VALID JSON ONLY. No markdown, no explanation. Just the JSON object:

{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "skills": ["skill1", "skill2", "skill3"],
  "tags": ["tag1", "tag2"],
  "age_group": "8-10" | "11-13" | "14-16",
  "sections": [
    {
      "title": "Section 1: Section Name",
      "order": 1,
      "items": [
        {
          "title": "Item Title",
          "description": "One-line description",
          "content": "<h2>Title</h2><p>Full HTML content here...</p>",
          "lesson_type": "lesson" | "reading" | "lab" | "quiz" | "exam" | "resource",
          "duration_minutes": 15,
          "xp_reward": 20,
          "is_preview": false
        }
      ]
    }
  ]
}`

export async function POST(request: Request) {
  let supabase;
  try {
    supabase = await createClient()
  } catch {
    return NextResponse.json({ error: 'Failed to create Supabase client' }, { status: 500 })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized - please log in', details: authError?.message }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found', details: profileError?.message, userId: user.id }, { status: 403 })
  }

  if (!['admin', 'super_admin', 'teacher'].includes(profile.role)) {
    return NextResponse.json({ error: `Forbidden - role "${profile.role}" cannot create courses`, role: profile.role }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File | null
    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>
    const pdfData = await pdfParse(buffer)
    const pdfText = pdfData.text

    if (!pdfText || pdfText.trim().length < 100) {
      return NextResponse.json({ error: 'PDF has too little text content' }, { status: 400 })
    }

    // Truncate to ~60k chars to stay within Claude's context
    const truncatedText = pdfText.slice(0, 60000)

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Convert this PDF content into a structured course. The PDF has ${pdfData.numpages} pages.\n\n--- PDF CONTENT START ---\n${truncatedText}\n--- PDF CONTENT END ---`,
        }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Claude API error: ${res.status}`, details: err }, { status: 500 })
    }

    const data = await res.json()
    const responseText = data.content?.[0]?.text || ''

    // Parse the JSON from Claude's response
    let courseData
    try {
      // Try to extract JSON from the response (Claude sometimes wraps in ```json)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      courseData = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ error: 'Failed to parse Claude response as JSON', raw: responseText }, { status: 500 })
    }

    // Validate structure
    if (!courseData.title || !courseData.sections || !Array.isArray(courseData.sections)) {
      return NextResponse.json({ error: 'Invalid course structure from AI', data: courseData }, { status: 500 })
    }

    // Create the course in Supabase
    const slug = courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const totalItems = courseData.sections.reduce((s: number, sec: { items: unknown[] }) => s + sec.items.length, 0)
    const totalDuration = courseData.sections.reduce((s: number, sec: { items: { duration_minutes: number }[] }) =>
      s + sec.items.reduce((s2: number, item: { duration_minutes: number }) => s2 + (item.duration_minutes || 0), 0), 0)

    const { data: course, error: courseError } = await supabase.from('courses').insert({
      title: courseData.title,
      slug,
      description: courseData.description,
      skills: courseData.skills || [],
      tags: courseData.tags || [],
      age_group: [courseData.age_group || '11-13'],
      teacher_id: user.id,
      status: 'draft',
      is_free: true,
      total_lessons: totalItems,
      total_duration_minutes: totalDuration,
    }).select().single()

    if (courseError) {
      return NextResponse.json({ error: 'Failed to create course', details: courseError.message }, { status: 500 })
    }

    // Insert all lessons
    let orderIndex = 0
    const lessonInserts = []

    for (const section of courseData.sections) {
      for (const item of section.items) {
        orderIndex++
        lessonInserts.push({
          course_id: course.id,
          title: item.title,
          description: item.description || null,
          content: item.content || null,
          lesson_type: item.lesson_type || 'lesson',
          section_title: section.title,
          section_order: section.order || 1,
          order_index: orderIndex,
          duration_minutes: item.duration_minutes || 10,
          xp_reward: item.xp_reward || 20,
          is_preview: item.is_preview || false,
          status: 'draft',
        })
      }
    }

    const { error: lessonsError } = await supabase.from('lessons').insert(lessonInserts)

    if (lessonsError) {
      return NextResponse.json({ error: 'Course created but lessons failed', courseId: course.id, details: lessonsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      courseId: course.id,
      title: courseData.title,
      sections: courseData.sections.length,
      totalItems,
      message: `Course "${courseData.title}" created with ${courseData.sections.length} sections and ${totalItems} items!`,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to process PDF', details: message }, { status: 500 })
  }
}
