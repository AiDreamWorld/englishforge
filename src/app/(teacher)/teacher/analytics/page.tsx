'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Users, BookOpen, FileQuestion, TrendingUp } from 'lucide-react'

export default function TeacherAnalyticsPage() {
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalAssessments: 0, totalAttempts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: courses } = await supabase.from('courses').select('id').eq('teacher_id', user.id)
      const courseIds = (courses || []).map(c => c.id)

      let totalStudents = 0
      if (courseIds.length) {
        const { count } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).in('course_id', courseIds)
        totalStudents = count || 0
      }

      const { count: assessmentCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id)

      const { data: assessments } = await supabase.from('assessments').select('id').eq('teacher_id', user.id)
      const assessmentIds = (assessments || []).map(a => a.id)
      let totalAttempts = 0
      if (assessmentIds.length) {
        const { count } = await supabase.from('assessment_attempts').select('*', { count: 'exact', head: true }).in('assessment_id', assessmentIds)
        totalAttempts = count || 0
      }

      setStats({
        totalStudents,
        totalCourses: courseIds.length,
        totalAssessments: assessmentCount || 0,
        totalAttempts,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'My Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-success/10 text-success' },
    { label: 'Assessments', value: stats.totalAssessments, icon: FileQuestion, color: 'bg-accent/10 text-accent' },
    { label: 'Quiz Attempts', value: stats.totalAttempts, icon: TrendingUp, color: 'bg-info/10 text-info' },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                <c.icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold">{c.value}</p>
                <p className="text-xs text-foreground/50">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Performance Overview</CardTitle></CardHeader>
        <CardContent>
          <p className="text-foreground/50 text-sm">Detailed charts and analytics will be available as more students complete courses and quizzes. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  )
}
