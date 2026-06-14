'use client'

import { motion } from 'framer-motion'

interface CoinDisplayProps {
  coins: number
  className?: string
  showLabel?: boolean
}

export function CoinDisplay({ coins, className, showLabel = true }: CoinDisplayProps) {
  return (
    <motion.div
      className={`flex items-center gap-1.5 bg-accent/20 rounded-full px-3 py-1.5 ${className ?? ''}`}
      whileHover={{ scale: 1.05 }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FFD93D" stroke="#F5C518" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="7" fill="#F5C518" opacity="0.3" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B8860B">$</text>
      </svg>
      <span className="text-sm font-display font-bold text-amber-700">
        {coins.toLocaleString()}
      </span>
      {showLabel && <span className="text-xs text-amber-600/70 hidden sm:inline">coins</span>}
    </motion.div>
  )
}
