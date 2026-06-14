'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Star, CheckCircle2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useStudent } from '@/hooks/useStudent'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { FullPageLoader } from '@/components/shared/LoadingSpinner'
import type { LearningLevel } from '@/types/database.types'

const zoneThemes: Record<string, { bg: string; label: string; emoji: string }> = {
  very_easy: { bg: 'from-amber-100 to-yellow-50', label: 'Sunny Meadow', emoji: '🌅' },
  easy: { bg: 'from-green-100 to-emerald-50', label: 'Enchanted Forest', emoji: '🌲' },
  medium: { bg: 'from-slate-200 to-blue-50', label: 'Mountain Path', emoji: '⛰️' },
  hard: { bg: 'from-purple-200 to-indigo-100', label: 'Storm Clouds', emoji: '⛈️' },
  extreme: { bg: 'from-red-200 to-orange-100', label: 'Volcano', emoji: '🌋' },
  extra_extreme: { bg: 'from-indigo-300 to-violet-200', label: 'Space', emoji: '🚀' },
}

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-text-primary">Level Map</h1>
        <p className="text-text-secondary mt-1">Journey through 100 levels of English mastery</p>
      </div>

      {/* Zone sections */}
      {Object.entries(zoneThemes).map(([difficulty, theme]) => {
        const zoneLevels = levels.filter((l) => l.difficulty === difficulty)
        if (zoneLevels.length === 0) return null

        return (
          <div key={difficulty}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{theme.emoji}</span>
              <h2 className="text-xl font-display font-bold text-text-primary">{theme.label}</h2>
              <span className="text-sm text-text-secondary">
                Levels {zoneLevels[0]?.level_number}–{zoneLevels[zoneLevels.length - 1]?.level_number}
              </span>
            </div>

            <div className={`rounded-2xl bg-gradient-to-r ${theme.bg} p-6`}>
              <div className="grid grid-cols-10 gap-3">
                {zoneLevels.map((level, i) => {
                  const isCompleted = level.level_number < currentLevel
                  const isCurrent = level.level_number === currentLevel
                  const isLocked = level.level_number > currentLevel

                  return (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => !isLocked && setSelectedLevel(level)}
                      disabled={isLocked}
                      className={`relative h-14 w-14 rounded-xl flex items-center justify-center font-mono font-extrabold text-lg transition-all duration-200 ${
                        isCompleted
                          ? 'bg-success text-white shadow-lg shadow-success/30 hover:scale-110'
                          : isCurrent
                          ? 'bg-primary text-white shadow-xl shadow-primary/40 ring-4 ring-primary/30 animate-pulse hover:scale-110'
                          : 'bg-white/50 text-text-secondary/40 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        level.level_number
                      )}
                      {isCurrent && (
                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent" />
                      )}
                      {isCompleted && (
                        <Star className="absolute -top-1 -right-1 h-4 w-4 text-accent fill-accent" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Level Detail Modal */}
      {selectedLevel && (
        <Modal
          open={!!selectedLevel}
          onOpenChange={() => setSelectedLevel(null)}
          title={`Level ${selectedLevel.level_number}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <span className="text-2xl font-mono font-extrabold text-white">
                  {selectedLevel.level_number}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary">{selectedLevel.title}</h3>
                <p className="text-sm text-text-secondary capitalize">
                  {selectedLevel.difficulty.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <p className="text-lg font-mono font-bold text-primary">{selectedLevel.xp_reward}</p>
                <p className="text-xs text-text-secondary">XP Reward</p>
              </div>
              <div className="bg-accent/10 rounded-xl p-3 text-center">
                <p className="text-lg font-mono font-bold text-amber-700">{selectedLevel.coin_reward}</p>
                <p className="text-xs text-text-secondary">Coins</p>
              </div>
            </div>

            {selectedLevel.skills_covered && selectedLevel.skills_covered.length > 0 && (
              <div>
                <p className="text-sm font-display font-semibold text-text-primary mb-2">Skills Covered</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLevel.skills_covered.map((skill) => (
                    <span key={skill} className="text-xs bg-info/10 text-info px-3 py-1 rounded-full font-medium capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" size="lg">
              {selectedLevel.level_number < currentLevel ? 'Review Level' : 'Start Level'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
