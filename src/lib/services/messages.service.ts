import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export class MessagesService {
    constructor(private supabase: SupabaseClient<Database>) { }

    async getHistory(connectionId: string) {
        return this.supabase
            .from('messages')
            .select(`
                id,
                connection_id,
                sender_id,
                content,
                created_at,
                profiles:sender_id (
                    full_name,
                    photos
                )
            `)
            .eq('connection_id', connectionId)
            .order('created_at', { ascending: true })
    }

    async getLatestMessage(connectionId: string) {
        return this.supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('connection_id', connectionId)
            .order('created_at', { ascending: false })
            .limit(1)
    }

    async sendMessage(connectionId: string, senderId: string, content: string) {
        return this.supabase
            .from('messages')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert({
                connection_id: connectionId,
                sender_id: senderId,
                content,
            } as any)
    }

    subscribeToChat(
        connectionId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNewMessage: (payload: any) => void
    ) {
        return this.supabase
            .channel(`chat-${connectionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `connection_id=eq.${connectionId}`,
                },
                onNewMessage
            )
            .subscribe()
    }

    unsubscribe(channel: ReturnType<SupabaseClient['channel']>) {
        this.supabase.removeChannel(channel)
    }
}
