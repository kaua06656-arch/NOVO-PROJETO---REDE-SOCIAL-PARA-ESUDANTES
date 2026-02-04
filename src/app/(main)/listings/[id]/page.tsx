'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { ImageCarousel } from '@/components/ui/image-carousel'
import {
    ArrowLeft,
    MapPin,
    Trash2,
    MessageCircle,
    Loader2,
    Building2,
    AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type Listing = Database['public']['Tables']['listings']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function ListingDetailPage() {
    const params = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [listing, setListing] = useState<Listing | null>(null)
    const [owner, setOwner] = useState<Profile | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [contacting, setContacting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const isOwner = currentUserId && listing?.owner_id === currentUserId

    useEffect(() => {
        async function fetchData() {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)

            // Fetch listing
            const { data: listingData, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', params.id as string)
                .single()

            if (error || !listingData) {
                setLoading(false)
                return
            }

            setListing(listingData as Listing)

            // Fetch owner profile
            const { data: ownerData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', (listingData as Listing).owner_id)
                .single()

            if (ownerData) setOwner(ownerData as Profile)
            setLoading(false)
        }

        fetchData()
    }, [params.id, supabase])

    const handleDelete = async () => {
        if (!listing) return
        setDeleting(true)

        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', listing.id)

        if (error) {
            toast.error('Erro ao excluir anúncio', {
                description: 'Tente novamente mais tarde.',
            })
            setDeleting(false)
            return
        }

        toast.success('Anúncio excluído!', {
            description: 'Seu anúncio foi removido com sucesso.',
        })
        router.push('/listings')
    }

    const handleContact = async () => {
        if (!currentUserId || !owner) return
        setContacting(true)

        // Check if already connected
        const { data: existingConnection } = await supabase
            .from('connections')
            .select('id, status')
            .or(`and(requester_id.eq.${currentUserId},receiver_id.eq.${owner.id}),and(requester_id.eq.${owner.id},receiver_id.eq.${currentUserId})`)
            .single()

        if (existingConnection) {
            // @ts-expect-error - Type inference issue
            if (existingConnection.status === 'accepted') {
                // Already connected - go to chat
                // @ts-expect-error - Type inference issue
                router.push(`/chat/${existingConnection.id}`)
            } else {
                toast.info('Solicitação já enviada', {
                    description: 'Aguarde a resposta do anunciante.',
                })
            }
            setContacting(false)
            return
        }

        // Create new connection request
        const { error } = await supabase
            .from('connections')
            // @ts-ignore - Supabase types incomplete for connections
            .insert({
                requester_id: currentUserId,
                receiver_id: owner.id,
                status: 'pending',
            })

        if (error) {
            toast.error('Erro ao enviar solicitação')
            setContacting(false)
            return
        }

        toast.success('Solicitação enviada!', {
            description: `${owner.full_name} será notificado(a).`,
        })
        setContacting(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
                <Building2 className="w-16 h-16 text-zinc-400 mb-4" />
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                    Anúncio não encontrado
                </h2>
                <p className="text-zinc-500 mb-4">
                    Este anúncio pode ter sido removido.
                </p>
                <Link href="/listings">
                    <Button variant="secondary">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Moradias
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-sm p-4 flex items-center gap-3">
                <Link href="/listings">
                    <Button variant="ghost" size="sm" className="text-white p-2">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-semibold text-white truncate">
                    {listing.title}
                </h1>
            </header>

            {/* Image Carousel */}
            <div className="relative">
                {listing.images && listing.images.length > 0 ? (
                    <ImageCarousel
                        images={listing.images}
                        alt={listing.title}
                        aspectRatio="video"
                    />
                ) : (
                    <div className="aspect-video bg-zinc-800 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-zinc-600" />
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-lg shadow-lg">
                    R$ {listing.price.toLocaleString('pt-BR')}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Title & Location */}
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {listing.title}
                    </h2>
                    {listing.location && (
                        <div className="flex items-center gap-1 text-zinc-500 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                        </div>
                    )}
                </div>

                {/* Description */}
                {listing.description && (
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                            Descrição
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                            {listing.description}
                        </p>
                    </div>
                )}

                {/* Owner Card */}
                {owner && (
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            {owner.photos?.[0] ? (
                                <img
                                    src={owner.photos[0]}
                                    alt={owner.full_name || ''}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <Avatar size="md" fallback={owner.full_name || 'A'} />
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-zinc-900 dark:text-white">
                                    {owner.full_name}
                                </p>
                                <p className="text-sm text-zinc-500">
                                    {owner.university || 'Anunciante'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardContent className="p-6 text-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                                Excluir anúncio?
                            </h3>
                            <p className="text-zinc-500 text-sm mb-6">
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Excluir'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-sm border-t border-zinc-800">
                <div className="max-w-md mx-auto">
                    {isOwner ? (
                        <Button
                            variant="destructive"
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Anúncio
                        </Button>
                    ) : currentUserId ? (
                        <Button
                            className="w-full"
                            onClick={handleContact}
                            disabled={contacting}
                        >
                            {contacting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <MessageCircle className="w-4 h-4 mr-2" />
                            )}
                            Entrar em Contato
                        </Button>
                    ) : (
                        <Link href="/login" className="block">
                            <Button className="w-full">
                                Faça login para entrar em contato
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
