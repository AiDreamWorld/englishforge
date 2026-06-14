'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, Video, Trash2, Calendar, Users, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface LiveClass {
  id: string
  title: string
  description: string | null
  meeting_url: string | null
  scheduled_at: string
  duration_minutes: number
  max_students: number
  status: string
}

export default function TeacherLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', meeting_url: '', scheduled_at: '', duration_minutes: 60, max_students: 30 })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('live_classes').select('*').eq('teacher_id', user.id).order('scheduled_at', { ascending: false })
      setClasses((data || []) as LiveClass[])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.scheduled_at) { toast.error('Title and date required'); return }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('live_classes').insert({
      ...form,
      teacher_id: user.id,
      meeting_url: form.meeting_url || null,
      description: form.description || null,
    }).select().single()
    if (error) { toast.error('Failed to create'); return }
    setClasses(prev => [data as LiveClass, ...prev])
    setForm({ title: '', description: '', meeting_url: '', scheduled_at: '', duration_minutes: 60, max_students: 30 })
    setShowForm(false)
    toast.success('Live class scheduled!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    const supabase = createClient()
    await supabase.from('live_classes').delete().eq('id', id)
    setClasses(prev => prev.filter(c => c.id !== id))
    toast.success('Deleted')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Live Classes</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" /> Schedule Class</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Schedule Live Class</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <textarea className="w-full rounded-xl border border-border bg-surface p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30" rows={2} placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Input label="Meeting URL (Zoom/Google Meet)" value={form.meeting_url} onChange={e => setForm(p => ({ ...p, meeting_url: e.target.value }))} placeholder="https://zoom.us/j/..." />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))} />
              <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
              <Input label="Max Students" type="number" value={form.max_students} onChange={e => setForm(p => ({ ...p, max_students: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Schedule</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 ? (
        <EmptyState title="No live classes" description="Schedule your first live class!" />
      ) : (
        <div className="space-y-3">
          {classes.map(c => {
            const isUpcoming = new Date(c.scheduled_at) > new Date()
            return (
              <Card key={c.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUpcoming ? 'bg-success/10' : 'bg-foreground/5'}`}>
                    <Video size={20} className={isUpcoming ? 'text-success' : 'text-foreground/30'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{c.title}</p>
                    <div className="flex gap-3 text-xs text-foreground/50">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(c.scheduled_at).toLocaleString()}</span>
                      <span>{c.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><Users size={12} /> Max {c.max_students}</span>
                    </div>
                  </div>
                  <Badge variant={isUpcoming ? 'success' : 'accent'}>{isUpcoming ? 'Upcoming' : 'Past'}</Badge>
                  {c.meeting_url && (
                    <a href={c.meeting_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline"><ExternalLink size={14} className="mr-1" /> Join</Button>
                    </a>
                  )}
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
