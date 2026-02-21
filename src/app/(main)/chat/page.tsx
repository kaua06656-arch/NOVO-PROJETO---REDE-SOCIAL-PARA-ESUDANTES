/* <title> | name="description" | property="og: */
// aria-label UX helper\n'use client'

import { useEffect, useState, useCallback } from 'react'
import { useServices } from '@/lib/services'
import { useConnectionsRealtime } from '@/hooks/use-connections-realtime'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database.types'
import { MessageCircle, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Connection = Database['public']['Tables']['connections']['Row']

interface ConnectionWithProfile extends Connection {
    profile: Profile
    lastMessage?: { content: string, created_at: string, sender_id: string } | null
}

export default function ChatPage() {
    const { supabase, connectionsService, messagesService } = useServices()
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [connections, setConnections] = useState<ConnectionWithProfile[]>([])

    const fetchConnections = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        setUserId(user.id)

        // Fetch accepted connections
        const { data: acceptedData } = await connectionsService.getAcceptedConnections(user.id)

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

        const baseConnections = (acceptedData as Connection[] || []).map((c) => ({
            ...c,
            profile: profilesMap.get(c.requester_id === user.id ? c.receiver_id : c.requester_id)!
        })).filter((c) => c.profile)

        // Fetch latest messages
        const connectionsWithMsgs = await Promise.all(
            baseConnections.map(async (conn) => {
                const { data } = await messagesService.getLatestMessage(conn.id)
                const latest = data?.[0] as { content: string, created_at: string, sender_id: string } | undefined
                return {
                    ...conn,
                    lastMessage: latest || null
                }
            })
        )

        // Sort by most recent message or connection updated_at
        connectionsWithMsgs.sort((a, b) => {
            const dateA = a.lastMessage?.created_at || a.updated_at
            const dateB = b.lastMessage?.created_at || b.updated_at
            return new Date(dateB).getTime() - new Date(dateA).getTime()
        })

        setConnections(connectionsWithMsgs)

        setLoading(false)
    }, [supabase, connectionsService, messagesService])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchConnections()
    }, [fetchConnections])

    // Atualiza automaticamente quando novas conexões entrarem
    useConnectionsRealtime(userId, fetchConnections)

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <header className="mb-4">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Chat</h1>
                    <p className="text-sm text-zinc-500">Carregando conversas...</p>
                </header>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardContent className="flex items-center gap-3 py-3">
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <header className="mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Chat
                </h2>
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
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                {conn.profile.full_name}
                                            </h3>
                                            {conn.lastMessage && (
                                                <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">
                                                    {new Date(conn.lastMessage.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-500 truncate">
                                            {conn.lastMessage ? (
                                                <span>
                                                    {conn.lastMessage.sender_id === userId ? 'Você: ' : ''}
                                                    {conn.lastMessage.content}
                                                </span>
                                            ) : (
                                                <span className="italic">Nova conexão • {conn.profile.university}</span>
                                            )}
                                        </p>
                                    </div>
                                    {!conn.lastMessage && <MessageCircle className="w-5 h-5 text-emerald-500" />}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
