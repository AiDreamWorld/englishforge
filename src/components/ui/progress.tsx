'use client'

import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-5',
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-border overflow-hidden',
          heights[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-primary to-info transition-all duration-500 ease-out relative',
            percentage > 0 && 'min-w-[8px]',
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 5 && (
            <div className="absolute inset-0 animate-shimmer rounded-full" />
          )}
        </div>
      </div>
      {showLabel && (
        <p className="text-sm text-text-secondary mt-1 font-medium">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  )
}
