'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database.types'
import { Loader2, MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Connection = Database['public']['Tables']['connections']['Row']

interface ConnectionWithProfile extends Connection {
    profile: Profile
}

export default function ChatPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [connections, setConnections] = useState<ConnectionWithProfile[]>([])

    useEffect(() => {
        async function fetchConnections() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            // Fetch accepted connections
            const { data: acceptedData } = await supabase
                .from('connections')
                .select('*')
                .eq('status', 'accepted')
                .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

            // Get profile IDs
            const profileIds = new Set<string>()
                ; (acceptedData as Connection[] || []).forEach((c) => {
                    profileIds.add(c.requester_id === user.id ? c.receiver_id : c.requester_id)
                })

            // Fetch profiles
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .in('id', Array.from(profileIds))

            const profilesMap = new Map((profilesData as Profile[] || []).map((p) => [p.id, p]))

            // Map connections with profiles
            setConnections((acceptedData as Connection[] || []).map((c) => ({
                ...c,
                profile: profilesMap.get(c.requester_id === user.id ? c.receiver_id : c.requester_id)!
            })).filter((c) => c.profile))

            setLoading(false)
        }

        fetchConnections()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="p-4">
            <header className="mb-4">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Chat
                </h1>
                <p className="text-sm text-zinc-500">
                    Converse com suas conexões
                </p>
            </header>

            {connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                        Sem conversas ainda
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4 max-w-xs">
                        Conecte-se com outros estudantes para começar a conversar!
                    </p>
                    <Link
                        href="/discover"
                        className="text-emerald-500 font-medium hover:underline"
                    >
                        Descobrir pessoas →
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {connections.map((conn) => (
                        <Link key={conn.id} href={`/chat/${conn.id}`}>
                            <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                                <CardContent className="flex items-center gap-3 py-3">
                                    {conn.profile.photos?.[0] ? (
                                        <img
                                            src={conn.profile.photos[0]}
                                            alt={conn.profile.full_name || ''}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <Avatar size="md" fallback={conn.profile.full_name || 'U'} />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                            {conn.profile.full_name}
                                        </h3>
                                        <p className="text-sm text-zinc-500 truncate">
                                            {conn.profile.university}
                                        </p>
                                    </div>
                                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
