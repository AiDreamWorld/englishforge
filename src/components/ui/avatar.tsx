import { cn } from '@/lib/utils/cn'

interface AvatarProps {
  src?: string | null
  alt: string
  fallback: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover border-2 border-border',
          sizes[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-white font-display font-bold border-2 border-white shadow-md',
        sizes[size],
        className
      )}
      aria-label={alt}
    >
      {fallback}
    </div>
  )
}
