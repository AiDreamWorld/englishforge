'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Plus, BookOpen, Users, Edit, Trash2, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  slug: string
  status: string
  total_lessons: number
  enrolled_count: number
  rating: number
  created_at: string
}

export default function TeacherCoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('courses')
        .select('id, title, slug, status, total_lessons, enrolled_count, rating, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
      setCourses(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course?')) return
    const supabase = createClient()
    await supabase.from('courses').delete().eq('id', id)
    setCourses(prev => prev.filter(c => c.id !== id))
    toast.success('Course deleted')
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">My Courses</h1>
        <Button onClick={() => router.push('/teacher/courses/new')}>
          <Plus size={16} className="mr-2" /> New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Create your first course to get started!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'accent' : 'outline'}>
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-foreground/60 mb-4">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {course.total_lessons}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {course.enrolled_count}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}>
                      <Edit size={14} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => router.push(`/courses/${course.slug}`)}>
                      <Eye size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(course.id)}>
                      <Trash2 size={14} />
                    </Button>
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
