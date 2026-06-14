'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  stats: { total_xp: number; current_level: number; streak_days: number; avg_quiz_score: number } | null
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: courses } = await supabase.from('courses').select('id').eq('teacher_id', user.id)
      if (!courses?.length) { setLoading(false); return }

      const courseIds = courses.map(c => c.id)
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('course_id', courseIds)

      if (!enrollments?.length) { setLoading(false); return }

      const studentIds = [...new Set(enrollments.map(e => e.student_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', studentIds)

      const { data: stats } = await supabase
        .from('student_stats')
        .select('student_id, total_xp, current_level, streak_days, avg_quiz_score')
        .in('student_id', studentIds)

      const statsMap = new Map((stats || []).map(s => [s.student_id, s]))
      setStudents((profiles || []).map(p => ({
        ...p,
        stats: statsMap.get(p.id) || null,
      })))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">My Students</h1>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Search students..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No students found" description={students.length ? 'Try a different search.' : 'No students enrolled in your courses yet.'} />
      ) : (
        <div className="grid gap-3">
          {filtered.map(student => (
            <Card key={student.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar alt={student.full_name} fallback={student.full_name?.charAt(0) || "?"} src={student.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{student.full_name}</p>
                  <p className="text-xs text-foreground/50">{student.email}</p>
                </div>
                {student.stats && (
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-primary">{student.stats.total_xp.toLocaleString()}</p>
                      <p className="text-xs text-foreground/40">XP</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{student.stats.current_level}</p>
                      <p className="text-xs text-foreground/40">Level</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{student.stats.streak_days}🔥</p>
                      <p className="text-xs text-foreground/40">Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <p className="font-bold">{student.stats.avg_quiz_score}%</p>
                        {student.stats.avg_quiz_score >= 70 ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-red-500" />}
                      </div>
                      <p className="text-xs text-foreground/40">Avg Score</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
