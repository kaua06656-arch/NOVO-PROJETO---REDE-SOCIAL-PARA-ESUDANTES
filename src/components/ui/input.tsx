import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-base transition-colors',
                        'placeholder:text-zinc-400',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
