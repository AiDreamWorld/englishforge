'use client'

import { motion } from 'framer-motion'
import { SparkyCharacter, type SparkyMood } from './SparkyCharacter'

interface SparkyBubbleProps {
  message: string
  mood?: SparkyMood
  sparkySize?: number
  className?: string
}

export function SparkyBubble({ message, mood = 'happy', sparkySize = 80, className }: SparkyBubbleProps) {
  return (
    <div className={`flex items-end gap-3 ${className ?? ''}`}>
      <SparkyCharacter mood={mood} size={sparkySize} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative bg-white border-2 border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg max-w-xs"
      >
        <p className="text-sm font-body text-text-primary">{message}</p>
        <div className="absolute -left-2 bottom-2 w-3 h-3 bg-white border-l-2 border-b-2 border-border transform rotate-45" />
      </motion.div>
    </div>
  )
}
