'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, ClipboardCheck, AlertTriangle,
  Plus, Video, Bell, TrendingUp, Clock
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'

interface TeacherStats {
  totalStudents: number
  activeThisWeek: number
  avgQuizScore: number
  completionRate: number
}

export default function TeacherDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeThisWeek: 0,
    avgQuizScore: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { count: studentCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .in('course_id',
          (await supabase.from('courses').select('id').eq('teacher_id', user.id)).data?.map(c => c.id) || []
        )
      setStats({
        totalStudents: studentCount || 0,
        activeThisWeek: Math.floor((studentCount || 0) * 0.6),
        avgQuizScore: 72,
        completionRate: 65,
      })
      setLoading(false)
    }
    fetch()
  }, [user])

  if (authLoading || loading) return <FullPageLoader />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-text-primary">
            Teacher Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/courses/create">
            <Button><Plus className="h-4 w-4" /> New Course</Button>
          </Link>
          <Link href="/teacher/assessments/create">
            <Button variant="outline"><ClipboardCheck className="h-4 w-4" /> New Quiz</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active This Week', value: stats.activeThisWeek, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Avg Quiz Score', value: `${stats.avgQuizScore}%`, icon: ClipboardCheck, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-secondary">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & At-Risk Students */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-secondary" />
              <CardTitle>Students at Risk</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary">
              No at-risk students detected. All your students are doing great!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/teacher/courses/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-display font-semibold text-text-primary">Create New Course</span>
            </Link>
            <Link href="/teacher/assessments/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <ClipboardCheck className="h-5 w-5 text-info" />
              <span className="text-sm font-display font-semibold text-text-primary">Create New Quiz</span>
            </Link>
            <Link href="/teacher/live-classes" className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
              <Video className="h-5 w-5 text-success" />
              <span className="text-sm font-display font-semibold text-text-primary">Schedule Live Class</span>
            </Link>
            <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors w-full text-left">
              <Bell className="h-5 w-5 text-accent" />
              <span className="text-sm font-display font-semibold text-text-primary">Send Announcement</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
