'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Plus, Trash2, Award, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

const TIPS = [
  'Badges reward students for achievements like streaks, level-ups, and quiz mastery.',
  'Rarity levels (common → legendary) make rare badges feel special and motivate students.',
  'Create streak badges (7-day, 30-day, 100-day) to encourage daily practice.',
  'Category helps organize badges — use "quiz" for quiz milestones, "level" for level-ups.',
  'Students see earned badges on their dashboard profile — it boosts engagement!',
]

interface BadgeItem {
  id: string
  slug: string
  name: string
  description: string
  icon_url: string
  category: string
  rarity: string
}

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon_url: '/badges/default.svg', category: 'general', rarity: 'common' })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('badges').select('*').order('created_at', { ascending: false })
      setBadges((data || []) as BadgeItem[])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug required'); return }
    const supabase = createClient()
    const { data, error } = await supabase.from('badges').insert(form).select().single()
    if (error) { toast.error('Failed to create badge'); return }
    setBadges(prev => [data as BadgeItem, ...prev])
    setForm({ name: '', slug: '', description: '', icon_url: '/badges/default.svg', category: 'general', rarity: 'common' })
    setShowForm(false)
    toast.success('Badge created!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this badge?')) return
    const supabase = createClient()
    await supabase.from('badges').delete().eq('id', id)
    setBadges(prev => prev.filter(b => b.id !== id))
    toast.success('Deleted')
  }

  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display">Badges ({badges.length})</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" /> New Badge</Button>
      </div>

      <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-orange-700">{tip}</p>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Badge</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} />
            </div>
            <Input label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <Input label="Icon URL" value={form.icon_url} onChange={e => setForm(p => ({ ...p, icon_url: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {['general', 'streak', 'level', 'quiz', 'skill', 'special'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rarity</label>
                <select className="w-full rounded-xl border border-border bg-surface p-3 text-sm" value={form.rarity} onChange={e => setForm(p => ({ ...p, rarity: e.target.value }))}>
                  {['common', 'rare', 'epic', 'legendary'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(b => (
          <Card key={b.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-foreground/50">{b.description}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="primary">{b.category}</Badge>
                  <Badge variant="accent">{b.rarity}</Badge>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
