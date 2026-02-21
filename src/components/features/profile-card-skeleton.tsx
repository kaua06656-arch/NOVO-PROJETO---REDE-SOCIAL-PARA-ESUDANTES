import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            {/* Image Placeholder */}
            <Skeleton className="w-full aspect-[3/4] rounded-none" />

            {/* Details Placeholder */}
            <div className="p-4 space-y-4">
                {/* Location & Budget */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Bio text lines */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>

                {/* Tags */}
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-10 flex-1 rounded-md" />
                    <Skeleton className="h-10 flex-1 rounded-md" />
                </div>
            </div>
        </Card>
    )
}
