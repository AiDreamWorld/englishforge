'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { SparkyCharacter } from './SparkyCharacter'

interface SparkyReactionProps {
  type: 'correct' | 'incorrect' | 'levelup' | 'badge' | 'streak'
  show: boolean
  onComplete?: () => void
  message?: string
}

export function SparkyReaction({ type, show, onComplete, message }: SparkyReactionProps) {
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6C63FF', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'],
    })
  }, [])

  useEffect(() => {
    if (show && (type === 'correct' || type === 'levelup' || type === 'badge' || type === 'streak')) {
      fireConfetti()
    }
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, type, fireConfetti, onComplete])

  const config = {
    correct: { mood: 'celebrating' as const, text: message || 'Amazing! You got it right!', bg: 'from-success/20 to-success/5' },
    incorrect: { mood: 'encouraging' as const, text: message || "Don't worry! You'll get it next time!", bg: 'from-secondary/10 to-secondary/5' },
    levelup: { mood: 'excited' as const, text: message || 'WOW! You leveled up!', bg: 'from-accent/20 to-primary/10' },
    badge: { mood: 'celebrating' as const, text: message || 'You earned a new badge!', bg: 'from-primary/20 to-info/10' },
    streak: { mood: 'excited' as const, text: message || "You're on fire! Streak milestone!", bg: 'from-secondary/20 to-accent/10' },
  }

  const { mood, text, bg } = config[type]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b ${bg} backdrop-blur-sm`}
          onClick={onComplete}
        >
          <SparkyCharacter mood={mood} size={160} />
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-2xl font-display font-bold text-text-primary text-center px-8"
          >
            {text}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 text-sm text-text-secondary"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
