'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Flame, Star, Target, Sparkles, Crown, Gem } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useStudent } from '@/hooks/useStudent'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import type { Badge } from '@/types/database.types'

const rarityConfig: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  common: { bg: 'from-gray-100 to-slate-100', border: 'border-gray-200', icon: '🥉', glow: '' },
  rare: { bg: 'from-blue-100 to-cyan-100', border: 'border-blue-200', icon: '🥈', glow: 'shadow-blue-200/50' },
  epic: { bg: 'from-purple-100 to-fuchsia-100', border: 'border-purple-200', icon: '🥇', glow: 'shadow-purple-200/50' },
  legendary: { bg: 'from-amber-100 via-yellow-100 to-orange-100', border: 'border-amber-300', icon: '💎', glow: 'shadow-amber-200/60' },
}

const categoryIcons: Record<string, string> = {
  general: '🎯', streak: '🔥', level: '📈', quiz: '🧩', skill: '💪', special: '🌟', other: '✨',
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useStudent(user?.id)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const [{ data: badges }, { data: earned }] = await Promise.all([
        supabase.from('badges').select('*').order('category'),
        supabase.from('student_badges').select('badge_id').eq('student_id', user.id),
      ])
      setAllBadges(badges || [])
      setEarnedIds(new Set((earned || []).map((e) => e.badge_id)))
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading || statsLoading) return <FullPageLoader />

  const categories = [...new Set(allBadges.map((b) => b.category || 'other'))]
  const earnedCount = earnedIds.size
  const totalCount = allBadges.length
  const progress = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white">
        <div className="absolute top-2 right-4 text-[100px] leading-none opacity-20">🏆</div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold flex items-center gap-3">
            🏆 Achievements
          </h1>
          <p className="text-white/80 mt-2 text-lg">
            You&apos;ve earned {earnedCount} of {totalCount} badges — keep collecting! 🎉
          </p>
          <div className="mt-4 bg-white/20 rounded-full h-4 overflow-hidden max-w-md">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-300 to-amber-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <p className="text-sm text-white/60 mt-1">{progress}% complete</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Badges Earned', value: earnedCount, emoji: '🏅', bg: 'from-purple-100 to-indigo-100', color: 'text-purple-700' },
          { label: 'Current Streak', value: `${stats?.streak_days || 0}d`, emoji: '🔥', bg: 'from-orange-100 to-red-100', color: 'text-orange-700' },
          { label: 'Longest Streak', value: `${stats?.longest_streak || 0}d`, emoji: '⚡', bg: 'from-amber-100 to-yellow-100', color: 'text-amber-700' },
          { label: 'Total XP', value: (stats?.total_xp || 0).toLocaleString(), emoji: '💫', bg: 'from-blue-100 to-cyan-100', color: 'text-blue-700' },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="overflow-hidden border-2 border-transparent hover:border-primary/10">
              <CardContent className={`p-5 bg-gradient-to-br ${stat.bg}`}>
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <p className={`text-2xl font-mono font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-foreground/50 font-bold mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Badge Grid by Category */}
      {categories.map((category) => {
        const categoryBadges = allBadges.filter((b) => (b.category || 'other') === category)
        const categoryEarned = categoryBadges.filter(b => earnedIds.has(b.id)).length
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-extrabold flex items-center gap-2">
                {categoryIcons[category] || '✨'} {category} Badges
              </h2>
              <span className="text-sm font-bold text-foreground/40">
                {categoryEarned}/{categoryBadges.length} earned
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBadges.map((badge, i) => {
                const isEarned = earnedIds.has(badge.id)
                const rarity = rarityConfig[badge.rarity] || rarityConfig.common
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={isEarned ? { scale: 1.05, rotate: 1 } : {}}
                  >
                    <Card className={`text-center overflow-hidden border-2 transition-all duration-300 ${
                      isEarned
                        ? `${rarity.border} shadow-lg ${rarity.glow}`
                        : 'opacity-40 grayscale border-border'
                    }`}>
                      <CardContent className={`p-5 ${isEarned ? `bg-gradient-to-br ${rarity.bg}` : ''}`}>
                        <div className={`mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-3 ${
                          isEarned
                            ? 'bg-white/80 shadow-inner'
                            : 'bg-gray-100'
                        }`}>
                          <span className="text-4xl">{rarity.icon}</span>
                        </div>
                        <h3 className="font-display font-extrabold text-sm">{badge.name}</h3>
                        <p className="text-xs text-foreground/50 mt-1 line-clamp-2">{badge.description}</p>
                        <BadgeUI
                          variant={badge.rarity === 'legendary' ? 'accent' : badge.rarity === 'epic' ? 'primary' : badge.rarity === 'rare' ? 'info' : 'outline'}
                          size="sm"
                          className="mt-2"
                        >
                          {isEarned ? '✅ ' : '🔒 '}{badge.rarity}
                        </BadgeUI>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}

      {allBadges.length === 0 && (
        <div className="text-center py-16">
          <div className="text-8xl mb-4">🎖️</div>
          <h2 className="text-2xl font-display font-extrabold text-foreground/70">No badges created yet</h2>
          <p className="text-foreground/50 mt-2">Badges will appear here once your admin sets them up!</p>
        </div>
      )}
    </div>
  )
}
