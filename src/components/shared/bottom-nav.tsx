'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MessageCircle, Users, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/discover', label: 'Descobrir', icon: Home },
    { href: '/network', label: 'Rede', icon: Users },
    { href: '/chat', label: 'Chat', icon: MessageCircle },
    { href: '/listings', label: 'Moradias', icon: Building2 },
    { href: '/profile', label: 'Perfil', icon: User },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 safe-area-bottom">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors',
                                isActive
                                    ? 'text-emerald-500'
                                    : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                            )}
                        >
                            <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
