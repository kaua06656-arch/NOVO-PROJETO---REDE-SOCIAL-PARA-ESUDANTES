'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database.types'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

type Message = Database['public']['Tables']['messages']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Connection = Database['public']['Tables']['connections']['Row']

export default function ChatPage() {
    const supabase = createClient()
    const router = useRouter()
    const params = useParams()
    const connectionId = params.id as string

    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [partner, setPartner] = useState<Profile | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setCurrentUserId(user.id)

            // Get connection info
            const { data: connection } = await supabase
                .from('connections')
                .select('*')
                .eq('id', connectionId)
                .single() as { data: Connection | null }

            if (connection) {
                const partnerId = connection.requester_id === user.id
                    ? connection.receiver_id
                    : connection.requester_id

                const { data: partnerData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', partnerId)
                    .single()

                setPartner(partnerData)
            }

            // Fetch messages
            const { data: messagesData } = await supabase
                .from('messages')
                .select('*')
                .eq('connection_id', connectionId)
                .order('created_at', { ascending: true }) as { data: Message[] | null }

            if (messagesData) {
                setMessages(messagesData as Message[])
            }
            setLoading(false)
        }

        init()
    }, [supabase, connectionId])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`messages:${connectionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `connection_id=eq.${connectionId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    if (newMessage.sender_id === currentUserId) return
                    setMessages((prev) => [...prev, newMessage])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, connectionId, currentUserId])

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUserId) return

        const messageContent = newMessage.trim()
        setNewMessage('')
        setSending(true)

        // Optimistic update
        const optimisticMsg: Message = {
            id: crypto.randomUUID(),
            connection_id: connectionId,
            sender_id: currentUserId,
            content: messageContent,
            created_at: new Date().toISOString()
        }
        setMessages((prev) => [...prev, optimisticMsg])

        // @ts-expect-error - Supabase SDK types not synced with migrated schema (connection_id replaces match_id)
        const { error } = await supabase.from('messages').insert({
            connection_id: connectionId,
            sender_id: currentUserId,
            content: messageContent,
        })

        if (error) {
            console.error('Error sending message:', error)
            // Rollback
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
            setNewMessage(messageContent) // Restore text
        }

        setSending(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!partner) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
                <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">Erro ao carregar chat</h3>
                    <p className="text-sm">Não foi possível encontrar a conexão ou o usuário.</p>
                    <p className="text-xs mt-1">Verifique se você aceitou a conexão.</p>
                </div>
                <Button onClick={() => router.push('/network')} className="mt-4" variant="secondary">
                    Voltar para Rede
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
            {/* Header */}
            <header className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                </button>
                <Avatar
                    size="md"
                    src={partner?.photos?.[0]}
                    fallback={partner?.full_name || 'U'}
                />
                <div className="flex-1">
                    <h1 className="font-semibold text-zinc-900 dark:text-white">
                        {partner?.full_name}
                    </h1>
                    <p className="text-xs text-zinc-500">{partner?.university}</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-zinc-500 text-sm">
                            Inicie a conversa com {partner?.full_name?.split(' ')[0]}!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.sender_id === currentUserId
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine
                                        ? 'bg-emerald-500 text-white rounded-br-md'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <p
                                        className={`text-[10px] mt-1 ${isMine ? 'text-emerald-100' : 'text-zinc-400'
                                            }`}
                                    >
                                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 safe-area-bottom"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 h-11 px-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button
                    type="submit"
                    size="md"
                    className="rounded-full w-11 h-11 p-0"
                    disabled={!newMessage.trim() || sending}
                    aria-label={sending ? 'Enviando mensagem...' : 'Enviar mensagem'}
                >
                    {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </form>
        </div>
    )
}
