'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, FileQuestion, Edit, Trash2, Copy } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Assessment {
  id: string
  title: string
  assessment_type: string
  total_questions: number
  passing_score: number
  status: string
  created_at: string
}

export default function TeacherAssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('assessments')
        .select('id, title, assessment_type, total_questions, passing_score, status, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
      setAssessments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assessment?')) return
    const supabase = createClient()
    await supabase.from('assessments').delete().eq('id', id)
    setAssessments(prev => prev.filter(a => a.id !== id))
    toast.success('Assessment deleted')
  }

  const handleDuplicate = async (id: string) => {
    const supabase = createClient()
    const { data: original } = await supabase.from('assessments').select('*').eq('id', id).single()
    if (!original) return
    const { id: _, created_at: __, updated_at: ___, ...rest } = original
    const { data: newA } = await supabase.from('assessments').insert({ ...rest, title: `${original.title} (Copy)`, status: 'draft' }).select().single()
    if (newA) {
      const { data: questions } = await supabase.from('questions').select('*').eq('assessment_id', id)
      if (questions?.length) {
        await supabase.from('questions').insert(questions.map(({ id: _id, created_at: _c, ...q }) => ({ ...q, assessment_id: newA.id })))
      }
      setAssessments(prev => [newA as Assessment, ...prev])
      toast.success('Duplicated!')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Assessments</h1>
        <Button onClick={() => router.push('/teacher/assessments/new')}>
          <Plus size={16} className="mr-2" /> New Quiz
        </Button>
      </div>

      {assessments.length === 0 ? (
        <EmptyState title="No assessments yet" description="Create quizzes for your students!" />
      ) : (
        <div className="grid gap-4">
          {assessments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileQuestion size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-xs text-foreground/50">{a.assessment_type.replace('_', ' ')} · {a.total_questions} questions · Pass: {a.passing_score}%</p>
                  </div>
                  <Badge variant={a.status === 'published' ? 'success' : 'accent'}>{a.status}</Badge>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/teacher/assessments/${a.id}/edit`)}><Edit size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDuplicate(a.id)}><Copy size={14} /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
