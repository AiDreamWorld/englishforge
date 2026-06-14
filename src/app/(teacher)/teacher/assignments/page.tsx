'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, FileText, Trash2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string | null
  max_score: number
  xp_reward: number
  created_at: string
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', due_date: '', max_score: 100, xp_reward: 75 })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('assignments').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false })
      setAssignments((data || []) as Assignment[])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.description) { toast.error('Title and description required'); return }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('assignments').insert({
      ...form,
      teacher_id: user.id,
      due_date: form.due_date || null,
    }).select().single()
    if (error) { toast.error('Failed to create'); return }
    setAssignments(prev => [data as Assignment, ...prev])
    setForm({ title: '', description: '', due_date: '', max_score: 100, xp_reward: 75 })
    setShowForm(false)
    toast.success('Assignment created!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    const supabase = createClient()
    await supabase.from('assignments').delete().eq('id', id)
    setAssignments(prev => prev.filter(a => a.id !== id))
    toast.success('Deleted')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Assignments</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" /> New Assignment</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
              <Input label="Max Score" type="number" value={form.max_score} onChange={e => setForm(p => ({ ...p, max_score: Number(e.target.value) }))} />
              <Input label="XP Reward" type="number" value={form.xp_reward} onChange={e => setForm(p => ({ ...p, xp_reward: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <EmptyState title="No assignments" description="Create assignments for your students." />
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><FileText size={20} className="text-accent" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-foreground/50 truncate">{a.description}</p>
                </div>
                {a.due_date && (
                  <div className="flex items-center gap-1 text-xs text-foreground/50"><Calendar size={12} /> {new Date(a.due_date).toLocaleDateString()}</div>
                )}
                <Badge variant="primary">{a.max_score} pts</Badge>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(a.id)}><Trash2 size={14} /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
