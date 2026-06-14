'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Search, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Teacher {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  status: string
  created_at: string
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, status, created_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
      setTeachers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleStatus = async (id: string, current: string) => {
    const newStatus = current === 'active' ? 'suspended' : 'active'
    const supabase = createClient()
    await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
    toast.success(`Teacher ${newStatus}`)
  }

  const filtered = teachers.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">Teachers ({teachers.length})</h1>
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map(t => (
          <Card key={t.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar alt={t.full_name} fallback={t.full_name?.charAt(0) || "?"} src={t.avatar_url} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.full_name}</p>
                <p className="text-xs text-foreground/50">{t.email}</p>
              </div>
              <Badge variant={t.status === 'active' ? 'success' : 'secondary'}>{t.status}</Badge>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus(t.id, t.status)}>
                {t.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
