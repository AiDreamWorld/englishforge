'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen, Brain, Trophy, Calendar, Target,
  Flame, TrendingUp, Clock, Star, ArrowRight,
  Sparkles, Award, Zap, Crown, Gift, Heart
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

const motivationalQuotes = [
  'Every expert was once a beginner!',
  'You\'re doing amazing, keep it up!',
  'Practice makes progress!',
  'Small steps lead to big achievements!',
  'Your English is getting better every day!',
  'Champions never stop learning!',
]

export default function StudentDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading } = useStudent(user?.id)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState('')

  useEffect(() => {
    setGreeting(getGreeting())
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [])

  if (authLoading || statsLoading) return <FullPageLoader />

  const displayName = profile?.display_name || profile?.full_name?.split(' ')[0] || 'Student'
  const avatarEmoji = profile?.avatar_emoji || '😀'
  const xpForNextLevel = (stats?.current_level || 1) * 500
  const currentLevelXP = stats?.total_xp ? stats.total_xp % xpForNextLevel : 0
  const levelProgress = Math.round((currentLevelXP / xpForNextLevel) * 100)

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[1.5rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-[10%] text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⭐</div>
          <div className="absolute top-8 left-[30%] text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎯</div>
          <div className="absolute top-3 left-[50%] text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🏆</div>
          <div className="absolute top-6 left-[70%] text-3xl animate-bounce" style={{ animationDelay: '1.5s' }}>💎</div>
          <div className="absolute top-4 left-[85%] text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎮</div>
        </div>

        <div className="relative z-10 p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl border-4 border-white/30 shadow-xl">
              {avatarEmoji}
            </div>
            <div className="text-white">
              <p className="text-sm text-white/70 font-medium">{greeting}</p>
              <h1 className="text-3xl font-display font-extrabold">
                {displayName}! <span className="inline-block animate-pulse">👋</span>
              </h1>
              <p className="text-white/60 text-sm mt-0.5 italic">&ldquo;{quote}&rdquo;</p>
              <div className="mt-3 flex items-center gap-4">
                <XPBar
                  currentXP={currentLevelXP}
                  requiredXP={xpForNextLevel}
                  level={stats?.current_level || 1}
                  className="w-56"
                />
                <CoinDisplay coins={stats?.coins || 0} />
              </div>
            </div>
          </div>
          <SparkyCharacter
            mood={getSparkyMood(stats?.streak_days || 0)}
            size={130}
          />
        </div>
      </motion.div>

      {/* Quick Actions - Colorful Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/courses', label: 'Continue Learning', icon: BookOpen, gradient: 'from-blue-500 to-cyan-400', emoji: '📚', shadow: 'shadow-blue-500/20' },
          { href: '/quiz/practice', label: 'Take a Quiz', icon: Brain, gradient: 'from-pink-500 to-rose-400', emoji: '🧠', shadow: 'shadow-pink-500/20' },
          { href: '/achievements', label: 'My Badges', icon: Trophy, gradient: 'from-amber-500 to-yellow-400', emoji: '🏆', shadow: 'shadow-amber-500/20' },
          { href: '/live-classes', label: 'Live Classes', icon: Calendar, gradient: 'from-emerald-500 to-green-400', emoji: '🎥', shadow: 'shadow-emerald-500/20' },
        ].map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={action.href}>
              <div className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${action.gradient} p-5 text-white shadow-lg ${action.shadow} hover:scale-[1.03] hover:shadow-xl transition-all`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl group-hover:scale-125 transition-transform">{action.emoji}</span>
                </div>
                <p className="text-sm font-display font-bold">{action.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-amber-800">Today&apos;s Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 mb-3">Complete 2 lessons to earn bonus coins! 🎯</p>
              <Progress value={stats?.total_lessons_completed ? Math.min(stats.total_lessons_completed % 2, 2) : 0} max={2} size="lg" />
              <div className="mt-3 flex items-center gap-2 bg-amber-100 rounded-lg p-2">
                <Gift className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-display font-bold text-amber-700">Reward: +20 coins 🪙</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Level */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-violet-800">Current Level</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      {stats?.current_level || 1}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Crown className="h-5 w-5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-violet-800">
                    Level {stats?.current_level || 1}
                  </p>
                  <p className="text-sm text-violet-600">
                    {levelProgress}% to next level 🚀
                  </p>
                </div>
              </div>
              <Progress value={currentLevelXP} max={xpForNextLevel} className="mt-4" showLabel />
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-500 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-rose-800">Streak 🔥</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-mono font-extrabold text-rose-600">
                    {stats?.streak_days || 0}
                  </p>
                  <p className="text-xs text-rose-500 font-bold">days</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-rose-600">
                    Best: <span className="font-bold text-rose-800">{stats?.longest_streak || 0} days</span> 🏅
                  </p>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const active = i < (stats?.streak_days || 0) % 7
                      return (
                        <div
                          key={i}
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs ${
                            active
                              ? 'bg-gradient-to-br from-rose-400 to-orange-400 text-white shadow-sm'
                              : 'bg-rose-100 text-rose-300'
                          }`}
                        >
                          {active ? '🔥' : '·'}
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-rose-400 mt-1">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Row - Colorful */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: (stats?.total_xp || 0).toLocaleString(), icon: Zap, gradient: 'from-yellow-400 to-amber-500', emoji: '⚡' },
          { label: 'Lessons Done', value: stats?.total_lessons_completed || 0, icon: BookOpen, gradient: 'from-blue-400 to-indigo-500', emoji: '📖' },
          { label: 'Quizzes Passed', value: stats?.total_quizzes_taken || 0, icon: Brain, gradient: 'from-purple-400 to-violet-500', emoji: '🧩' },
          { label: 'Time Spent', value: `${Math.round((stats?.total_time_minutes || 0) / 60)}h`, icon: Clock, gradient: 'from-emerald-400 to-teal-500', emoji: '⏰' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.gradient} p-3 flex items-center justify-between`}>
                  <stat.icon className="h-5 w-5 text-white" />
                  <span className="text-lg">{stat.emoji}</span>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-mono font-extrabold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-secondary font-semibold">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="text-4xl">🗺️</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-indigo-800">Level Map</h3>
                <p className="text-sm text-indigo-600">Explore all 120 levels and plan your journey!</p>
              </div>
              <Link href="/levels">
                <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                  Explore <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="text-4xl">🏅</div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-emerald-800">Achievements</h3>
                <p className="text-sm text-emerald-600">Check your badges and unlock new ones!</p>
              </div>
              <Link href="/achievements">
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
