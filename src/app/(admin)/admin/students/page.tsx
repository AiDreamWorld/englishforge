'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search, Ban, CheckCircle, Users, TrendingUp, Flame, Star, Lightbulb, Download, Mail } from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Students inactive for 7+ days are at high risk of churning — send them a reminder notification.',
  'Celebrate students who hit milestones (Level 10, 50, 100) with a personal message.',
  'Suspended students cannot log in. Use this for policy violations only.',
  'Sort by XP to find your top performers — consider featuring them on the leaderboard.',
  'Students with 0 XP may have registered but never started learning. Reach out!',
]

interface Student {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  avatar_emoji: string | null
  status: string
  created_at: string
  last_seen_at: string | null
  stats: { total_xp: number; current_level: number; streak_days: number; total_lessons_completed: number; total_quizzes_taken: number; coins: number } | null
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'date' | 'xp' | 'level' | 'streak'>('date')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, avatar_emoji, status, created_at, last_seen_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(200)

      const ids = (profiles || []).map(p => p.id)
      let statsMap = new Map()
      if (ids.length) {
        const { data: stats } = await supabase
          .from('student_stats')
          .select('student_id, total_xp, current_level, streak_days, total_lessons_completed, total_quizzes_taken, coins')
          .in('student_id', ids)
        statsMap = new Map((stats || []).map(s => [s.student_id, s]))
      }

      setStudents((profiles || []).map(p => ({ ...p, stats: statsMap.get(p.id) || null })) as Student[])
      setLoading(false)
    }
    load()
  }, [])

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'suspended' : 'active'
    const supabase = createClient()
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    toast.success(`Student ${newStatus}`)
  }

  const filtered = students
    .filter(s =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'xp') return (b.stats?.total_xp || 0) - (a.stats?.total_xp || 0)
      if (sortBy === 'level') return (b.stats?.current_level || 0) - (a.stats?.current_level || 0)
      if (sortBy === 'streak') return (b.stats?.streak_days || 0) - (a.stats?.streak_days || 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const activeCount = students.filter(s => s.status === 'active').length
  const suspendedCount = students.filter(s => s.status === 'suspended').length
  const avgXP = students.length ? Math.round(students.reduce((sum, s) => sum + (s.stats?.total_xp || 0), 0) / students.length) : 0

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Students ({students.length})</h1>
          <p className="text-sm text-foreground/50">Manage all registered students, view progress, and take actions.</p>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">{tip}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
          <div><p className="text-xl font-mono font-extrabold">{students.length}</p><p className="text-xs text-foreground/50">Total</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-success" /></div>
          <div><p className="text-xl font-mono font-extrabold">{activeCount}</p><p className="text-xs text-foreground/50">Active</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center"><Ban className="h-4 w-4 text-secondary" /></div>
          <div><p className="text-xl font-mono font-extrabold">{suspendedCount}</p><p className="text-xs text-foreground/50">Suspended</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center"><Star className="h-4 w-4 text-accent" /></div>
          <div><p className="text-xl font-mono font-extrabold">{avgXP.toLocaleString()}</p><p className="text-xs text-foreground/50">Avg XP</p></div>
        </CardContent></Card>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['date', 'xp', 'level', 'streak'] as const).map(s => (
            <Button key={s} size="sm" variant={sortBy === s ? 'primary' : 'outline'} onClick={() => setSortBy(s)}>
              {s === 'date' ? 'Recent' : s === 'xp' ? 'XP' : s === 'level' ? 'Level' : 'Streak'}
            </Button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-foreground/50">No students found.</CardContent></Card>
        ) : filtered.map(s => (
          <Card key={s.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {s.avatar_emoji || s.full_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.full_name}</p>
                <p className="text-xs text-foreground/50">{s.email}</p>
              </div>
              <div className="hidden lg:flex items-center gap-4 text-xs text-foreground/60">
                <span title="Level" className="flex items-center gap-1"><TrendingUp size={12} /> Lvl {s.stats?.current_level || 1}</span>
                <span title="XP" className="flex items-center gap-1"><Star size={12} /> {(s.stats?.total_xp || 0).toLocaleString()} XP</span>
                <span title="Streak" className="flex items-center gap-1"><Flame size={12} /> {s.stats?.streak_days || 0}🔥</span>
                <span title="Lessons" className="flex items-center gap-1">📖 {s.stats?.total_lessons_completed || 0}</span>
                <span title="Quizzes" className="flex items-center gap-1">🧩 {s.stats?.total_quizzes_taken || 0}</span>
              </div>
              <div className="text-xs text-foreground/40">
                {s.last_seen_at ? `Seen ${new Date(s.last_seen_at).toLocaleDateString()}` : 'Never seen'}
              </div>
              <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus(s.id, s.status)} title={s.status === 'active' ? 'Suspend' : 'Activate'}>
                {s.status === 'active' ? <Ban size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
