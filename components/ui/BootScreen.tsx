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
    '─────────────────────',
    'ALL SYSTEMS NOMINAL',
    'READY.',
]

export function BootScreen({ onComplete }: { onComplete: () => void }) {
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
                        🕹️ PIXEL AGENTS
                    </div>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a8fff' }}>
                        GEMINI 2.0 MULTI-AGENT SYSTEM
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
                                color: !line ? '#88cc88' : line.includes('OK') ? '#00ff88' : line.includes('READY') ? '#ffd700' : line.startsWith('─') ? '#2a5a3a' : '#88cc88',
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
