'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/discover')
                router.refresh()
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error
                router.push('/onboarding')
                router.refresh()
            }
        } catch (err: Error | unknown) {
            const error = err as Error
            setError(error.message || 'Ocorreu um erro')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4">
                        <Home className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        RoomiePI
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Encontre seu colega de moradia
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isLogin ? 'Entrar' : 'Criar Conta'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <Input
                                    label="Nome completo"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            )}
                            <Input
                                label="Email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Input
                                label="Senha"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                error={error || undefined}
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                {isLogin ? 'Entrar' : 'Cadastrar'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError(null)
                                }}
                                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                            >
                                {isLogin
                                    ? 'Não tem conta? Cadastre-se'
                                    : 'Já tem conta? Entre'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
