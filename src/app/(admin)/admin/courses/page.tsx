'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search, BookOpen, Users, Star, Eye, Archive, CheckCircle, Lightbulb, Layers } from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Published courses are visible to all students. Draft courses are only visible to the teacher.',
  'Archive courses that are outdated — they stay in the database but hide from students.',
  'Courses with high enrollment and low completion may need content review.',
  'Encourage teachers to add at least 5 lessons per course for meaningful learning.',
  'Each course is linked to a teacher — if you suspend a teacher, their courses stay but cannot be edited.',
]

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  lesson_count: number
  enrolled_count: number
  rating: number
  created_at: string
  teacher: { full_name: string } | null
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, description, status, lesson_count, enrolled_count, rating, created_at, teacher:profiles!teacher_id(full_name)')
        .order('created_at', { ascending: false })
      setCourses((data || []).map(c => ({ ...c, teacher: Array.isArray(c.teacher) ? c.teacher[0] : c.teacher })) as Course[])
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('courses').update({ status }).eq('id', id)
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    toast.success(`Course ${status}`)
  }

  const filtered = courses
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSpinner />

  const published = courses.filter(c => c.status === 'published').length
  const draft = courses.filter(c => c.status === 'draft').length
  const archived = courses.filter(c => c.status === 'archived').length
  const totalEnrolled = courses.reduce((s, c) => s + (c.enrolled_count || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Courses ({courses.length})</h1>
        <p className="text-sm text-foreground/50">All courses created by teachers. You can publish, archive, or review any course.</p>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tip}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><BookOpen className="h-4 w-4 text-blue-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{courses.length}</p><p className="text-xs text-foreground/50">Total Courses</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-success" /></div>
          <div><p className="text-xl font-mono font-extrabold">{published}</p><p className="text-xs text-foreground/50">Published</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center"><Layers className="h-4 w-4 text-amber-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{draft}</p><p className="text-xs text-foreground/50">Drafts</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xl font-mono font-extrabold">{totalEnrolled}</p><p className="text-xs text-foreground/50">Total Enrollments</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-foreground/50">No courses found.</CardContent></Card>
        ) : filtered.map(c => (
          <Card key={c.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{c.title}</p>
                <p className="text-xs text-foreground/50">by {c.teacher?.full_name || 'Unknown'} &middot; {c.lesson_count || 0} lessons</p>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-xs text-foreground/60">
                <span className="flex items-center gap-1"><Users size={12} /> {c.enrolled_count || 0}</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-amber-500" /> {c.rating?.toFixed(1) || '—'}</span>
              </div>
              <Badge variant={c.status === 'published' ? 'success' : c.status === 'draft' ? 'accent' : 'secondary'}>
                {c.status}
              </Badge>
              <div className="flex gap-1">
                {c.status !== 'published' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, 'published')} title="Publish">
                    <Eye size={14} className="text-green-500" />
                  </Button>
                )}
                {c.status !== 'archived' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, 'archived')} title="Archive">
                    <Archive size={14} className="text-amber-500" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
