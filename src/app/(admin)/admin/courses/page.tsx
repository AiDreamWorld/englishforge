'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import {
  Search, BookOpen, Users, Star, Eye, Archive, CheckCircle,
  Lightbulb, Layers, Plus, Edit, Trash2, Send
} from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Published courses are visible to all students. Draft courses are only visible to the teacher.',
  'Archive courses that are outdated — they stay in the database but hide from students.',
  'Admins can create courses too! Click "Create Course", then use the Course Builder to add sections and lessons.',
  'Publishing a course also publishes all its lessons automatically.',
  'Each course is linked to a teacher — if you suspend a teacher, their courses stay but cannot be edited.',
]

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  total_lessons: number
  enrolled_count: number
  rating: number
  is_free: boolean
  total_duration_minutes: number
  created_at: string
  teacher: { full_name: string } | null
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('courses')
      .select('id, title, slug, description, status, total_lessons, enrolled_count, rating, is_free, total_duration_minutes, created_at, teacher:profiles!teacher_id(full_name)')
      .order('created_at', { ascending: false })
    setCourses((data || []).map(c => ({ ...c, teacher: Array.isArray(c.teacher) ? c.teacher[0] : c.teacher })) as Course[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const createCourse = async () => {
    if (!newTitle.trim()) { toast.error('Title required'); return }
    setCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)
    const { data, error } = await supabase.from('courses').insert({
      title: newTitle, slug, teacher_id: user.id, status: 'draft', is_free: true,
    }).select().single()
    if (error) { toast.error('Failed: ' + error.message); setCreating(false); return }
    toast.success('Course created! Opening editor...')
    router.push(`/teacher/courses/${data.id}/edit`)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    if (status === 'published') {
      await supabase.from('lessons').update({ status: 'published' }).eq('course_id', id)
    }
    await supabase.from('courses').update({ status }).eq('id', id)
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    toast.success(`Course ${status}!`)
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its lessons?')) return
    const supabase = createClient()
    await supabase.from('lessons').delete().eq('course_id', id)
    await supabase.from('courses').delete().eq('id', id)
    setCourses(prev => prev.filter(c => c.id !== id))
    toast.success('Deleted')
  }

  const filtered = courses
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => c.title?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <LoadingSpinner />

  const published = courses.filter(c => c.status === 'published').length
  const draft = courses.filter(c => c.status === 'draft').length
  const totalEnrolled = courses.reduce((s, c) => s + (c.enrolled_count || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">📚 Course Management</h1>
          <p className="text-sm text-foreground/50">Create, edit, publish, and manage all courses</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-primary to-indigo-600">
          <Plus size={16} className="mr-2" /> Create Course
        </Button>
      </div>

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tip}</p>
      </div>

      {/* Create Course */}
      {showCreate && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <input
              className="flex-1 rounded-xl border border-border bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Course title, e.g. 'Character Development for Story Writing'"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createCourse()}
              autoFocus
            />
            <Button onClick={createCourse} disabled={creating}>{creating ? 'Creating...' : 'Create & Edit'}</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

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

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === f ? 'bg-primary text-white' : 'bg-surface border border-border hover:border-primary/30'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg font-bold text-foreground/60">No courses found</p>
            <p className="text-sm text-foreground/40">Create your first course to get started!</p>
          </CardContent></Card>
        ) : filtered.map(c => (
          <Card key={c.id} className="hover:border-primary/20 transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                📚
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate">{c.title}</p>
                  <Badge variant={c.status === 'published' ? 'success' : c.status === 'draft' ? 'accent' : 'secondary'}>
                    {c.status}
                  </Badge>
                  {c.is_free && <Badge variant="outline" className="text-green-600 border-green-300">Free</Badge>}
                </div>
                <p className="text-xs text-foreground/50 mt-0.5">
                  by {c.teacher?.full_name || 'Unknown'} &middot; {c.total_lessons || 0} lessons &middot; {c.total_duration_minutes || 0}m &middot; {c.enrolled_count || 0} enrolled
                  {c.rating > 0 && <> &middot; <Star size={10} className="inline text-amber-500" /> {c.rating.toFixed(1)}</>}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => router.push(`/courses/${c.slug}`)} title="Preview">
                  <Eye size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/teacher/courses/${c.id}/edit`)} title="Edit">
                  <Edit size={14} />
                </Button>
                {c.status === 'draft' && (
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => updateStatus(c.id, 'published')} title="Publish">
                    <Send size={14} />
                  </Button>
                )}
                {c.status === 'published' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'archived')} title="Archive">
                    <Archive size={14} />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteCourse(c.id)} title="Delete">
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
