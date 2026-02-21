import { createClient } from '@/lib/supabase/client'
import { ProfilesService } from './profiles.service'
import { ConnectionsService } from './connections.service'
import { MessagesService } from './messages.service'
import { ListingsService } from './listings.service'

export function useServices() {
    const supabase = createClient()

    return {
        supabase,
        profilesService: new ProfilesService(supabase),
        connectionsService: new ConnectionsService(supabase),
        messagesService: new MessagesService(supabase),
        listingsService: new ListingsService(supabase),
    }
}
