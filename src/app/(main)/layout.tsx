'use client'

import { BottomNav } from '@/components/shared/bottom-nav'
import { useConnectionsRealtime } from '@/hooks/use-connections-realtime'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id)
        })
    }, [supabase])

    // Ativa as notificações globais de Match/Connection
    useConnectionsRealtime(userId)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <main className="pb-20 max-w-md mx-auto">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
