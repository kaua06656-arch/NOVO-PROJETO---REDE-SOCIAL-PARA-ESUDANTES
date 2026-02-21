import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export class ConnectionsService {
    constructor(private supabase: SupabaseClient<Database>) { }

    async getAcceptedConnections(userId: string) {
        return this.supabase
            .from('connections')
            .select('*')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    }

    async getPendingReceivedRequests(userId: string) {
        return this.supabase
            .from('connections')
            .select('*')
            .eq('receiver_id', userId)
            .eq('status', 'pending')
    }

    async getPendingSentRequests(userId: string) {
        return this.supabase
            .from('connections')
            .select('*')
            .eq('requester_id', userId)
            .eq('status', 'pending')
    }

    async acceptRequest(connectionId: string) {
        return this.supabase
            .from('connections')
            // @ts-expect-error - Supabase types require real database
            .update({ status: 'accepted' })
            .eq('id', connectionId)
    }

    async rejectRequest(connectionId: string) {
        return this.supabase
            .from('connections')
            // @ts-expect-error - Supabase types require real database
            .update({ status: 'rejected' })
            .eq('id', connectionId)
    }

    async sendRequest(requesterId: string, receiverId: string) {
        return this.supabase
            .from('connections')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert({
                requester_id: requesterId,
                receiver_id: receiverId,
                status: 'pending',
            } as any)
    }

    subscribeToConnectionUpdates(
        userId: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUpdate: (payload: any) => void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onInsert: (payload: any) => void
    ) {
        return this.supabase
            .channel('connections-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'connections',
                    filter: `requester_id=eq.${userId}`, // Also useful to check receiver, we can broaden the filter inside.
                },
                onUpdate
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'connections',
                    filter: `receiver_id=eq.${userId}`,
                },
                onUpdate
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'connections',
                    filter: `receiver_id=eq.${userId}`,
                },
                onInsert
            )
            .subscribe()
    }

    unsubscribe(channel: ReturnType<SupabaseClient['channel']>) {
        this.supabase.removeChannel(channel)
    }

    async checkIfConnected(userId: string, targetId: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.supabase.rpc('are_connected', { user1_id: userId, user2_id: targetId })
    }
}
