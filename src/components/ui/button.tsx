'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-display font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.98]',
        secondary:
          'bg-secondary text-white shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.03] active:scale-[0.98]',
        accent:
          'bg-accent text-text-primary shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:scale-[1.03] active:scale-[0.98]',
        success:
          'bg-success text-white shadow-lg shadow-success/25 hover:shadow-xl hover:shadow-success/30 hover:scale-[1.03] active:scale-[0.98]',
        outline:
          'border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white hover:scale-[1.03] active:scale-[0.98]',
        ghost:
          'text-text-secondary hover:bg-primary/10 hover:text-primary',
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-[0.5rem]',
        md: 'h-11 px-6 text-base rounded-[0.75rem]',
        lg: 'h-14 px-8 text-lg rounded-[0.75rem]',
        xl: 'h-16 px-10 text-xl rounded-[1rem]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
