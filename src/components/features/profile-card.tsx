import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Database } from '@/types/database.types'
import { Heart, X, DollarSign, MapPin, GraduationCap, Cigarette, Dog, PartyPopper, Moon, Sparkles, UserPlus } from 'lucide-react'
import { ReactNode } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfileCardProps {
    profile: Profile
    onLike: () => void
    onPass: () => void
    compatibility?: number
    likeLabel?: string
    likeIcon?: ReactNode
}

export function ProfileCard({ profile, onLike, onPass, compatibility, likeLabel = 'Conectar', likeIcon }: ProfileCardProps) {
    const preferences = profile.preferences as Profile['preferences']

    const preferenceIcons = [
        { key: 'smoker', icon: Cigarette, label: 'Fuma' },
        { key: 'pets', icon: Dog, label: 'Pets' },
        { key: 'party', icon: PartyPopper, label: 'Festeiro' },
        { key: 'sleep_early', icon: Moon, label: 'Dorme cedo' },
        { key: 'clean', icon: Sparkles, label: 'Organizado' },
    ] as const

    return (
        <Card className="overflow-hidden">
            {/* Photo */}
            <div className="relative aspect-[3/4] bg-zinc-200 dark:bg-zinc-800">
                {profile.photos?.[0] ? (
                    <img
                        src={profile.photos[0]}
                        alt={profile.full_name || 'Perfil'}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Avatar
                            size="xl"
                            fallback={profile.full_name || 'U'}
                        />
                    </div>
                )}

                {/* Compatibility Badge */}
                {compatibility !== undefined && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                        {compatibility}% match
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Info over image */}
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                    <h2 className="text-xl font-bold">
                        {profile.full_name}, {profile.age}
                    </h2>
                    <div className="flex items-center gap-1 text-sm opacity-90 mt-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{profile.university}</span>
                    </div>
                    {profile.course && (
                        <p className="text-sm opacity-75">{profile.course}</p>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
                {/* Location & Budget */}
                <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                    {profile.city_origin && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{profile.city_origin}</span>
                        </div>
                    )}
                    {profile.budget && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>R$ {profile.budget.toLocaleString('pt-BR')}/mês</span>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                        {profile.bio}
                    </p>
                )}

                {/* Preferences Tags */}
                {preferences && (
                    <div className="flex flex-wrap gap-2">
                        {preferenceIcons.map(({ key, icon: Icon, label }) => {
                            const value = preferences[key]
                            if (value === undefined) return null
                            return (
                                <span
                                    key={key}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${value
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}
                                >
                                    <Icon className="w-3 h-3" />
                                    {value ? label : `Não ${label.toLowerCase()}`}
                                </span>
                            )
                        })}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        size="lg"
                        className="flex-1"
                        onClick={onPass}
                    >
                        <X className="w-5 h-5 mr-1" />
                        Pular
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        onClick={onLike}
                    >
                        {likeIcon || <UserPlus className="w-5 h-5 mr-1" />}
                        <span className="ml-1">{likeLabel}</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
