'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  BookOpen, Clock, Star, Users, Play, Lock, CheckCircle,
  ChevronDown, ChevronRight, FileText, FlaskConical, ClipboardCheck,
  GraduationCap, Download, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CourseData {
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
  tags: string[]
  teacher: { full_name: string; avatar_url: string | null } | null
}

interface LessonItem {
  id: string
  title: string
  description: string | null
  duration_minutes: number
  order_index: number
  is_preview: boolean
  lesson_type: string | null
  section_title: string | null
  section_order: number
}

const typeConfig: Record<string, { icon: typeof BookOpen; color: string; label: string; emoji: string }> = {
  lesson: { icon: FileText, color: 'text-blue-600 bg-blue-100', label: 'Lesson', emoji: '📖' },
  reading: { icon: BookOpen, color: 'text-indigo-600 bg-indigo-100', label: 'Reading', emoji: '📚' },
  lab: { icon: FlaskConical, color: 'text-purple-600 bg-purple-100', label: 'Lab', emoji: '🧪' },
  quiz: { icon: ClipboardCheck, color: 'text-amber-600 bg-amber-100', label: 'Quiz', emoji: '📝' },
  exam: { icon: GraduationCap, color: 'text-red-600 bg-red-100', label: 'Exam', emoji: '🎓' },
  resource: { icon: Download, color: 'text-green-600 bg-green-100', label: 'Resource', emoji: '📎' },
}

const sectionEmojis = ['🌟', '🚀', '🎯', '💡', '🔥', '⚡', '🏆', '💎']

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<CourseData | null>(null)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [enrolled, setEnrolled] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

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
      setCourse(courseData as unknown as CourseData)

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, title, description, duration_minutes, order_index, is_preview, lesson_type, section_title, section_order')
        .eq('course_id', courseData.id)
        .order('section_order', { ascending: true })
        .order('order_index', { ascending: true })
      setLessons(lessonData || [])

      const sections = new Set((lessonData || []).map(l => l.section_title || 'General').filter(Boolean))
      setExpandedSections(sections)

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  if (loading) return <LoadingSpinner />
  if (!course) return <EmptyState title="Course not found" description="This course doesn't exist." />

  const progressPct = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0

  // Group lessons by section
  const sections: { title: string; order: number; items: LessonItem[] }[] = []
  const sectionMap = new Map<string, LessonItem[]>()
  const sectionOrders = new Map<string, number>()

  lessons.forEach(l => {
    const sec = l.section_title || 'General'
    if (!sectionMap.has(sec)) {
      sectionMap.set(sec, [])
      sectionOrders.set(sec, l.section_order || 0)
    }
    sectionMap.get(sec)!.push(l)
  })

  sectionMap.forEach((items, title) => {
    sections.push({ title, order: sectionOrders.get(title) || 0, items })
  })
  sections.sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Course Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
          <div className="absolute top-0 right-0 opacity-10 text-[120px] leading-none">📚</div>
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-3">
              {course.tags?.map(t => (
                <span key={t} className="text-xs font-bold uppercase bg-white/20 px-3 py-1 rounded-full">{t}</span>
              ))}
              {course.is_free && (
                <span className="text-xs font-bold uppercase bg-green-400/30 px-3 py-1 rounded-full">✨ Free</span>
              )}
            </div>
            <h1 className="text-4xl font-display font-extrabold">{course.title}</h1>
            <p className="mt-3 text-white/80 max-w-2xl text-lg">{course.description}</p>

            {course.teacher && (
              <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-full px-4 py-2 w-fit">
                <GraduationCap className="h-4 w-4" />
                <span className="text-sm font-bold">by {course.teacher.full_name}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-5 text-sm">
              <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-bold">{course.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
                <Clock className="h-4 w-4" />
                <span className="font-bold">{course.total_duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
                <Users className="h-4 w-4" />
                <span className="font-bold">{course.enrolled_count} enrolled</span>
              </div>
              {course.rating > 0 && (
                <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{course.rating.toFixed(1)} ({course.rating_count})</span>
                </div>
              )}
            </div>

            {course.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {course.skills.map(s => (
                  <span key={s} className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">🎯 {s}</span>
                ))}
              </div>
            )}

            <div className="mt-6">
              {enrolled ? (
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">Your Progress</span>
                    <span className="font-bold">{progressPct}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-xs text-white/60">{completedLessons.length} of {lessons.length} completed</p>
                </div>
              ) : (
                <Button
                  onClick={handleEnroll}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-extrabold text-lg px-8"
                >
                  {course.is_free ? '✨ Enroll Free' : '🚀 Enroll Now'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Content - Sections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-display font-extrabold flex items-center gap-2">
          📋 Course Content
          <span className="text-sm font-normal text-foreground/40 ml-2">
            {sections.length} sections • {lessons.length} items
          </span>
        </h2>

        {sections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-bold text-foreground/60">No content yet</p>
              <p className="text-sm text-foreground/40">Lessons are being prepared. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, sIdx) => {
            const isExpanded = expandedSections.has(section.title)
            const sectionCompleted = section.items.filter(l => completedLessons.includes(l.id)).length
            const emoji = sectionEmojis[sIdx % sectionEmojis.length]

            return (
              <Card key={section.title} className="overflow-hidden border-2 hover:border-primary/10 transition-colors">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-surface transition-colors text-left"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-extrabold text-lg">
                      {section.title}
                    </h3>
                    <p className="text-xs text-foreground/40">
                      {section.items.length} items • {section.items.reduce((s, l) => s + (l.duration_minutes || 0), 0)} min
                      {enrolled && ` • ${sectionCompleted}/${section.items.length} done`}
                    </p>
                  </div>
                  {enrolled && (
                    <div className="hidden sm:block w-20">
                      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${section.items.length ? (sectionCompleted / section.items.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-foreground/30 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-foreground/30 flex-shrink-0" />
                  )}
                </button>

                {/* Section Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                      {section.items.map((lesson, i) => {
                        const completed = completedLessons.includes(lesson.id)
                        const accessible = enrolled || lesson.is_preview
                        const type = typeConfig[lesson.lesson_type || 'lesson'] || typeConfig.lesson
                        const TypeIcon = type.icon

                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => accessible && router.push(`/courses/${course.slug}/lesson/${lesson.id}`)}
                            className={`flex items-center gap-4 px-6 py-4 border-b border-border/30 last:border-0 transition-all ${
                              accessible ? 'cursor-pointer hover:bg-primary/5' : 'opacity-40'
                            } ${completed ? 'bg-green-50/50' : ''}`}
                          >
                            {/* Status/Type Icon */}
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              completed ? 'bg-green-100' : type.color
                            }`}>
                              {completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : accessible ? (
                                <TypeIcon className="h-5 w-5" />
                              ) : (
                                <Lock className="h-4 w-4 text-foreground/30" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{type.emoji}</span>
                                <p className={`font-bold text-sm ${completed ? 'text-green-700' : ''}`}>
                                  {lesson.title}
                                </p>
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-foreground/40 mt-0.5 truncate">{lesson.description}</p>
                              )}
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {type.label}
                              </Badge>
                              {lesson.duration_minutes > 0 && (
                                <span className="text-xs text-foreground/30 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {lesson.duration_minutes}m
                                </span>
                              )}
                              {lesson.is_preview && !enrolled && (
                                <Badge variant="accent" className="text-[10px]">Preview</Badge>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
