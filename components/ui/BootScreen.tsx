'use client'
import { useEffect, useRef, useState } from 'react'

const BOOT_LINES = [
    'PIXEL AGENTS OS v1.0',
    '─────────────────────',
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
    // Use a ref so the effect never needs onComplete as a dep (avoids restarts)
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    useEffect(() => {
        let idx = 0
        const interval = setInterval(() => {
            if (idx < BOOT_LINES.length) {
                // Capture line by value NOW, before idx is incremented,
                // so the React state updater always sees the correct string
                // even if React defers/batches the callback.
                const line = BOOT_LINES[idx]
                idx++
                setLines(prev => [...prev, line])
            } else {
                clearInterval(interval)
                setTimeout(() => {
                    setDone(true)
                    setTimeout(() => onCompleteRef.current(), 500)
                }, 600)
            }
        }, 120)
        return () => clearInterval(interval)
    }, []) // empty — stable via ref

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
                        <div
                            key={i}
                            style={{
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '13px',
                                color: !line ? '#88cc88' : line.includes('OK') ? '#00ff88' : line.includes('READY') ? '#ffd700' : line.startsWith('─') ? '#2a5a3a' : '#88cc88',
                                lineHeight: 1.6,
                            }}
                        >
                            {line}
                        </div>
                    ))}
                    {!done && (
                        <span style={{ color: '#ffd700', animation: 'pixel-pulse 0.6s infinite' }}>█</span>
                    )}
                </div>
            </div>
        </div>
    )
}