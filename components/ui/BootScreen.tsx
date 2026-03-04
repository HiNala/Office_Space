'use client'
import { useEffect, useState } from 'react'

const BOOT_LINES = [
    'OFFICE SPACE OS v1.0',
    '─────────────────────────────',
    'Initializing Gemini 2.0 interface...',
    'Loading agent personalities...',
    '  REX [ARCHITECT]......... OK',
    '  NOVA [RESEARCHER]........ OK',
    '  SAGE [REVIEWER].......... OK',
    '  BYTE [SECURITY].......... OK',
    '  FLORA [STRATEGIST]....... OK',
    'Spawning office environment...',
    'Starting idle behavior system...',
    '═════════════════════════════',
    'ALL SYSTEMS NOMINAL',
    'READY.',
]

interface BootScreenProps {
    onComplete: () => void
}

export function BootScreen({ onComplete }: BootScreenProps) {
    const [lines, setLines] = useState<string[]>([])
    const [done, setDone] = useState(false)

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            if (i < BOOT_LINES.length) {
                const line = BOOT_LINES[i]
                setLines(prev => [...prev, line])
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
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                background: '#040408',
                opacity: done ? 0 : 1,
                transition: 'opacity 0.5s ease-out',
                pointerEvents: done ? 'none' : 'all',
            }}
        >
            <div style={{ width: 380, padding: '24px 28px' }}>
                <div className="mb-4 text-center">
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '14px', color: '#ffd700', marginBottom: 4 }}>
                        OFFICE SPACE
                    </div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a8fff' }}>
                        GEMINI 2.0 MULTI-AGENT SYSTEM
                    </div>
                </div>

                <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '12px', color: '#4aff8f', lineHeight: 1.8 }}>
                    {lines.map((line, i) => (
                        <div key={i} style={{ opacity: 0.9 }}>{line}</div>
                    ))}
                    {!done && (
                        <span style={{ color: '#ffd700', animation: 'pixel-pulse 0.6s infinite' }}>█</span>
                    )}
                </div>
            </div>
        </div>
    )
}