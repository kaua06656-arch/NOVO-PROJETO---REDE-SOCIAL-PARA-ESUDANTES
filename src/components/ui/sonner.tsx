'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
    return (
        <SonnerToaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: 'bg-zinc-900 border-zinc-800 text-white',
                    title: 'text-white',
                    description: 'text-zinc-400',
                    closeButton: 'bg-zinc-800 text-white hover:bg-zinc-700',
                },
            }}
        />
    )
}
