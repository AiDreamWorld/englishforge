import { cn } from '@/lib/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-border border-t-primary animate-spin',
          sizes[size]
        )}
      />
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-text-secondary font-display font-semibold animate-pulse">
        Loading...
      </p>
    </div>
  )
}
