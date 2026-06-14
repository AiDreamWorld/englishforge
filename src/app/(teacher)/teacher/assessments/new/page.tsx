'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'

type QuestionForm = {
  question_text: string
  question_type: string
  options: { text: string; is_correct: boolean }[]
  correct_answer: string
  explanation: string
  hint: string
  points: number
}

const emptyQuestion: QuestionForm = {
  question_text: '',
  question_type: 'multiple_choice',
  options: [
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ],
  correct_answer: '',
  explanation: '',
  hint: '',
  points: 1,
}

export default function NewAssessmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    assessment_type: 'quick_quiz',
    time_limit_minutes: 10,
    passing_score: 70,
    max_attempts: 3,
    xp_reward: 100,
    coin_reward: 25,
  })
  const [questions, setQuestions] = useState<QuestionForm[]>([{ ...emptyQuestion }])

  const addQuestion = () => setQuestions(prev => [...prev, { ...emptyQuestion, options: emptyQuestion.options.map(o => ({ ...o })) }])

  const updateQuestion = (idx: number, updates: Partial<QuestionForm>) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q))
  }

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const opts = q.options.map((o, j) => j === oIdx ? { ...o, text } : o)
      return { ...q, options: opts }
    }))
  }

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q
      const opts = q.options.map((o, j) => ({ ...o, is_correct: j === oIdx }))
      return { ...q, options: opts }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (questions.some(q => !q.question_text.trim())) { toast.error('All questions need text'); return }
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const totalPoints = questions.reduce((s, q) => s + q.points, 0)
    const { data: assessment } = await supabase.from('assessments').insert({
      ...form,
      teacher_id: user.id,
      total_questions: questions.length,
      total_points: totalPoints,
      status: 'draft',
    }).select('id').single()

    if (assessment) {
      await supabase.from('questions').insert(
        questions.map((q, i) => ({
          assessment_id: assessment.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'multiple_choice' ? q.options : [],
          correct_answer: q.question_type === 'true_false' ? q.correct_answer === 'true' : q.correct_answer || q.options.find(o => o.is_correct)?.text,
          explanation: q.explanation,
          hint: q.hint,
          points: q.points,
          order_index: i,
        }))
      )
      toast.success('Assessment created!')
      router.push('/teacher/assessments')
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold font-display">Create Assessment</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <textarea className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.assessment_type} onChange={e => setForm(p => ({ ...p, assessment_type: e.target.value }))}>
                  {['quick_quiz','practice','vocabulary_check','unit_test','skill_eval','progress_review','mid_level','comprehensive','end_of_level','certification'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <Input label="Time Limit (min)" type="number" value={form.time_limit_minutes} onChange={e => setForm(p => ({ ...p, time_limit_minutes: Number(e.target.value) }))} />
              <Input label="Passing Score (%)" type="number" value={form.passing_score} onChange={e => setForm(p => ({ ...p, passing_score: Number(e.target.value) }))} />
              <Input label="Max Attempts" type="number" value={form.max_attempts} onChange={e => setForm(p => ({ ...p, max_attempts: Number(e.target.value) }))} />
            </div>
          </CardContent>
        </Card>

        {questions.map((q, qi) => (
          <Card key={qi}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Question {qi + 1}</CardTitle>
              <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => removeQuestion(qi)}><Trash2 size={14} /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30" rows={2} placeholder="Question text" value={q.question_text} onChange={e => updateQuestion(qi, { question_text: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select className="w-full rounded-lg border border-border bg-surface p-2 text-sm" value={q.question_type} onChange={e => updateQuestion(qi, { question_type: e.target.value })}>
                    {['multiple_choice','true_false','fill_blank','short_answer','match_pairs','drag_drop','reorder','listen_choose','image_select'].map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <Input label="Points" type="number" value={q.points} onChange={e => updateQuestion(qi, { points: Number(e.target.value) })} />
              </div>

              {q.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Options (click radio to mark correct)</p>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${qi}`} checked={opt.is_correct} onChange={() => setCorrectOption(qi, oi)} />
                      <input className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none" placeholder={`Option ${oi + 1}`} value={opt.text} onChange={e => updateOption(qi, oi, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {q.question_type === 'true_false' && (
                <select className="w-full rounded-lg border border-border bg-surface p-2 text-sm" value={q.correct_answer} onChange={e => updateQuestion(qi, { correct_answer: e.target.value })}>
                  <option value="">Select correct answer</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              )}

              {['fill_blank', 'short_answer'].includes(q.question_type) && (
                <Input label="Correct Answer" value={q.correct_answer} onChange={e => updateQuestion(qi, { correct_answer: e.target.value })} />
              )}

              <Input label="Hint (optional)" value={q.hint} onChange={e => updateQuestion(qi, { hint: e.target.value })} placeholder="A helpful hint..." />
              <Input label="Explanation (optional)" value={q.explanation} onChange={e => updateQuestion(qi, { explanation: e.target.value })} placeholder="Why this is the correct answer..." />
            </CardContent>
          </Card>
        ))}

        <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
          <Plus size={16} className="mr-2" /> Add Question
        </Button>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}><Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Create Assessment'}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
