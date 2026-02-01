'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    bucket: 'avatars' | 'listings'
    userId: string
    currentUrl?: string | null
    onUpload: (url: string) => void
    onRemove?: () => void
    size?: 'sm' | 'md' | 'lg'
    shape?: 'circle' | 'square'
    className?: string
}

const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
}

export function ImageUpload({
    bucket,
    userId,
    currentUrl,
    onUpload,
    onRemove,
    size = 'lg',
    shape = 'circle',
    className,
}: ImageUploadProps) {
    const supabase = createClient()
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            alert('Por favor, selecione uma imagem JPG, PNG ou WebP')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB')
            return
        }

        setIsUploading(true)

        try {
            // Create preview
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true,
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            onUpload(publicUrl)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Erro ao fazer upload da imagem')
            setPreviewUrl(currentUrl || null)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        setPreviewUrl(null)
        if (inputRef.current) inputRef.current.value = ''
        onRemove?.()
    }

    return (
        <div className={cn('relative inline-block', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id={`image-upload-${bucket}`}
            />

            <label
                htmlFor={`image-upload-${bucket}`}
                className={cn(
                    'relative flex items-center justify-center cursor-pointer border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden transition-all hover:border-emerald-500 dark:hover:border-emerald-400',
                    sizeClasses[size],
                    shape === 'circle' ? 'rounded-full' : 'rounded-xl',
                    isUploading && 'opacity-50 cursor-wait',
                    previewUrl && 'border-solid border-emerald-500'
                )}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-xs">Foto</span>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                )}
            </label>

            {previewUrl && onRemove && !isUploading && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}

// Multi-image upload for listings
interface MultiImageUploadProps {
    bucket: 'listings'
    userId: string
    currentUrls?: string[]
    onUpload: (urls: string[]) => void
    maxImages?: number
    className?: string
}

export function MultiImageUpload({
    bucket,
    userId,
    currentUrls = [],
    onUpload,
    maxImages = 5,
    className,
}: MultiImageUploadProps) {
    const supabase = createClient()
    const [isUploading, setIsUploading] = useState(false)
    const [images, setImages] = useState<string[]>(currentUrls)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        const remainingSlots = maxImages - images.length
        if (files.length > remainingSlots) {
            alert(`Você pode adicionar apenas mais ${remainingSlots} imagem(s)`)
            return
        }

        setIsUploading(true)
        const newUrls: string[] = []

        try {
            for (const file of files) {
                // Validate
                const validTypes = ['image/jpeg', 'image/png', 'image/webp']
                if (!validTypes.includes(file.type)) continue
                if (file.size > 5 * 1024 * 1024) continue

                const fileExt = file.name.split('.').pop()
                const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true,
                    })

                if (uploadError) continue

                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(fileName)

                newUrls.push(publicUrl)
            }

            const updatedImages = [...images, ...newUrls]
            setImages(updatedImages)
            onUpload(updatedImages)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Erro ao fazer upload das imagens')
        } finally {
            setIsUploading(false)
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    const handleRemove = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index)
        setImages(updatedImages)
        onUpload(updatedImages)
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap gap-3">
                {images.map((url, index) => (
                    <div key={index} className="relative group">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700">
                            <img
                                src={url}
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label
                        htmlFor="multi-image-upload"
                        className={cn(
                            'w-24 h-24 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors',
                            isUploading && 'opacity-50 cursor-wait'
                        )}
                    >
                        {isUploading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                        ) : (
                            <>
                                <Plus className="w-6 h-6 text-zinc-400" />
                                <span className="text-xs text-zinc-400 mt-1">
                                    {images.length}/{maxImages}
                                </span>
                            </>
                        )}
                    </label>
                )}
            </div>

            <input
                ref={inputRef}
                id="multi-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {images.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <ImageIcon className="w-4 h-4" />
                    <span>Adicione fotos da moradia (máx. {maxImages})</span>
                </div>
            )}
        </div>
    )
}
