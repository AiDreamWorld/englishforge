'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { SparkyReaction } from '@/components/sparky/SparkyReaction'
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Lesson {
  id: string
  title: string
  content: string | null
  video_url: string | null
  audio_url: string | null
  duration_minutes: number
  order_index: number
  xp_reward: number
  course_id: string
  course: { slug: string; title: string; total_lessons: number }
}

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<{ id: string; order_index: number }[]>([])
  const [completed, setCompleted] = useState(false)
  const [showReaction, setShowReaction] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('lessons')
        .select('*, course:courses!course_id(slug, title, total_lessons)')
        .eq('id', params.lessonId)
        .single()

      if (data) {
        setLesson(data as unknown as Lesson)
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, order_index')
          .eq('course_id', data.course_id)
          .order('order_index')
        setAllLessons(lessons || [])

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: progress } = await supabase
            .from('student_progress')
            .select('completed')
            .eq('student_id', user.id)
            .eq('lesson_id', data.id)
            .single()
          setCompleted(progress?.completed || false)
        }
      }
      setLoading(false)
    }
    load()
  }, [params.lessonId])

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    await fetch('/api/student/complete-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lesson!.id, courseId: lesson!.course_id, timeSpentSeconds: timeSpent }),
    })
    setCompleted(true)
    setShowReaction(true)
    setTimeout(() => setShowReaction(false), 3000)
  }

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!lesson) return
    const idx = allLessons.findIndex(l => l.id === lesson.id)
    const target = direction === 'next' ? allLessons[idx + 1] : allLessons[idx - 1]
    if (target) router.push(`/courses/${lesson.course.slug}/lesson/${target.id}`)
  }

  if (loading) return <LoadingSpinner />
  if (!lesson) return <div className="p-8 text-center">Lesson not found</div>

  const currentIdx = allLessons.findIndex(l => l.id === lesson.id)
  const progressPct = allLessons.length > 0 ? Math.round(((currentIdx + 1) / allLessons.length) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {showReaction && <SparkyReaction type="correct" show={showReaction} onComplete={() => setShowReaction(false)} />}

      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/courses/${lesson.course.slug}`)} className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground">
          <ArrowLeft size={16} /> {lesson.course.title}
        </button>
        <div className="flex items-center gap-2 text-sm text-foreground/50">
          <Clock size={14} /> {lesson.duration_minutes} min
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-foreground/40">Lesson {currentIdx + 1} of {allLessons.length}</p>
        <Progress value={progressPct} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display">{lesson.title}</h1>
      </motion.div>

      {lesson.video_url && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe src={lesson.video_url} className="w-full h-full" allowFullScreen />
        </div>
      )}

      {lesson.audio_url && (
        <audio controls className="w-full" src={lesson.audio_url} />
      )}

      <Card>
        <CardContent className="p-6 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: lesson.content || '<p>No content available yet.</p>' }} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => navigateLesson('prev')} disabled={currentIdx === 0}>
          <ArrowLeft size={16} className="mr-2" /> Previous
        </Button>

        {!completed ? (
          <Button onClick={handleComplete} variant="success">
            <CheckCircle size={16} className="mr-2" /> Mark Complete (+50 XP)
          </Button>
        ) : (
          <span className="flex items-center gap-2 text-success font-medium">
            <CheckCircle size={16} /> Completed
          </span>
        )}

        <Button variant="outline" onClick={() => navigateLesson('next')} disabled={currentIdx === allLessons.length - 1}>
          Next <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  )
}
