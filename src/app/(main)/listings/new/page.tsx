'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiImageUpload } from '@/components/ui/image-upload'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function NewListingPage() {
    const supabase = createClient()
    const router = useRouter()

    const [userId, setUserId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        location: '',
        images: [] as string[],
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setUserId(user.id)
        }
        getUser()
    }, [supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Você precisa estar logado')
            setIsLoading(false)
            return
        }

        if (formData.images.length === 0) {
            setError('Adicione pelo menos uma foto da moradia')
            setIsLoading(false)
            return
        }

        // @ts-expect-error - Supabase types require real database connection
        const { error: insertError } = await supabase.from('listings').insert({
            owner_id: user.id,
            title: formData.title,
            description: formData.description || null,
            price: parseFloat(formData.price),
            location: formData.location || null,
            images: formData.images,
        })

        if (insertError) {
            setError(insertError.message)
            setIsLoading(false)
            return
        }

        router.push('/listings')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/listings" className="p-1">
                        <ArrowLeft className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                    </Link>
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Novo Anúncio
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                            Detalhes da Moradia
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Fotos da moradia *
                                </label>
                                {userId && (
                                    <MultiImageUpload
                                        bucket="listings"
                                        userId={userId}
                                        currentUrls={formData.images}
                                        onUpload={(urls) => setFormData({ ...formData, images: urls })}
                                        maxImages={5}
                                    />
                                )}
                            </div>

                            <Input
                                label="Título do anúncio"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Quarto mobiliado próximo à UFPI"
                                required
                            />
                            <Input
                                label="Preço mensal (R$)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="800"
                                required
                            />
                            <Input
                                label="Localização"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ex: Ininga, próximo ao shopping"
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva a moradia, comodidades, regras..."
                                    rows={4}
                                    className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                Publicar Anúncio
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
