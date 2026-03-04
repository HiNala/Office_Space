'use client'
import { useEffect, useState } from 'react'

const BOOT_LINES = [
    'OFFICE SPACE OS v1.0',
    '─────────────────────',
    'Initializing Gemini 3.1 interface...',
    'Loading agent personalities...',
    '  REX [ARCHITECT]......... OK',
    '  NOVA [RESEARCHER]........ OK',
    '  SAGE [REVIEWER].......... OK',
    '  BYTE [SECURITY].......... OK',
    '  FLORA [STRATEGIST]....... OK',
    'Spawning office environment...',
    'Starting idle behavior system...',
    '─────────────────────',
    'ALL SYSTEMS NOMINAL',
    'READY.',
]

export function BootScreen({ onComplete }: { onComplete: () => void }) {
    const [lines, setLines] = useState<string[]>([])
    const [done, setDone] = useState(false)

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            if (i < BOOT_LINES.length) {
                setLines(prev => {
                    if (!prev.includes(BOOT_LINES[i])) {
                        return [...prev, BOOT_LINES[i]]
                    }
                    return prev
                })
                i++
            } else {
                clearInterval(interval)
                setTimeout(() => {
                    setDone(true)
                    setTimeout(onComplete, 500)
                }, 600)
            }
        }, 120)
        return () => clearInterval(interval)
    }, [onComplete])

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
                background: '#000008',
                opacity: done ? 0 : 1,
                transition: 'opacity 0.5s ease-out',
            }}
        >
            <div style={{ width: 360, padding: 24 }}>
                {/* Pixel art logo */}
                <div className="text-center mb-6">
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#ffd700', marginBottom: 4 }}>
                        🕹️ OFFICE SPACE
                    </div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a8fff' }}>
                        GEMINI 3.1 MULTI-AGENT SYSTEM
                    </div>
                </div>

                {/* Boot text */}
                <div style={{
                    background: '#000a00',
                    border: '2px solid #00aa44',
                    padding: '12px',
                    minHeight: 200,
                    boxShadow: '0 0 20px rgba(0,170,68,0.3)',
                }}>
                    {lines.map((line, i) => (
                        <div
                            key={i}
                            style={{
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '13px',
                                color: line.includes('OK') ? '#00ff88' : line.includes('READY') ? '#ffd700' : line.startsWith('─') ? '#2a5a3a' : '#88cc88',
                                lineHeight: 1.6,
                            }}
                        >
                            {line}
                        </div>
                    ))}
                    {!done && (
                        <span style={{ animation: 'blink-cursor 0.7s infinite', borderRight: '8px solid #00ff88', marginLeft: 2 }} />
                    )}
                </div>
            </div>
        </div>
    )
}
