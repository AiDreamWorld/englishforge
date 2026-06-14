'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Brain, Trophy, Calendar, Target,
  Flame, TrendingUp, Clock, Star, ArrowRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStudent } from '@/hooks/useStudent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { XPBar } from '@/components/shared/XPBar'
import { CoinDisplay } from '@/components/shared/CoinDisplay'
import { SparkyCharacter } from '@/components/sparky/SparkyCharacter'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import { getGreeting } from '@/lib/utils/format'
import type { SparkyMood } from '@/components/sparky/SparkyCharacter'

function getSparkyMood(streakDays: number): SparkyMood {
  if (streakDays >= 7) return 'celebrating'
  if (streakDays >= 3) return 'excited'
  if (streakDays >= 1) return 'happy'
  return 'encouraging'
}

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading } = useStudent(user?.id)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  if (authLoading || statsLoading) return <FullPageLoader />

  const displayName = profile?.display_name || profile?.full_name?.split(' ')[0] || 'Student'
  const xpForNextLevel = (stats?.current_level || 1) * 500
  const currentLevelXP = stats?.total_xp ? stats.total_xp % xpForNextLevel : 0

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary via-primary/90 to-info rounded-[1.5rem] p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="300" height="200" viewBox="0 0 300 200">
            <circle cx="250" cy="50" r="80" fill="white" />
            <circle cx="200" cy="150" r="60" fill="white" />
          </svg>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-display font-extrabold">
              {greeting}, {displayName}!
            </h1>
            <p className="mt-1 text-white/80 text-lg">
              Ready for another day of learning?
            </p>
            <div className="mt-4 flex items-center gap-4">
              <XPBar
                currentXP={currentLevelXP}
                requiredXP={xpForNextLevel}
                level={stats?.current_level || 1}
                className="w-64"
              />
              <CoinDisplay coins={stats?.coins || 0} />
            </div>
          </div>
          <SparkyCharacter
            mood={getSparkyMood(stats?.streak_days || 0)}
            size={140}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { href: '/courses', label: 'Continue Learning', icon: BookOpen, color: 'from-primary to-info' },
          { href: '/quiz/practice', label: 'Take a Quiz', icon: Brain, color: 'from-secondary to-pink-400' },
          { href: '/achievements', label: 'Achievements', icon: Trophy, color: 'from-accent to-orange-400' },
          { href: '/live-classes', label: 'Live Classes', icon: Calendar, color: 'from-success to-emerald-400' },
        ].map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={action.href}>
              <Card className="group cursor-pointer hover:scale-[1.03] transition-transform">
                <CardContent className="p-5 flex flex-col items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-display font-bold text-text-primary">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Today's Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Today&apos;s Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-3">Complete 2 lessons to earn bonus coins!</p>
              <Progress value={stats?.total_lessons_completed ? Math.min(stats.total_lessons_completed % 2, 2) : 0} max={2} size="lg" />
              <div className="flex items-center gap-2 mt-3">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span className="text-sm font-display font-semibold text-accent">+20 coins reward</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Level */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <CardTitle>Current Level</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-mono font-extrabold text-white">
                    {stats?.current_level || 1}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-text-primary">
                    Level {stats?.current_level || 1}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {Math.round((currentLevelXP / xpForNextLevel) * 100)}% complete
                  </p>
                </div>
              </div>
              <Progress
                value={currentLevelXP}
                max={xpForNextLevel}
                className="mt-4"
                showLabel
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-secondary fill-secondary" />
                <CardTitle>Streak</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-mono font-extrabold text-secondary">
                    {stats?.streak_days || 0}
                  </p>
                  <p className="text-xs text-text-secondary font-semibold">days</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">
                    Longest: <span className="font-bold text-text-primary">{stats?.longest_streak || 0} days</span>
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 w-6 rounded-md ${
                          i < (stats?.streak_days || 0) % 7
                            ? 'bg-secondary'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">Last 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: (stats?.total_xp || 0).toLocaleString(), icon: Star, color: 'text-accent' },
          { label: 'Lessons Done', value: stats?.total_lessons_completed || 0, icon: BookOpen, color: 'text-info' },
          { label: 'Quizzes Taken', value: stats?.total_quizzes_taken || 0, icon: Brain, color: 'text-primary' },
          { label: 'Time Spent', value: `${Math.round((stats?.total_time_minutes || 0) / 60)}h`, icon: Clock, color: 'text-success' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                <p className="text-xs text-text-secondary font-semibold">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View all link */}
      <div className="flex justify-center">
        <Link href="/levels">
          <Button variant="outline" size="lg">
            Explore the Level Map
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
