import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type ListingInsert = Database['public']['Tables']['listings']['Insert']

export class ListingsService {
    constructor(private supabase: SupabaseClient<Database>) { }

    async getAllListings() {
        return this.supabase
            .from('listings')
            .select(`
                *,
                profiles:owner_id (
                    full_name,
                    photos,
                    university
                )
            `)
            .order('created_at', { ascending: false })
    }

    async getListingById(id: string) {
        return this.supabase
            .from('listings')
            .select(`
                *,
                profiles:owner_id (
                    full_name,
                    photos,
                    university,
                    role,
                    age,
                    city_origin
                )
            `)
            .eq('id', id)
            .single()
    }

    async createListing(data: Omit<ListingInsert, 'id' | 'created_at'>) {
        return this.supabase
            .from('listings')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .insert(data as any)
            .select()
            .single()
    }

    async getMyListings(userId: string) {
        return this.supabase
            .from('listings')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: false })
    }

    async deleteListing(id: string) {
        return this.supabase
            .from('listings')
            .delete()
            .eq('id', id)
    }
}
