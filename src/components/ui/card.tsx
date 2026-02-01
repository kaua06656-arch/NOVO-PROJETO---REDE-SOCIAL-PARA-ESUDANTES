import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'rounded-2xl bg-white shadow-sm border border-zinc-100',
                'dark:bg-zinc-900 dark:border-zinc-800',
                className
            )}
            {...props}
        />
    )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-5', className)}
            {...props}
        />
    )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    )
)
CardTitle.displayName = 'CardTitle'

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
    )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center p-5 pt-0', className)}
            {...props}
        />
    )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardContent }
