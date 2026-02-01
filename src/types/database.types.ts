export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    university: string | null
                    course: string | null
                    age: number | null
                    bio: string | null
                    budget: number | null
                    role: 'student' | 'landlord'
                    preferences: {
                        smoker?: boolean
                        pets?: boolean
                        party?: boolean
                        sleep_early?: boolean
                        clean?: boolean
                    } | null
                    photos: string[] | null
                    city_origin: string | null
                    looking_for: 'roommate' | 'housing' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    university?: string | null
                    course?: string | null
                    age?: number | null
                    bio?: string | null
                    budget?: number | null
                    role?: 'student' | 'landlord'
                    preferences?: {
                        smoker?: boolean
                        pets?: boolean
                        party?: boolean
                        sleep_early?: boolean
                        clean?: boolean
                    } | null
                    photos?: string[] | null
                    city_origin?: string | null
                    looking_for?: 'roommate' | 'housing' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    university?: string | null
                    course?: string | null
                    age?: number | null
                    bio?: string | null
                    budget?: number | null
                    role?: 'student' | 'landlord'
                    preferences?: {
                        smoker?: boolean
                        pets?: boolean
                        party?: boolean
                        sleep_early?: boolean
                        clean?: boolean
                    } | null
                    photos?: string[] | null
                    city_origin?: string | null
                    looking_for?: 'roommate' | 'housing' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            matches: {
                Row: {
                    id: string
                    user_a: string
                    user_b: string
                    status: 'pending' | 'accepted' | 'rejected'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_a: string
                    user_b: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_a?: string
                    user_b?: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                }
            }
            connections: {
                Row: {
                    id: string
                    requester_id: string
                    receiver_id: string
                    status: 'pending' | 'accepted' | 'rejected'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    requester_id: string
                    receiver_id: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    requester_id?: string
                    receiver_id?: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    connection_id: string
                    sender_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    connection_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    connection_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                }
            }
            listings: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    description: string | null
                    price: number
                    location: string | null
                    images: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    description?: string | null
                    price: number
                    location?: string | null
                    images?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    description?: string | null
                    price?: number
                    location?: string | null
                    images?: string[] | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
