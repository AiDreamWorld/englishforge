'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Map } from 'lucide-react'

interface Level {
  id: string
  level_number: number
  title: string
  difficulty: string
  xp_required: number
  xp_reward: number
  coin_reward: number
  is_locked: boolean
}

const difficultyColor: Record<string, 'success' | 'primary' | 'accent' | 'secondary' | 'info'> = {
  very_easy: 'success',
  easy: 'success',
  medium: 'primary',
  hard: 'accent',
  extreme: 'secondary',
  extra_extreme: 'secondary',
}

export default function AdminLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('learning_levels').select('*').order('level_number')
      setLevels((data || []) as Level[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold font-display">Learning Levels ({levels.length})</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {levels.map(l => (
          <Card key={l.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {l.level_number}
                  </div>
                  <span className="font-medium text-sm">{l.title}</span>
                </div>
                <Badge variant={difficultyColor[l.difficulty] || 'primary'}>{l.difficulty.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between text-xs text-foreground/50">
                <span>XP: {l.xp_required}</span>
                <span>Reward: {l.xp_reward} XP + {l.coin_reward} coins</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
