'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Map, Lightbulb, Search, Star, Lock, Unlock, Trophy, Layers } from 'lucide-react'

const TIPS = [
  'Levels define the learning journey — 120 levels from beginner to mastery.',
  'Levels 1-60 are available to Learner plan subscribers. All 120 unlock with Champion.',
  'Each level has a required XP threshold. Students must earn enough XP from lessons and quizzes to unlock the next level.',
  'You can edit level names and XP requirements to fine-tune difficulty progression.',
  'Free Explorer students can access Levels 1-5 only.',
  'Consider grouping levels into milestones (every 10 levels) for student motivation.',
]

interface Level {
  id: string
  level_number: number
  title: string
  description: string | null
  required_xp: number
  created_at: string
}

export default function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'explorer' | 'learner' | 'champion'>('all')
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('learning_levels')
        .select('*')
        .order('level_number', { ascending: true })
      setLevels((data || []) as Level[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  const filtered = levels
    .filter(l => {
      if (filter === 'explorer') return l.level_number <= 5
      if (filter === 'learner') return l.level_number <= 60
      if (filter === 'champion') return l.level_number > 60
      return true
    })
    .filter(l =>
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      String(l.level_number).includes(search)
    )

  const tierColor = (n: number) => {
    if (n <= 5) return 'bg-gray-100 text-gray-700'
    if (n <= 60) return 'bg-blue-100 text-blue-700'
    return 'bg-amber-100 text-amber-700'
  }

  const tierLabel = (n: number) => {
    if (n <= 5) return 'Explorer'
    if (n <= 60) return 'Learner'
    return 'Champion'
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Levels ({levels.length}/120)</h1>
        <p className="text-sm text-foreground/50">
          Manage all 120 learning levels. Levels define the student progression path and are gated by subscription plan.
        </p>
      </div>

      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">{tip}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center"><Layers className="h-4 w-4 text-indigo-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{levels.length}</p><p className="text-xs text-foreground/50">Total Levels</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center"><Unlock className="h-4 w-4 text-gray-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{levels.filter(l => l.level_number <= 5).length}</p><p className="text-xs text-foreground/50">Free (Explorer)</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><Star className="h-4 w-4 text-blue-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{levels.filter(l => l.level_number > 5 && l.level_number <= 60).length}</p><p className="text-xs text-foreground/50">Learner Only</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center"><Trophy className="h-4 w-4 text-amber-600" /></div>
          <div><p className="text-xl font-mono font-extrabold">{levels.filter(l => l.level_number > 60).length}</p><p className="text-xs text-foreground/50">Champion Only</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search by level number or title..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'explorer', 'learner', 'champion'] as const).map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-foreground/50">
          No levels found. You may need to seed levels 1-120 in the database.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(l => (
            <Card key={l.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${tierColor(l.level_number)}`}>
                      {l.level_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[140px]">{l.title || `Level ${l.level_number}`}</p>
                      <p className="text-xs text-foreground/40">{l.required_xp} XP required</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{tierLabel(l.level_number)}</Badge>
                </div>
                {l.description && (
                  <p className="text-xs text-foreground/50 truncate">{l.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {levels.length < 120 && (
        <Card className="border-dashed border-2 border-amber-300 bg-amber-50">
          <CardContent className="p-6 text-center">
            <p className="text-amber-800 font-medium mb-2">⚠️ Only {levels.length} of 120 levels exist</p>
            <p className="text-sm text-amber-600">Run the SQL seed script in Supabase to add the missing levels (101-120).</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
