'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Star, CheckCircle2, Sparkles, Trophy, Zap, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useStudent } from '@/hooks/useStudent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import type { LearningLevel } from '@/types/database.types'

const zoneThemes: Record<string, { bg: string; accent: string; label: string; emoji: string; description: string }> = {
  very_easy: { bg: 'from-amber-200 via-yellow-100 to-orange-100', accent: 'text-amber-600', label: '🌻 Sunny Meadow', emoji: '🌅', description: 'Begin your adventure in the warm sunlit fields!' },
  easy: { bg: 'from-emerald-200 via-green-100 to-teal-100', accent: 'text-emerald-600', label: '🌲 Enchanted Forest', emoji: '🧚', description: 'Explore the magical woods full of wonder!' },
  medium: { bg: 'from-blue-200 via-sky-100 to-cyan-100', accent: 'text-blue-600', label: '⛰️ Mountain Path', emoji: '🏔️', description: 'Climb higher through challenging terrain!' },
  hard: { bg: 'from-purple-200 via-violet-100 to-fuchsia-100', accent: 'text-purple-600', label: '⛈️ Storm Clouds', emoji: '🌩️', description: 'Brave the storms — only the bold survive!' },
  extreme: { bg: 'from-red-200 via-orange-100 to-rose-100', accent: 'text-red-600', label: '🌋 Volcano', emoji: '🔥', description: 'Face the fiery challenge of the volcano!' },
  extra_extreme: { bg: 'from-indigo-300 via-violet-200 to-purple-200', accent: 'text-indigo-600', label: '🚀 Space', emoji: '✨', description: 'The final frontier — English mastery awaits!' },
}

const levelEmojis = ['📚', '✏️', '🎯', '💡', '🧠', '⭐', '🏆', '💎', '🔮', '🎓']

export default function LevelsPage() {
  const { user } = useAuth()
  const { stats } = useStudent(user?.id)
  const [levels, setLevels] = useState<LearningLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<LearningLevel | null>(null)

  useEffect(() => {
    const fetchLevels = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('learning_levels')
        .select('*')
        .order('level_number', { ascending: true })
      setLevels(data || [])
      setLoading(false)
    }
    fetchLevels()
  }, [])

  if (loading) return <FullPageLoader />

  const currentLevel = stats?.current_level || 1
  const completedCount = levels.filter(l => l.level_number < currentLevel).length
  const progress = levels.length > 0 ? Math.round((completedCount / levels.length) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
        <div className="absolute top-0 right-0 opacity-20 text-[120px] leading-none">🗺️</div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold flex items-center gap-3">
            🗺️ Level Map Journey
          </h1>
          <p className="text-white/80 mt-2 text-lg">Explore 120 magical levels across 6 amazing worlds!</p>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <MapPin className="h-4 w-4" />
              <span className="font-bold">Level {currentLevel}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Trophy className="h-4 w-4" />
              <span className="font-bold">{completedCount} Completed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Zap className="h-4 w-4" />
              <span className="font-bold">{progress}% Done</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden max-w-md">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Zone sections */}
      {Object.entries(zoneThemes).map(([difficulty, theme]) => {
        const zoneLevels = levels.filter((l) => l.difficulty === difficulty)
        if (zoneLevels.length === 0) return null

        const zoneCompleted = zoneLevels.filter(l => l.level_number < currentLevel).length
        const zoneTotal = zoneLevels.length

        return (
          <motion.div
            key={difficulty}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Zone Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-display font-extrabold">{theme.label}</h2>
                <p className="text-sm text-foreground/50">{theme.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className={theme.accent}>{zoneCompleted}/{zoneTotal}</span>
                <span className="text-foreground/30">levels</span>
              </div>
            </div>

            <div className={`rounded-3xl bg-gradient-to-r ${theme.bg} p-6 border-2 border-white/50 shadow-lg`}>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {zoneLevels.map((level, i) => {
                  const isCompleted = level.level_number < currentLevel
                  const isCurrent = level.level_number === currentLevel
                  const isLocked = level.level_number > currentLevel
                  const emoji = levelEmojis[i % levelEmojis.length]

                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => !isLocked && setSelectedLevel(level)}
                      disabled={isLocked}
                      className={`relative h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold text-sm transition-all duration-200 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-300/50 hover:scale-110 hover:shadow-xl'
                          : isCurrent
                          ? 'bg-gradient-to-br from-primary to-blue-600 text-white shadow-xl shadow-primary/40 ring-4 ring-primary/30 hover:scale-110'
                          : 'bg-white/60 text-foreground/30 cursor-not-allowed backdrop-blur-sm'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-[10px] mt-0.5">{level.level_number}</span>
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="h-4 w-4" />
                          <span className="text-[10px] mt-0.5">{level.level_number}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">{emoji}</span>
                          <span className="text-xs">{level.level_number}</span>
                        </>
                      )}
                      {isCurrent && (
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="h-5 w-5 text-yellow-400 drop-shadow-lg" />
                        </motion.div>
                      )}
                      {isCompleted && (
                        <Star className="absolute -top-1.5 -right-1.5 h-4 w-4 text-yellow-400 fill-yellow-400 drop-shadow" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Level Detail Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <Modal
            open={!!selectedLevel}
            onOpenChange={() => setSelectedLevel(null)}
            title={`Level ${selectedLevel.level_number}`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-mono font-extrabold text-white">
                    {selectedLevel.level_number}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold">{selectedLevel.title}</h3>
                  <p className="text-sm text-foreground/50 capitalize flex items-center gap-1">
                    {zoneThemes[selectedLevel.difficulty]?.emoji} {selectedLevel.difficulty.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {selectedLevel.description && (
                <p className="text-sm text-foreground/60 bg-surface rounded-xl p-3">{selectedLevel.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center border border-blue-100">
                  <p className="text-2xl font-mono font-extrabold text-primary">{selectedLevel.xp_reward}</p>
                  <p className="text-xs text-foreground/50 font-bold">⚡ XP Reward</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4 text-center border border-amber-100">
                  <p className="text-2xl font-mono font-extrabold text-amber-600">{selectedLevel.coin_reward}</p>
                  <p className="text-xs text-foreground/50 font-bold">🪙 Coins</p>
                </div>
              </div>

              {selectedLevel.skills_covered && selectedLevel.skills_covered.length > 0 && (
                <div>
                  <p className="text-sm font-display font-bold mb-2">🎯 Skills Covered</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLevel.skills_covered.map((skill) => (
                      <span key={skill} className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full font-bold capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90" size="lg">
                {selectedLevel.level_number < currentLevel ? '🔄 Review Level' : '🚀 Start Level'}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
