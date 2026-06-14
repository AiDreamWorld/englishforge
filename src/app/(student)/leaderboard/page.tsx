'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Flame, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { getLeaderboard, type LeaderboardEntry } from '@/lib/gamification/leaderboard'

const crownColors = ['text-accent', 'text-gray-400', 'text-amber-700']

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all_time' | 'weekly'>('all_time')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const data = await getLeaderboard(tab, 50)
      setEntries(data)
      setLoading(false)
    }
    fetch()
  }, [tab])

  if (loading) return <FullPageLoader />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Leaderboard</h1>
        <p className="text-text-secondary mt-1">See how you rank against other students</p>
      </div>

      <div className="inline-flex bg-border/50 rounded-full p-1">
        {(['all_time', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-display font-bold transition-all ${
              tab === t ? 'bg-primary text-white shadow-md' : 'text-text-secondary'
            }`}
          >
            {t === 'all_time' ? 'All Time' : 'This Week'}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {entries.map((entry, i) => {
            const isCurrentUser = entry.student_id === user?.id
            return (
              <motion.div
                key={entry.student_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 ${
                  isCurrentUser ? 'bg-primary/5' : ''
                }`}
              >
                <div className="w-10 text-center">
                  {i < 3 ? (
                    <Crown className={`h-6 w-6 mx-auto ${crownColors[i]}`} />
                  ) : (
                    <span className="font-mono font-bold text-text-secondary">{entry.rank}</span>
                  )}
                </div>

                <Avatar
                  src={entry.avatar_url}
                  alt={entry.full_name}
                  fallback={entry.full_name[0]}
                  size="md"
                />

                <div className="flex-1">
                  <p className={`font-display font-bold ${isCurrentUser ? 'text-primary' : 'text-text-primary'}`}>
                    {entry.display_name || entry.full_name}
                    {isCurrentUser && <span className="text-xs ml-2 text-primary/60">(You)</span>}
                  </p>
                  <p className="text-xs text-text-secondary">Level {entry.current_level}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-mono font-bold text-text-secondary">{entry.streak_days}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono font-bold text-primary">{entry.total_xp.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
