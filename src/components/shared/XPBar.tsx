'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface XPBarProps {
  currentXP: number
  requiredXP: number
  level: number
  className?: string
}

export function XPBar({ currentXP, requiredXP, level, className }: XPBarProps) {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100)

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
        <Zap className="h-4 w-4 text-primary fill-primary" />
        <span className="text-sm font-display font-bold text-primary">Lv.{level}</span>
      </div>
      <div className="flex-1">
        <div className="h-3 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-info to-primary rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </motion.div>
        </div>
        <p className="text-xs text-text-secondary mt-0.5 font-medium">
          {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
        </p>
      </div>
    </div>
  )
}
