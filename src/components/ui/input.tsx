import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-display font-semibold text-text-primary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            'flex h-12 w-full rounded-[0.5rem] border-2 border-border bg-white px-4 text-base text-text-primary placeholder:text-text-secondary/50 transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-secondary focus:border-secondary focus:ring-secondary/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-secondary font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
