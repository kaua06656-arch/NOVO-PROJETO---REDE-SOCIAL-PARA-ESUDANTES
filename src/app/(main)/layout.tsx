import { BottomNav } from '@/components/shared/bottom-nav'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <main className="pb-20 max-w-md mx-auto">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
