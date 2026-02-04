'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProfileCard } from '@/components/features/profile-card'
import { Database } from '@/types/database.types'
import { Loader2, Users, UserPlus } from 'lucide-react'
import { getCompatibleProfiles } from '@/lib/matching/compatibility'
import { toast } from 'sonner'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ScoredProfile {
    profile: Profile
    compatibility: number
}

// Mock profiles for demo purposes
const MOCK_PROFILES: Profile[] = [
    {
        id: 'mock-1',
        full_name: 'Ana Clara Oliveira',
        age: 21,
        university: 'UFPI',
        course: 'Engenharia Civil',
        city_origin: 'São Luís, MA',
        bio: 'Estudante tranquila, gosto de estudar à noite e manter o ambiente organizado. Procuro dividir apartamento perto do campus!',
        budget: 800,
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'],
        preferences: { smoker: false, pets: true, party: false, sleep_early: true, clean: true },
        role: 'student',
        looking_for: 'roommate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'mock-2',
        full_name: 'Lucas Mendes',
        age: 22,
        university: 'UFPI',
        course: 'Ciência da Computação',
        city_origin: 'Fortaleza, CE',
        bio: 'Dev e gamer nas horas vagas. Procuro colega de quarto que não se importe com setup de PC no quarto 🎮',
        budget: 700,
        photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'],
        preferences: { smoker: false, pets: false, party: true, sleep_early: false, clean: true },
        role: 'student',
        looking_for: 'housing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'mock-3',
        full_name: 'Mariana Costa',
        age: 20,
        university: 'UESPI',
        course: 'Medicina',
        city_origin: 'Teresina, PI',
        bio: 'Estudante de medicina, rotina puxada mas adoro um café e boas conversas. Organizada e responsável!',
        budget: 1000,
        photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'],
        preferences: { smoker: false, pets: false, party: false, sleep_early: true, clean: true },
        role: 'student',
        looking_for: 'roommate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
]

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

                // If no real profiles found, use mock profiles for demo
                if (scored.length === 0) {
                    const mockScored = MOCK_PROFILES.map((profile) => ({
                        profile,
                        compatibility: Math.floor(Math.random() * 30) + 70, // 70-100% random compatibility
                    }))
                    setScoredProfiles(mockScored)
                } else {
                    setScoredProfiles(scored)
                }
            } else {
                // No profiles at all, use mock profiles
                const mockScored = MOCK_PROFILES.map((profile) => ({
                    profile,
                    compatibility: Math.floor(Math.random() * 30) + 70,
                }))
                setScoredProfiles(mockScored)
            }
            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const handleConnect = async () => {
        if (!currentUserId || !scoredProfiles[currentIndex]) return

        const targetProfile = scoredProfiles[currentIndex].profile

        // Check if this is a mock profile (demo mode)
        if (targetProfile.id.startsWith('mock-')) {
            toast.info('Perfil de demonstração', {
                description: 'Este é um perfil de exemplo. Convide amigos para usar o app!',
            })
            setCurrentIndex((prev) => prev + 1)
            return
        }

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

            toast.success(`🎉 Conectado com ${targetProfile.full_name}!`, {
                description: 'Vocês já podem conversar na aba Chat.',
            })
        } else {
            // Send new connection request
            // @ts-expect-error - Supabase types require real database
            await supabase.from('connections').insert({
                requester_id: currentUserId,
                receiver_id: targetProfile.id,
                status: 'pending',
            })

            toast.success(`Solicitação enviada!`, {
                description: `${targetProfile.full_name} será notificado(a).`,
            })
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
