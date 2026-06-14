'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search, Ban, CheckCircle, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  status: string
  created_at: string
  stats: { total_xp: number; current_level: number; streak_days: number } | null
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, status, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(100)

      const ids = (profiles || []).map(p => p.id)
      const { data: stats } = await supabase
        .from('student_stats')
        .select('student_id, total_xp, current_level, streak_days')
        .in('student_id', ids)

      const statsMap = new Map((stats || []).map(s => [s.student_id, s]))
      setStudents((profiles || []).map(p => ({ ...p, stats: statsMap.get(p.id) || null })))
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

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Students ({students.length})</h1>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map(s => (
          <Card key={s.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar alt={s.full_name} fallback={s.full_name?.charAt(0) || "?"} src={s.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.full_name}</p>
                <p className="text-xs text-foreground/50">{s.email}</p>
              </div>
              {s.stats && (
                <div className="flex gap-3 text-xs text-foreground/60">
                  <span>Lvl {s.stats.current_level}</span>
                  <span>{s.stats.total_xp.toLocaleString()} XP</span>
                  <span>{s.stats.streak_days}🔥</span>
                </div>
              )}
              <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus(s.id, s.status)}>
                {s.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
