'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database.types'
import { Loader2, UserCheck, UserX, Users, MessageCircle, Clock } from 'lucide-react'
import Link from 'next/link'

type Profile = Database['public']['Tables']['profiles']['Row']
type Connection = Database['public']['Tables']['connections']['Row']

interface ConnectionWithProfile extends Connection {
    profile: Profile
}

export default function NetworkPage() {
    const supabase = createClient()
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'sent'>('connections')

    const [connections, setConnections] = useState<ConnectionWithProfile[]>([])
    const [pendingRequests, setPendingRequests] = useState<ConnectionWithProfile[]>([])
    const [sentRequests, setSentRequests] = useState<ConnectionWithProfile[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setCurrentUserId(user.id)

        // Fetch accepted connections
        const { data: acceptedData } = await supabase
            .from('connections')
            .select('*')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

        // Fetch pending requests (received)
        const { data: pendingData } = await supabase
            .from('connections')
            .select('*')
            .eq('receiver_id', user.id)
            .eq('status', 'pending')

        // Fetch sent requests
        const { data: sentData } = await supabase
            .from('connections')
            .select('*')
            .eq('requester_id', user.id)
            .eq('status', 'pending')

        // Get all profile IDs we need to fetch
        const profileIds = new Set<string>()

            ; (acceptedData as Connection[] || []).forEach((c) => {
                profileIds.add(c.requester_id === user.id ? c.receiver_id : c.requester_id)
            })
            ; (pendingData as Connection[] || []).forEach((c) => {
                profileIds.add(c.requester_id)
            })
            ; (sentData as Connection[] || []).forEach((c) => {
                profileIds.add(c.receiver_id)
            })

        // Fetch all profiles at once
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

        setPendingRequests((pendingData as Connection[] || []).map((c) => ({
            ...c,
            profile: profilesMap.get(c.requester_id)!
        })).filter((c) => c.profile))

        setSentRequests((sentData as Connection[] || []).map((c) => ({
            ...c,
            profile: profilesMap.get(c.receiver_id)!
        })).filter((c) => c.profile))

        setLoading(false)
    }

    const handleAccept = async (connectionId: string) => {
        await supabase
            .from('connections')
            // @ts-expect-error - Supabase types require real database
            .update({ status: 'accepted' })
            .eq('id', connectionId)

        fetchData() // Refresh
    }

    const handleReject = async (connectionId: string) => {
        await supabase
            .from('connections')
            // @ts-expect-error - Supabase types require real database
            .update({ status: 'rejected' })
            .eq('id', connectionId)

        fetchData() // Refresh
    }

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
                    Minha Rede
                </h1>
                <p className="text-sm text-zinc-500">
                    Gerencie suas conexões
                </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'connections'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                >
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Conexões ({connections.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'pending'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Pendentes ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'sent'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                >
                    <Users className="w-4 h-4 inline mr-1" />
                    Enviadas ({sentRequests.length})
                </button>
            </div>

            {/* Connections Tab */}
            {activeTab === 'connections' && (
                <div className="space-y-3">
                    {connections.length === 0 ? (
                        <EmptyState
                            icon={<UserCheck className="w-10 h-10 text-zinc-400" />}
                            title="Sem conexões ainda"
                            description="Explore perfis e envie solicitações!"
                        />
                    ) : (
                        connections.map((conn) => (
                            <ConnectionCard
                                key={conn.id}
                                connection={conn}
                                actions={
                                    <Link href={`/chat/${conn.id}`}>
                                        <Button size="sm">
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            Chat
                                        </Button>
                                    </Link>
                                }
                            />
                        ))
                    )}
                </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
                <div className="space-y-3">
                    {pendingRequests.length === 0 ? (
                        <EmptyState
                            icon={<Clock className="w-10 h-10 text-zinc-400" />}
                            title="Sem solicitações"
                            description="Ninguém enviou pedidos de conexão"
                        />
                    ) : (
                        pendingRequests.map((conn) => (
                            <ConnectionCard
                                key={conn.id}
                                connection={conn}
                                actions={
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAccept(conn.id)}
                                        >
                                            <UserCheck className="w-4 h-4 mr-1" />
                                            Aceitar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleReject(conn.id)}
                                        >
                                            <UserX className="w-4 h-4" />
                                        </Button>
                                    </div>
                                }
                            />
                        ))
                    )}
                </div>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 'sent' && (
                <div className="space-y-3">
                    {sentRequests.length === 0 ? (
                        <EmptyState
                            icon={<Users className="w-10 h-10 text-zinc-400" />}
                            title="Nenhuma enviada"
                            description="Explore perfis e conecte-se!"
                        />
                    ) : (
                        sentRequests.map((conn) => (
                            <ConnectionCard
                                key={conn.id}
                                connection={conn}
                                actions={
                                    <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                        Aguardando resposta
                                    </span>
                                }
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function ConnectionCard({ connection, actions }: { connection: ConnectionWithProfile; actions: React.ReactNode }) {
    const profile = connection.profile

    return (
        <Card>
            <CardContent className="flex items-center gap-3 py-3">
                {profile.photos?.[0] ? (
                    <img
                        src={profile.photos[0]}
                        alt={profile.full_name || ''}
                        className="w-14 h-14 rounded-full object-cover"
                    />
                ) : (
                    <Avatar size="lg" fallback={profile.full_name || 'U'} />
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                        {profile.full_name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate">
                        {profile.university} • {profile.course}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    {actions}
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-sm text-zinc-500">{description}</p>
        </div>
    )
}
