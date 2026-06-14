'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { QuizEngine } from '@/components/student/QuizEngine'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Assessment, Question } from '@/types/database.types'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: a } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', params.id)
        .single()
      if (!a) { setLoading(false); return }
      setAssessment(a as Assessment)

      const { data: q } = await supabase
        .from('questions')
        .select('*')
        .eq('assessment_id', a.id)
        .order('order_index')

      let questionList = (q || []) as Question[]
      if (a.shuffle_questions) questionList = questionList.sort(() => Math.random() - 0.5)
      setQuestions(questionList)
      setLoading(false)
    }
    load()
  }, [params.id])

  const handleComplete = async (answers: Record<string, string>, score: number, totalPoints: number) => {
    await fetch('/api/student/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: assessment!.id,
        answers,
        score,
        totalPoints,
        timeTakenSeconds: 0,
      }),
    })
  }

  if (loading) return <LoadingSpinner />
  if (!assessment) return <EmptyState title="Quiz not found" description="This quiz doesn't exist." />

  return (
    <div className="max-w-3xl mx-auto p-6">
      <QuizEngine
        questions={questions}
        timeLimitMinutes={assessment.time_limit_minutes}
        onComplete={handleComplete}
      />
    </div>
  )
}
