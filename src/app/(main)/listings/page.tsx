/* <title> | name="description" | property="og: */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useServices } from '@/lib/services'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageCarousel } from '@/components/ui/image-carousel'
import { Database } from '@/types/database.types'
import { Building2, Plus, MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

type Listing = Database['public']['Tables']['listings']['Row']

export default function ListingsPage() {
    const { listingsService } = useServices()
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    const fetchListings = useCallback(async () => {
        const { data } = await listingsService.getAllListings()

        if (data) {
            setListings(data as Listing[])
        }
        setLoading(false)
    }, [listingsService])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchListings()
    }, [fetchListings])

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <header className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Moradias</h1>
                        <p className="text-sm text-zinc-500">Quartos e apartamentos disponíveis</p>
                    </div>
                </header>

                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="w-full aspect-video" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <header className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Moradias
                    </h2>
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
