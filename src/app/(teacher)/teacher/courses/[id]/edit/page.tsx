'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Plus, GripVertical, Trash2, Save, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  duration_minutes: number
  order_index: number
  status: string
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Record<string, unknown> | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', skills: '' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: c } = await supabase.from('courses').select('*').eq('id', params.id).single()
      if (c) {
        setCourse(c)
        setForm({ title: c.title, description: c.description || '', skills: (c.skills || []).join(', ') })
      }
      const { data: l } = await supabase.from('lessons').select('*').eq('course_id', params.id).order('order_index')
      setLessons((l || []) as Lesson[])
      setLoading(false)
    }
    load()
  }, [params.id])

  const saveCourse = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('courses').update({
      title: form.title,
      description: form.description,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      total_lessons: lessons.length,
    }).eq('id', params.id)
    toast.success('Saved!')
    setSaving(false)
  }

  const publishCourse = async () => {
    const supabase = createClient()
    await supabase.from('courses').update({ status: 'published' }).eq('id', params.id)
    setCourse(prev => prev ? { ...prev, status: 'published' } : prev)
    toast.success('Published!')
  }

  const addLesson = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('lessons').insert({
      course_id: params.id,
      title: `Lesson ${lessons.length + 1}`,
      order_index: lessons.length,
      status: 'draft',
    }).select().single()
    if (data) setLessons(prev => [...prev, data as Lesson])
  }

  const updateLesson = async (id: string, updates: Partial<Lesson>) => {
    const supabase = createClient()
    await supabase.from('lessons').update(updates).eq('id', id)
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const deleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return
    const supabase = createClient()
    await supabase.from('lessons').delete().eq('id', id)
    setLessons(prev => prev.filter(l => l.id !== id))
    toast.success('Lesson deleted')
  }

  if (loading) return <LoadingSpinner />
  if (!course) return <div className="p-8">Course not found</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Edit Course</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button onClick={saveCourse} disabled={saving}><Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save'}</Button>
          {(course as Record<string, string>).status === 'draft' && (
            <Button variant="success" onClick={publishCourse}><Send size={16} className="mr-2" /> Publish</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Course Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Input label="Skills" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lessons ({lessons.length})</CardTitle>
          <Button size="sm" onClick={addLesson}><Plus size={14} className="mr-1" /> Add Lesson</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="flex items-start gap-3 p-4 rounded-xl bg-surface-2">
              <GripVertical size={16} className="mt-2 text-foreground/30" />
              <div className="flex-1 space-y-2">
                <input className="w-full font-medium bg-transparent outline-none" value={lesson.title} onChange={e => updateLesson(lesson.id, { title: e.target.value })} />
                <textarea className="w-full text-sm bg-transparent outline-none resize-none" rows={2} placeholder="Lesson content (HTML supported)" value={lesson.content || ''} onChange={e => updateLesson(lesson.id, { content: e.target.value })} />
                <div className="flex gap-2">
                  <input type="number" className="w-20 text-xs rounded border border-border px-2 py-1 bg-surface" placeholder="Minutes" value={lesson.duration_minutes} onChange={e => updateLesson(lesson.id, { duration_minutes: Number(e.target.value) })} />
                  <Badge variant={lesson.status === 'published' ? 'success' : 'accent'}>{lesson.status}</Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteLesson(lesson.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {lessons.length === 0 && <p className="text-center text-foreground/50 py-4">No lessons yet. Click &quot;Add Lesson&quot; to start.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
