import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

        const variants = {
            primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500',
            secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:ring-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
            ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:ring-zinc-500',
            destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        }

        const sizes = {
            sm: 'h-9 px-3 text-sm',
            md: 'h-11 px-5 text-base',
            lg: 'h-13 px-8 text-lg',
        }

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button }
