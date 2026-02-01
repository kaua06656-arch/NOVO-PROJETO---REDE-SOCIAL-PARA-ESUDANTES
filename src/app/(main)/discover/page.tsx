'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileCard } from '@/components/features/profile-card'
import { Database } from '@/types/database.types'
import { Loader2, Users, UserPlus } from 'lucide-react'
import { getCompatibleProfiles } from '@/lib/matching/compatibility'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ScoredProfile {
    profile: Profile
    compatibility: number
}

export default function DiscoverPage() {
    const supabase = createClient()
    const [scoredProfiles, setScoredProfiles] = useState<ScoredProfile[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null)

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setCurrentUserId(user.id)

            // Fetch current user's profile for comparison
            const { data: myProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!myProfile) {
                setLoading(false)
                return
            }

            setCurrentUserProfile(myProfile as Profile)

            // Fetch existing connections (both sent and received)
            const { data: connectionsData } = await supabase
                .from('connections')
                .select('requester_id, receiver_id')
                .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

            const connectedUserIds = (connectionsData || []).map((c: { requester_id: string; receiver_id: string }) =>
                c.requester_id === user.id ? c.receiver_id : c.requester_id
            )

            // Fetch all other profiles
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id)
                .limit(100)

            if (profilesData) {
                // Filter out already connected users
                const availableProfiles = (profilesData as Profile[]).filter(
                    (p) => !connectedUserIds.includes(p.id)
                )

                // Apply matching algorithm: Filter + Score + Sort
                const scored = getCompatibleProfiles(myProfile as Profile, availableProfiles)
                setScoredProfiles(scored)
            }
            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const handleConnect = async () => {
        if (!currentUserId || !scoredProfiles[currentIndex]) return

        const targetProfile = scoredProfiles[currentIndex].profile

        // Check if there's already a pending connection from target -> current user
        const { data: existingRequest } = await supabase
            .from('connections')
            .select('*')
            .eq('requester_id', targetProfile.id)
            .eq('receiver_id', currentUserId)
            .eq('status', 'pending')
            .single()

        if (existingRequest) {
            // Accept their request - it's a mutual connection!
            await supabase
                .from('connections')
                // @ts-expect-error - Supabase types require real database
                .update({ status: 'accepted' })
                .eq('id', (existingRequest as { id: string }).id)

            alert(`🎉 Conectado com ${targetProfile.full_name}! Vocês já podem conversar.`)
        } else {
            // Send new connection request
            // @ts-expect-error - Supabase types require real database
            await supabase.from('connections').insert({
                requester_id: currentUserId,
                receiver_id: targetProfile.id,
                status: 'pending',
            })

            alert(`✅ Solicitação enviada para ${targetProfile.full_name}!`)
        }

        setCurrentIndex((prev) => prev + 1)
    }

    const handlePass = () => {
        setCurrentIndex((prev) => prev + 1)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    const currentScored = scoredProfiles[currentIndex]

    if (!currentScored) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
                <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    Sem mais perfis
                </h2>
                <p className="text-zinc-500">
                    Volte mais tarde para ver novos colegas de moradia!
                </p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <header className="mb-4">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Descobrir
                </h1>
                <p className="text-sm text-zinc-500">
                    Perfis ordenados por compatibilidade
                </p>
            </header>

            <ProfileCard
                profile={currentScored.profile}
                onLike={handleConnect}
                onPass={handlePass}
                likeLabel="Conectar"
                likeIcon={<UserPlus className="w-6 h-6" />}
                compatibility={currentScored.compatibility}
            />

            {/* Progress indicator */}
            <div className="mt-4 text-center text-sm text-zinc-500">
                {currentIndex + 1} de {scoredProfiles.length} perfis compatíveis
            </div>
        </div>
    )
}
