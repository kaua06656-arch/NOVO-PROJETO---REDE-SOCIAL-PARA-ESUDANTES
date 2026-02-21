import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export class ProfilesService {
    constructor(private supabase: SupabaseClient<Database>) { }

    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return null
        }
        return data as Profile
    }
}
