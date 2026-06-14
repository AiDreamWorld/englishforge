'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface BadgeDisplayProps {
  name: string
  iconUrl: string
  rarity: string
  earned?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const rarityColors: Record<string, string> = {
  common: 'ring-border',
  rare: 'ring-info',
  epic: 'ring-primary',
  legendary: 'ring-accent',
}

const rarityShadows: Record<string, string> = {
  common: '',
  rare: 'shadow-info/20',
  epic: 'shadow-primary/30',
  legendary: 'shadow-accent/40',
}

const sizes = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
}

export function BadgeDisplay({ name, iconUrl, rarity, earned = true, size = 'md', className }: BadgeDisplayProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center gap-1', className)}
      whileHover={earned ? { scale: 1.1, rotate: 5 } : undefined}
    >
      <div
        className={cn(
          'rounded-full ring-4 flex items-center justify-center bg-white shadow-lg overflow-hidden',
          sizes[size],
          rarityColors[rarity] || rarityColors.common,
          rarityShadows[rarity] || '',
          !earned && 'opacity-30 grayscale'
        )}
      >
        <img src={iconUrl} alt={name} className="h-3/4 w-3/4 object-contain" />
      </div>
      <span className="text-xs font-display font-semibold text-text-secondary text-center leading-tight max-w-[80px]">
        {name}
      </span>
    </motion.div>
  )
}
