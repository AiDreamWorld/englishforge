'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, DollarSign, TrendingUp,
  Star, Zap, AlertTriangle, Moon, BookOpen, Brain,
  ArrowRight, Clock, Activity, BarChart3, Bell,
  Lightbulb, GraduationCap, Trophy, Flame
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'

const ADMIN_TIPS = [
  'Check "Needs Support" students weekly — early intervention prevents dropouts.',
  'Review AI Reports monthly to spot curriculum gaps across all students.',
  'Encourage teachers to schedule at least 2 live classes per week.',
  'Students with 7+ day streaks have 3x higher retention — celebrate them!',
  'Monitor the "Losing Interest" group and send them notification reminders.',
  'Update badge rewards regularly to keep gamification fresh.',
  'Review payment logs daily to catch failed transactions early.',
]

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const [totalCourses, setTotalCourses] = useState(0)
  const [totalBadges, setTotalBadges] = useState(0)
  const [totalLevels, setTotalLevels] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [inactiveStudents, setInactiveStudents] = useState(0)
  const [newStudentsToday, setNewStudentsToday] = useState(0)
  const [newStudentsWeek, setNewStudentsWeek] = useState(0)
  const [totalQuizAttempts, setTotalQuizAttempts] = useState(0)
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)
  const [recentStudents, setRecentStudents] = useState<Array<{ full_name: string; email: string; created_at: string }>>([])
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; action: string; details: string | null; created_at: string }>>([])
  const [tip] = useState(ADMIN_TIPS[Math.floor(Math.random() * ADMIN_TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [
        students, teachers, courses, badges, levels,
        activeRes, inactiveRes, todayRes, weekRes,
        quizRes, subsRes, recentRes, activityRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('badges').select('*', { count: 'exact', head: true }),
        supabase.from('learning_levels').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('last_seen_at', weekAgo),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').or(`last_seen_at.is.null,last_seen_at.lt.${thirtyDaysAgo}`),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', todayStart),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').gte('created_at', weekAgo),
        supabase.from('assessment_attempts').select('*', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('profiles').select('full_name, email, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(5),
        supabase.from('activity_log').select('id, action, details, created_at').order('created_at', { ascending: false }).limit(8),
      ])

      setTotalStudents(students.count || 0)
      setTotalTeachers(teachers.count || 0)
      setTotalCourses(courses.count || 0)
      setTotalBadges(badges.count || 0)
      setTotalLevels(levels.count || 0)
      setActiveStudents(activeRes.count || 0)
      setInactiveStudents(inactiveRes.count || 0)
      setNewStudentsToday(todayRes.count || 0)
      setNewStudentsWeek(weekRes.count || 0)
      setTotalQuizAttempts(quizRes.count || 0)
      setTotalSubscriptions(subsRes.count || 0)
      setRecentStudents((recentRes.data || []) as Array<{ full_name: string; email: string; created_at: string }>)
      setRecentActivity((activityRes.data || []) as Array<{ id: string; action: string; details: string | null; created_at: string }>)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <FullPageLoader />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-text-primary">Admin Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Badge variant="primary" size="lg">Live Data</Badge>
      </div>

      {/* Admin Tip */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-display font-bold text-amber-800">Admin Tip</p>
            <p className="text-sm text-amber-700">{tip}</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/10', link: '/admin/students' },
          { label: 'Total Teachers', value: totalTeachers, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/admin/teachers' },
          { label: 'Active Courses', value: totalCourses, icon: BookOpen, color: 'text-info', bg: 'bg-info/10', link: '/admin/courses' },
          { label: 'Active Subscriptions', value: totalSubscriptions, icon: DollarSign, color: 'text-accent', bg: 'bg-accent/10', link: '/admin/subscriptions' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-secondary" />
                  </div>
                  <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Today's Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'New Today', value: newStudentsToday, icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
          { label: 'New This Week', value: newStudentsWeek, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active (7 days)', value: activeStudents, icon: Activity, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Inactive (30d+)', value: inactiveStudents, icon: Moon, color: 'text-text-secondary', bg: 'bg-border' },
          { label: 'Quiz Attempts', value: totalQuizAttempts, icon: Brain, color: 'text-accent', bg: 'bg-accent/10' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-mono font-extrabold text-text-primary">{card.value}</p>
                  <p className="text-xs text-text-secondary">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Levels', value: totalLevels, icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-100', link: '/admin/levels' },
          { label: 'Badges', value: totalBadges, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-100', link: '/admin/badges' },
          { label: 'Streaks (avg)', value: '-', icon: Flame, color: 'text-rose-600', bg: 'bg-rose-100', link: '/admin/students' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
            <Link href={card.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-extrabold text-text-primary">{card.value}</p>
                    <p className="text-xs text-text-secondary">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Students + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Recent Registrations</CardTitle>
              <Link href="/admin/students"><Button variant="ghost" size="sm">View All <ArrowRight className="h-3 w-3" /></Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">No students registered yet</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {s.full_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-text-primary">{s.full_name}</p>
                        <p className="text-xs text-text-secondary">{s.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-info" /> Recent Activity</CardTitle>
              <Badge variant="info" size="sm">Live</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-6">No activity logged yet. Activity appears when students complete lessons, quizzes, and earn badges.</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                    <div className="h-2 w-2 rounded-full bg-info mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-primary">{a.action}</p>
                      {a.details && <p className="text-xs text-text-secondary">{a.details}</p>}
                      <p className="text-xs text-text-secondary">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Manage Students', href: '/admin/students', icon: Users, color: 'bg-primary' },
              { label: 'View Payments', href: '/admin/payments', icon: DollarSign, color: 'bg-success' },
              { label: 'Generate AI Report', href: '/admin/reports', icon: BarChart3, color: 'bg-info' },
              { label: 'Platform Settings', href: '/admin/settings', icon: Bell, color: 'bg-accent' },
            ].map(action => (
              <Link key={action.href} href={action.href}>
                <div className={`${action.color} text-white rounded-xl p-4 hover:opacity-90 transition-opacity cursor-pointer`}>
                  <action.icon className="h-5 w-5 mb-2" />
                  <p className="text-sm font-display font-bold">{action.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
