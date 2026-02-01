'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
    images: string[]
    alt?: string
    className?: string
    aspectRatio?: 'video' | 'square'
}

export function ImageCarousel({
    images,
    alt = 'Imagem',
    className,
    aspectRatio = 'video',
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (images.length === 0) return null

    const goToPrevious = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    return (
        <div
            className={cn(
                'relative overflow-hidden group',
                aspectRatio === 'video' ? 'aspect-video' : 'aspect-square',
                className
            )}
        >
            {/* Current Image */}
            <img
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* Navigation Arrows (only if more than 1 image) */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        aria-label="Imagem anterior"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        aria-label="Próxima imagem"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCurrentIndex(index)
                            }}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                index === currentIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/50 hover:bg-white/75'
                            )}
                            aria-label={`Ir para imagem ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {currentIndex + 1}/{images.length}
                </div>
            )}
        </div>
    )
}
