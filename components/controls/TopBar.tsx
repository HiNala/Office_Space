'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { AGENT_COLORS } from '@/lib/agents'
import { AgentId } from '@/types'

const AGENT_IDS: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']

export function TopBar() {
  const { geminiApiKey, setGeminiApiKey } = useAgentStore()
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="flex items-center gap-3 px-4 py-2" style={{
      background: 'rgba(13, 13, 26, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      height: 48,
    }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#ffd700', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
        OFFICE<span style={{ color: '#4a8fff' }}>SPACE</span>
      </div>

      <div style={{ width: 1, height: 24, background: '#1a1a3a' }} />

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#8888ff', whiteSpace: 'nowrap' }}>
        POWERED BY<br />GEMINI 2.0
      </div>

      <div style={{ width: 1, height: 24, background: '#1a1a3a' }} />

      <div className="flex items-center gap-2 flex-1">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666688', whiteSpace: 'nowrap' }}>API KEY</div>
        <div className="relative flex-1" style={{ maxWidth: 280 }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="AIza..."
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full outline-none pr-8"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: `1px solid ${geminiApiKey ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '4px',
              color: '#f2f2f7',
              fontFamily: 'var(--font-terminal)',
              fontSize: '14px',
              padding: '4px 8px',
              height: 28,
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        {geminiApiKey && (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#00ff88', whiteSpace: 'nowrap' }}>
            CONNECTED
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {AGENT_IDS.map((id, idx) => (
          <div key={id} style={{
            width: 6, height: 6,
            background: AGENT_COLORS[id],
            boxShadow: `0 0 4px ${AGENT_COLORS[id]}`,
            animation: 'pixel-pulse 2s infinite',
            animationDelay: `${idx * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}