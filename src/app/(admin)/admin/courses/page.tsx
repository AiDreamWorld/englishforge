'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BookOpen, Users, Star, Archive, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  status: string
  total_lessons: number
  enrolled_count: number
  rating: number
  teacher: { full_name: string } | null
  created_at: string
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('courses')
        .select('id, title, status, total_lessons, enrolled_count, rating, created_at, teacher:profiles!teacher_id(full_name)')
        .order('created_at', { ascending: false })
      setCourses((data || []) as unknown as Course[])
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

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">All Courses ({courses.length})</h1>
      <div className="space-y-2">
        {courses.map(c => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{c.title}</p>
                <p className="text-xs text-foreground/50">by {c.teacher?.full_name || 'Unknown'} · {c.total_lessons} lessons · {c.enrolled_count} students</p>
              </div>
              <div className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-500" /> {c.rating.toFixed(1)}</div>
              <Badge variant={c.status === 'published' ? 'success' : c.status === 'draft' ? 'accent' : 'secondary'}>{c.status}</Badge>
              <div className="flex gap-1">
                {c.status !== 'published' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, 'published')}><Send size={14} /></Button>
                )}
                {c.status !== 'archived' && (
                  <Button size="sm" variant="ghost" onClick={() => updateStatus(c.id, 'archived')}><Archive size={14} /></Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
