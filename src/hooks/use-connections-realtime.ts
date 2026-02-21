import { useEffect } from 'react'
import { useServices } from '@/lib/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useConnectionsRealtime(userId: string | null, onEventCallback?: () => void) {
    const { connectionsService } = useServices()
    const router = useRouter()

    useEffect(() => {
        if (!userId) return

        const channel = connectionsService.subscribeToConnectionUpdates(
            userId,
            (payload) => {
                // Determine what exactly changed in UPDATE
                // Normally it means a 'status' change. 
                const newStatus = payload.new.status
                const isRequester = payload.new.requester_id === userId

                if (newStatus === 'accepted' && isRequester) {
                    toast.success('Sua solicitação foi aceita! 🎉', {
                        description: 'Você já pode enviar mensagens para seu novo colega.',
                        action: {
                            label: 'Ver Conexão',
                            onClick: () => router.push('/network')
                        }
                    })
                }

                if (onEventCallback) onEventCallback()
            },
            () => {
                // Someone inserted a row where receiver_id == userId
                toast.info('Nova solicitação de conexão! 🤝', {
                    description: 'Alguém quer se conectar com você.',
                    action: {
                        label: 'Ver Pedido',
                        onClick: () => router.push('/network')
                    }
                })

                if (onEventCallback) onEventCallback()
            }
        )

        return () => {
            connectionsService.unsubscribe(channel)
        }
    }, [userId, connectionsService, router, onEventCallback])
}
