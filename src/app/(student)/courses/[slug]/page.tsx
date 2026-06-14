'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { BookOpen, Clock, Star, Users, Play, Lock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail_url: string | null
  intro_video_url: string | null
  is_free: boolean
  total_lessons: number
  total_duration_minutes: number
  enrolled_count: number
  rating: number
  rating_count: number
  skills: string[]
  teacher: { full_name: string; avatar_url: string | null } | null
}

interface Lesson {
  id: string
  title: string
  description: string
  duration_minutes: number
  order_index: number
  is_preview: boolean
  lesson_type: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: courseData } = await supabase
        .from('courses')
        .select('*, teacher:profiles!teacher_id(full_name, avatar_url)')
        .eq('slug', params.slug)
        .single()

      if (!courseData) { setLoading(false); return }
      setCourse(courseData as unknown as Course)

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, title, description, duration_minutes, order_index, is_preview, lesson_type')
        .eq('course_id', courseData.id)
        .order('order_index')
      setLessons(lessonData || [])

      if (user) {
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', courseData.id)
          .single()
        setEnrolled(!!enrollment)

        const { data: progress } = await supabase
          .from('student_progress')
          .select('lesson_id')
          .eq('student_id', user.id)
          .eq('course_id', courseData.id)
          .eq('completed', true)
        setCompletedLessons((progress || []).map(p => p.lesson_id))
      }
      setLoading(false)
    }
    load()
  }, [params.slug])

  const handleEnroll = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('enrollments').insert({ student_id: user.id, course_id: course!.id })
    setEnrolled(true)
  }

  if (loading) return <LoadingSpinner />
  if (!course) return <EmptyState title="Course not found" description="This course doesn't exist." />

  const progressPct = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20 p-8">
          <h1 className="text-3xl font-bold font-display">{course.title}</h1>
          <p className="mt-2 text-foreground/70 max-w-2xl">{course.description}</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-foreground/60">
            <span className="flex items-center gap-1"><BookOpen size={16} /> {course.total_lessons} lessons</span>
            <span className="flex items-center gap-1"><Clock size={16} /> {course.total_duration_minutes} min</span>
            <span className="flex items-center gap-1"><Users size={16} /> {course.enrolled_count} enrolled</span>
            <span className="flex items-center gap-1"><Star size={16} /> {course.rating.toFixed(1)} ({course.rating_count})</span>
          </div>
          {course.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {course.skills.map(s => <Badge key={s} variant="primary">{s}</Badge>)}
            </div>
          )}
          <div className="mt-6">
            {enrolled ? (
              <div className="space-y-2">
                <Progress value={progressPct} className="max-w-xs" />
                <p className="text-sm text-foreground/60">{progressPct}% complete</p>
              </div>
            ) : (
              <Button onClick={handleEnroll} size="lg">
                {course.is_free ? 'Enroll Free' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <Card>
        <CardHeader><CardTitle>Lessons</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {lessons.map((lesson, i) => {
            const completed = completedLessons.includes(lesson.id)
            const accessible = enrolled || lesson.is_preview
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => accessible && router.push(`/courses/${course.slug}/lesson/${lesson.id}`)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  accessible ? 'cursor-pointer hover:bg-primary/5' : 'opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  completed ? 'bg-success/20 text-success' : 'bg-surface-2 text-foreground/50'
                }`}>
                  {completed ? <CheckCircle size={20} /> : accessible ? <Play size={16} /> : <Lock size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{lesson.title}</p>
                  {lesson.description && <p className="text-sm text-foreground/50 truncate">{lesson.description}</p>}
                </div>
                <span className="text-xs text-foreground/40 whitespace-nowrap">{lesson.duration_minutes} min</span>
                {lesson.is_preview && !enrolled && <Badge variant="accent">Preview</Badge>}
              </motion.div>
            )
          })}
          {lessons.length === 0 && <EmptyState title="No lessons yet" description="Lessons are coming soon!" />}
        </CardContent>
      </Card>
    </div>
  )
}
