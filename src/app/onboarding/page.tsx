'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Check, Home } from 'lucide-react'
import type { Database } from '@/types/database.types'

type PreferenceKey = 'smoker' | 'pets' | 'party' | 'sleep_early' | 'clean'
type Profile = Database['public']['Tables']['profiles']['Row']

const STEPS = [
    { id: 1, title: 'Informações Básicas' },
    { id: 2, title: 'Estilo de Vida' },
    { id: 3, title: 'Objetivo' },
]

export default function OnboardingPage() {
    const supabase = createClient()
    const router = useRouter()

    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        university: '',
        course: '',
        age: '',
        city_origin: '',
        budget: '',
        bio: '',
        looking_for: '' as 'roommate' | 'housing' | '',
        preferences: {
            smoker: false,
            pets: false,
            party: false,
            sleep_early: false,
            clean: false,
        },
    })

    // Load existing profile data
    useEffect(() => {
        async function loadExistingProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoadingProfile(false)
                return
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            const profile = profileData as Profile | null

            if (profile) {
                const prefs = profile.preferences as typeof formData.preferences | null
                setFormData({
                    full_name: profile.full_name || '',
                    university: profile.university || '',
                    course: profile.course || '',
                    age: profile.age?.toString() || '',
                    city_origin: profile.city_origin || '',
                    budget: profile.budget?.toString() || '',
                    bio: profile.bio || '',
                    looking_for: (profile.looking_for as 'roommate' | 'housing') || '',
                    preferences: prefs || {
                        smoker: false,
                        pets: false,
                        party: false,
                        sleep_early: false,
                        clean: false,
                    },
                })
            }
            setIsLoadingProfile(false)
        }

        loadExistingProfile()
    }, [supabase])

    const updateField = (field: string, value: string | number | boolean | object) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const togglePreference = (key: PreferenceKey) => {
        setFormData((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: !prev.preferences[key],
            },
        }))
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // @ts-expect-error - Supabase types require real database connection
        await supabase.from('profiles').upsert({
            id: user.id,
            full_name: formData.full_name,
            university: formData.university,
            course: formData.course,
            age: parseInt(formData.age) || null,
            city_origin: formData.city_origin,
            budget: parseFloat(formData.budget) || null,
            bio: formData.bio,
            looking_for: formData.looking_for || null,
            preferences: formData.preferences,
        })

        router.push('/discover')
        router.refresh()
    }

    const canProceed = () => {
        if (step === 1) {
            return formData.full_name && formData.university && formData.age
        }
        if (step === 3) {
            return formData.looking_for !== ''
        }
        return true
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-zinc-900 dark:text-white">
                            Complete seu Perfil
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Passo {step} de {STEPS.length}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-6">
                    {STEPS.map((s) => (
                        <div
                            key={s.id}
                            className={`h-1 flex-1 rounded-full ${s.id <= step ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{STEPS[step - 1].title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <>
                                <Input
                                    label="Nome completo"
                                    value={formData.full_name}
                                    onChange={(e) => updateField('full_name', e.target.value)}
                                    placeholder="Seu nome"
                                />
                                <Input
                                    label="Universidade"
                                    value={formData.university}
                                    onChange={(e) => updateField('university', e.target.value)}
                                    placeholder="Ex: UFPI, UESPI, UNINOVAFAPI..."
                                />
                                <Input
                                    label="Curso"
                                    value={formData.course}
                                    onChange={(e) => updateField('course', e.target.value)}
                                    placeholder="Ex: Medicina, Direito..."
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Idade"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => updateField('age', e.target.value)}
                                        placeholder="18"
                                    />
                                    <Input
                                        label="Orçamento (R$/mês)"
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => updateField('budget', e.target.value)}
                                        placeholder="800"
                                    />
                                </div>
                                <Input
                                    label="Cidade de origem"
                                    value={formData.city_origin}
                                    onChange={(e) => updateField('city_origin', e.target.value)}
                                    placeholder="Ex: Picos, Floriano..."
                                />
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <p className="text-sm text-zinc-500 mb-4">
                                    Marque o que se aplica a você:
                                </p>
                                {[
                                    { key: 'smoker' as PreferenceKey, label: '🚬 Fumo', desc: 'Você fuma?' },
                                    { key: 'pets' as PreferenceKey, label: '🐶 Pets', desc: 'Tem ou aceita animais?' },
                                    { key: 'party' as PreferenceKey, label: '🎉 Festeiro', desc: 'Gosta de festas?' },
                                    { key: 'sleep_early' as PreferenceKey, label: '🌙 Dorme cedo', desc: 'Costuma dormir cedo?' },
                                    { key: 'clean' as PreferenceKey, label: '✨ Organizado', desc: 'Se considera organizado?' },
                                ].map(({ key, label, desc }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => togglePreference(key)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${formData.preferences[key]
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-zinc-200 dark:border-zinc-700'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-zinc-900 dark:text-white">{label}</p>
                                            <p className="text-sm text-zinc-500">{desc}</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.preferences[key]
                                                ? 'border-emerald-500 bg-emerald-500'
                                                : 'border-zinc-300 dark:border-zinc-600'
                                                }`}
                                        >
                                            {formData.preferences[key] && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {/* Hint when no preferences selected */}
                                {!Object.values(formData.preferences).some(Boolean) && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                                        💡 Dica: Selecione pelo menos uma opção para melhorar suas recomendações!
                                    </p>
                                )}
                                <Input
                                    label="Fale um pouco sobre você"
                                    value={formData.bio}
                                    onChange={(e) => updateField('bio', e.target.value)}
                                    placeholder="Sou estudante de medicina, gosto de cozinhar..."
                                />
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <p className="text-sm text-zinc-500 mb-4">
                                    O que você está procurando?
                                </p>
                                {[
                                    {
                                        value: 'roommate' as const,
                                        label: '🧑‍🤝‍🧑 Colega de quarto',
                                        desc: 'Já tenho moradia, preciso dividir',
                                    },
                                    {
                                        value: 'housing' as const,
                                        label: '🏠 Moradia',
                                        desc: 'Estou procurando onde morar',
                                    },
                                ].map(({ value, label, desc }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => updateField('looking_for', value)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${formData.looking_for === value
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-zinc-200 dark:border-zinc-700'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className="font-medium text-zinc-900 dark:text-white">{label}</p>
                                            <p className="text-sm text-zinc-500">{desc}</p>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.looking_for === value
                                                ? 'border-emerald-500 bg-emerald-500'
                                                : 'border-zinc-300 dark:border-zinc-600'
                                                }`}
                                        >
                                            {formData.looking_for === value && (
                                                <Check className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                    {step > 1 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                            onClick={() => setStep((s) => s - 1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Voltar
                        </Button>
                    )}
                    {step < STEPS.length ? (
                        <Button
                            size="lg"
                            className="flex-1"
                            disabled={!canProceed()}
                            onClick={() => setStep((s) => s + 1)}
                        >
                            Próximo
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="flex-1"
                            disabled={!canProceed() || isLoading}
                            onClick={handleSubmit}
                            isLoading={isLoading}
                        >
                            Concluir
                            <Check className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
