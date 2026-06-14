'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search, Ban, CheckCircle, Users, BookOpen, FileQuestion, Video, Lightbulb, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Teachers with the most courses tend to have the highest student engagement.',
  'Encourage teachers to create at least 1 quiz per course for better learning outcomes.',
  'Review teacher accounts monthly — inactive teachers may have orphaned courses.',
  'Teachers can schedule live classes via Zoom or Google Meet from their panel.',
  'Suspended teachers lose access to their panel but their courses remain visible.',
]

interface Teacher {
  id: string
  full_name: string
  email: string
  status: string
  created_at: string
  last_seen_at: string | null
  courseCount: number
  assessmentCount: number
  liveClassCount: number
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, status, created_at, last_seen_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })

      const ids = (profiles || []).map(p => p.id)
      let courseMap = new Map<string, number>()
      let assessmentMap = new Map<string, number>()
      let liveMap = new Map<string, number>()

      if (ids.length) {
        const { data: courses } = await supabase.from('courses').select('teacher_id').in('teacher_id', ids)
        ;(courses || []).forEach(c => courseMap.set(c.teacher_id, (courseMap.get(c.teacher_id) || 0) + 1))

        const { data: assessments } = await supabase.from('assessments').select('teacher_id').in('teacher_id', ids)
        ;(assessments || []).forEach(a => assessmentMap.set(a.teacher_id, (assessmentMap.get(a.teacher_id) || 0) + 1))

        const { data: live } = await supabase.from('live_classes').select('teacher_id').in('teacher_id', ids)
        ;(live || []).forEach(l => liveMap.set(l.teacher_id, (liveMap.get(l.teacher_id) || 0) + 1))
      }

      setTeachers((profiles || []).map(p => ({
        ...p,
        courseCount: courseMap.get(p.id) || 0,
        assessmentCount: assessmentMap.get(p.id) || 0,
        liveClassCount: liveMap.get(p.id) || 0,
      })))
      setLoading(false)
    }
    load()
  }, [])

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'suspended' : 'active'
    const supabase = createClient()
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast.success(`Teacher ${newStatus}`)
  }

  const filtered = teachers.filter(t =>
    t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  const totalCourses = teachers.reduce((s, t) => s + t.courseCount, 0)
  const totalAssessments = teachers.reduce((s, t) => s + t.assessmentCount, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Teachers ({teachers.length})</h1>
        <p className="text-sm text-foreground/50">Manage teacher accounts. Teachers can create courses, quizzes, assignments, and schedule live classes.</p>
      </div>

      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-700">{tip}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center"><GraduationCap className="h-4 w-4 text-emerald-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{teachers.length}</p><p className="text-xs text-foreground/50">Teachers</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><BookOpen className="h-4 w-4 text-blue-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{totalCourses}</p><p className="text-xs text-foreground/50">Courses Created</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center"><FileQuestion className="h-4 w-4 text-purple-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{totalAssessments}</p><p className="text-xs text-foreground/50">Assessments</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-100 flex items-center justify-center"><Video className="h-4 w-4 text-rose-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{teachers.reduce((s, t) => s + t.liveClassCount, 0)}</p><p className="text-xs text-foreground/50">Live Classes</p></div>
        </CardContent></Card>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-foreground/50">No teachers found.</CardContent></Card>
        ) : filtered.map(t => (
          <Card key={t.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                {t.full_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.full_name}</p>
                <p className="text-xs text-foreground/50">{t.email}</p>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-xs text-foreground/60">
                <span className="flex items-center gap-1"><BookOpen size={12} /> {t.courseCount} courses</span>
                <span className="flex items-center gap-1"><FileQuestion size={12} /> {t.assessmentCount} quizzes</span>
                <span className="flex items-center gap-1"><Video size={12} /> {t.liveClassCount} classes</span>
              </div>
              <div className="text-xs text-foreground/40">
                {t.last_seen_at ? `Seen ${new Date(t.last_seen_at).toLocaleDateString()}` : 'Never'}
              </div>
              <Badge variant={t.status === 'active' ? 'success' : 'secondary'}>{t.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus(t.id, t.status)}>
                {t.status === 'active' ? <Ban size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
