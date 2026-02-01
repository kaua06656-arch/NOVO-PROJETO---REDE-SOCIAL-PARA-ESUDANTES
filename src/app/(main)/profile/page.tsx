'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { Database } from '@/types/database.types'
import { LogOut, Edit2, MapPin, DollarSign, GraduationCap, Loader2, Camera } from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const [isEditingPhoto, setIsEditingPhoto] = useState(false)

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id)

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(data)
            setLoading(false)
        }

        fetchProfile()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const handlePhotoUpload = async (url: string) => {
        if (!userId) return

        const { error } = await supabase
            .from('profiles')
            // @ts-expect-error - Supabase types require real database connection
            .update({ photos: [url] })
            .eq('id', userId)

        if (!error) {
            setProfile(prev => prev ? { ...prev, photos: [url] } : null)
            setIsEditingPhoto(false)
        }
    }

    const handleRemovePhoto = async () => {
        if (!userId) return

        const { error } = await supabase
            .from('profiles')
            // @ts-expect-error - Supabase types require real database connection
            .update({ photos: null })
            .eq('id', userId)

        if (!error) {
            setProfile(prev => prev ? { ...prev, photos: null } : null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    const preferences = profile?.preferences as Profile['preferences']

    return (
        <div className="p-4">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Meu Perfil
                </h1>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                </Button>
            </header>

            {/* Profile Header with Photo Upload */}
            <div className="flex flex-col items-center mb-6">
                {isEditingPhoto && userId ? (
                    <div className="mb-3">
                        <ImageUpload
                            bucket="avatars"
                            userId={userId}
                            currentUrl={profile?.photos?.[0]}
                            onUpload={handlePhotoUpload}
                            onRemove={handleRemovePhoto}
                            size="lg"
                            shape="circle"
                        />
                        <button
                            onClick={() => setIsEditingPhoto(false)}
                            className="text-sm text-zinc-500 mt-2 hover:text-zinc-700"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div className="relative mb-3">
                        {profile?.photos?.[0] ? (
                            <img
                                src={profile.photos[0]}
                                alt={profile.full_name || 'Foto de perfil'}
                                className="w-24 h-24 rounded-full object-cover border-4 border-zinc-200 dark:border-zinc-700"
                            />
                        ) : (
                            <Avatar
                                size="xl"
                                fallback={profile?.full_name || 'U'}
                                className="w-24 h-24"
                            />
                        )}
                        <button
                            onClick={() => setIsEditingPhoto(true)}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {profile?.full_name}
                </h2>
                <p className="text-zinc-500 text-sm">
                    {profile?.age} anos • {profile?.city_origin}
                </p>
            </div>

            {/* Info Cards */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="pt-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Universidade</p>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {profile?.university || 'Não informado'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Curso</p>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {profile?.course || 'Não informado'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500">Orçamento</p>
                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {profile?.budget ? `R$ ${profile.budget.toLocaleString('pt-BR')}/mês` : 'Não informado'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bio */}
                {profile?.bio && (
                    <Card>
                        <CardContent className="pt-5">
                            <p className="text-sm text-zinc-500 mb-1">Sobre mim</p>
                            <p className="text-zinc-900 dark:text-white">{profile.bio}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Looking For */}
                <Card>
                    <CardContent className="pt-5">
                        <p className="text-sm text-zinc-500 mb-1">Procurando</p>
                        <p className="font-medium text-zinc-900 dark:text-white">
                            {profile?.looking_for === 'roommate' ? '🧑‍🤝‍🧑 Colega de quarto' : '🏠 Moradia'}
                        </p>
                    </CardContent>
                </Card>

                {/* Edit Button */}
                <Button
                    variant="secondary"
                    size="lg"
                    className="w-full mt-4"
                    onClick={() => router.push('/onboarding')}
                >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                </Button>
            </div>
        </div>
    )
}
