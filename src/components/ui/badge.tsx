import { type HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-display font-bold transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        accent: 'bg-accent/20 text-amber-700',
        success: 'bg-success/10 text-green-700',
        info: 'bg-info/10 text-info',
        outline: 'border-2 border-border text-text-secondary',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        md: 'text-sm px-3 py-1 rounded-lg',
        lg: 'text-base px-4 py-1.5 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  )
}
