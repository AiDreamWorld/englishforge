'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Flame, Zap, Trophy, Medal, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { getLeaderboard, type LeaderboardEntry } from '@/lib/gamification/leaderboard'

const podiumEmojis = ['👑', '🥈', '🥉']
const podiumBg = [
  'from-amber-400 via-yellow-400 to-amber-500',
  'from-gray-300 via-slate-300 to-gray-400',
  'from-amber-600 via-orange-500 to-amber-700',
]

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

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const myRank = entries.findIndex(e => e.student_id === user?.id)

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute top-2 right-4 text-[100px] leading-none opacity-20">👑</div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold flex items-center gap-3">
            👑 Leaderboard
          </h1>
          <p className="text-white/80 mt-2 text-lg">Compete with other students and climb to the top!</p>
          {myRank >= 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mt-4 w-fit">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">Your Rank: #{myRank + 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex bg-surface rounded-2xl p-1.5 border-2 border-border shadow-sm">
          {(['all_time', 'weekly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-sm font-display font-extrabold transition-all ${
                tab === t ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              {t === 'all_time' ? '🏆 All Time' : '📅 This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pb-4">
          {[1, 0, 2].map((idx) => {
            const entry = top3[idx]
            if (!entry) return null
            const isMe = entry.student_id === user?.id
            const heights = ['h-40', 'h-32', 'h-28']
            return (
              <motion.div
                key={entry.student_id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${podiumBg[idx]} flex items-center justify-center shadow-xl ${
                    isMe ? 'ring-4 ring-primary ring-offset-2' : ''
                  }`}>
                    <span className="text-2xl font-bold text-white">
                      {entry.full_name?.[0] || '?'}
                    </span>
                  </div>
                  <div className="absolute -top-3 -right-1 text-2xl">{podiumEmojis[idx]}</div>
                </div>
                <p className={`font-display font-extrabold text-sm text-center ${isMe ? 'text-primary' : ''}`}>
                  {entry.display_name || entry.full_name}
                </p>
                <p className="text-xs text-foreground/40">Level {entry.current_level}</p>
                <div className={`${heights[idx]} w-24 bg-gradient-to-t ${podiumBg[idx]} rounded-t-2xl mt-2 flex items-center justify-center shadow-lg`}>
                  <div className="text-center text-white">
                    <p className="text-xl font-mono font-extrabold">{entry.total_xp.toLocaleString()}</p>
                    <p className="text-[10px] opacity-80">XP</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Rest of Leaderboard */}
      <Card className="overflow-hidden border-2">
        <CardContent className="p-0">
          {rest.length === 0 && top3.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏅</div>
              <p className="text-foreground/50 font-bold">No entries yet. Start learning to claim the top spot!</p>
            </div>
          )}
          {rest.map((entry, i) => {
            const isCurrentUser = entry.student_id === user?.id
            const rank = i + 4
            return (
              <motion.div
                key={entry.student_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex items-center gap-4 px-6 py-4 border-b border-border/50 last:border-0 transition-colors ${
                  isCurrentUser ? 'bg-gradient-to-r from-primary/5 to-indigo-50 border-l-4 border-l-primary' : 'hover:bg-surface'
                }`}
              >
                <div className="w-10 text-center">
                  <span className={`font-mono font-extrabold text-lg ${
                    rank <= 10 ? 'text-amber-500' : 'text-foreground/30'
                  }`}>{rank}</span>
                </div>

                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-primary to-indigo-600 text-white'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-foreground/60'
                }`}>
                  {entry.full_name?.[0] || '?'}
                </div>

                <div className="flex-1">
                  <p className={`font-display font-bold ${isCurrentUser ? 'text-primary' : ''}`}>
                    {entry.display_name || entry.full_name}
                    {isCurrentUser && <span className="text-xs ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
                  </p>
                  <p className="text-xs text-foreground/40">Level {entry.current_level}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-mono font-bold text-foreground/50">{entry.streak_days}d</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-primary/10 to-indigo-100 px-3 py-1.5 rounded-full">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono font-extrabold text-primary">{entry.total_xp.toLocaleString()}</span>
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
