'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Flame, Star, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useStudent } from '@/hooks/useStudent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import type { Badge } from '@/types/database.types'

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Achievements</h1>
        <p className="text-text-secondary mt-1">
          You&apos;ve earned {earnedCount} of {totalCount} badges. Keep going!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Badges Earned', value: earnedCount, icon: Award, color: 'text-primary' },
          { label: 'Current Streak', value: `${stats?.streak_days || 0}d`, icon: Flame, color: 'text-secondary' },
          { label: 'Longest Streak', value: `${stats?.longest_streak || 0}d`, icon: Target, color: 'text-success' },
          { label: 'Total XP', value: (stats?.total_xp || 0).toLocaleString(), icon: Star, color: 'text-accent' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badge Grid by Category */}
      {categories.map((category) => {
        const categoryBadges = allBadges.filter((b) => (b.category || 'other') === category)
        return (
          <div key={category}>
            <h2 className="text-xl font-display font-bold text-text-primary capitalize mb-4">
              {category} Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryBadges.map((badge, i) => {
                const isEarned = earnedIds.has(badge.id)
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className={`text-center ${!isEarned ? 'opacity-40 grayscale' : ''}`}>
                      <CardContent className="p-5">
                        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center mb-3">
                          <Trophy className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-text-primary text-sm">{badge.name}</h3>
                        <p className="text-xs text-text-secondary mt-1">{badge.description}</p>
                        <BadgeUI
                          variant={badge.rarity === 'legendary' ? 'accent' : badge.rarity === 'epic' ? 'primary' : badge.rarity === 'rare' ? 'info' : 'outline'}
                          size="sm"
                          className="mt-2"
                        >
                          {badge.rarity}
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
    </div>
  )
}
