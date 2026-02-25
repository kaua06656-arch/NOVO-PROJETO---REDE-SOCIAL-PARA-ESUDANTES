import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RoomiePI - Conectando Estudantes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 20,
                            fontSize: 40,
                        }}
                    >
                        🏠
                    </div>
                    <span
                        style={{
                            fontSize: 72,
                            fontWeight: 'bold',
                            color: 'white',
                            letterSpacing: -2,
                        }}
                    >
                        RoomiePI
                    </span>
                </div>
                <span
                    style={{
                        fontSize: 32,
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: 8,
                    }}
                >
                    Conectando Estudantes
                </span>
                <span
                    style={{
                        fontSize: 20,
                        color: 'rgba(255,255,255,0.7)',
                        marginTop: 16,
                        maxWidth: 600,
                        textAlign: 'center',
                    }}
                >
                    Encontre o colega e o local ideal para morar de forma simples e segura.
                </span>
            </div>
        ),
        { ...size }
    )
}
