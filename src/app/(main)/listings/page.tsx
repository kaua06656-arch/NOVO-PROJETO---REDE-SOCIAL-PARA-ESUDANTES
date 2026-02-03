'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { Database } from '@/types/database.types'
import { Loader2, Building2, Plus, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'

type Listing = Database['public']['Tables']['listings']['Row']

export default function ListingsPage() {
    const supabase = createClient()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchListings() {
            const { data } = await supabase
                .from('listings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) {
                setListings(data)
            }
            setLoading(false)
        }

        fetchListings()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="p-4">
            <header className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Moradias
                    </h1>
                    <p className="text-sm text-zinc-500">
                        Quartos e apartamentos disponíveis
                    </p>
                </div>
                <Link href="/listings/new">
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Anunciar
                    </Button>
                </Link>
            </header>

            {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <Building2 className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                        Nenhum anúncio ainda
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4">
                        Seja o primeiro a anunciar uma moradia!
                    </p>
                    <Link href="/listings/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-1" />
                            Criar Anúncio
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {listings.map((listing) => (
                        <Link key={listing.id} href={`/listings/${listing.id}`} className="block">
                            <Card className="overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                                {/* Image Carousel */}
                                <div className="relative">
                                    {listing.images && listing.images.length > 0 ? (
                                        <ImageCarousel
                                            images={listing.images}
                                            alt={listing.title}
                                            aspectRatio="video"
                                        />
                                    ) : (
                                        <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                            <Building2 className="w-12 h-12 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-white dark:bg-zinc-900 text-emerald-600 font-bold px-3 py-1 rounded-full text-sm z-10">
                                        R$ {listing.price.toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                                        {listing.title}
                                    </h3>
                                    {listing.location && (
                                        <div className="flex items-center gap-1 text-sm text-zinc-500">
                                            <MapPin className="w-4 h-4" />
                                            <span>{listing.location}</span>
                                        </div>
                                    )}
                                    {listing.description && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                                            {listing.description}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
