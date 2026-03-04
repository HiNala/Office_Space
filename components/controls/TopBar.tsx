'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function TopBar() {
  const { geminiApiKey, setGeminiApiKey } = useAgentStore()
  const [showKey, setShowKey] = useState(false)
  const [localKey, setLocalKey] = useState(geminiApiKey)

  return (
    <div className="flex items-center gap-3 px-4 py-2" style={{
      background: '#080812',
      borderBottom: '2px solid #1a1a3a',
      height: 48,
    }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#ffd700', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
        🕹️ OFFICE<span style={{ color: '#4a8fff' }}>SPACE</span>
      </div>

      <div style={{ width: 1, height: 24, background: '#1a1a3a' }} />

      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#8888ff', whiteSpace: 'nowrap' }}>
        POWERED BY<br/>GEMINI 3.1
      </div>

      <div style={{ width: 1, height: 24, background: '#1a1a3a' }} />

      <div className="flex items-center gap-2 flex-1">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666688', whiteSpace: 'nowrap' }}>API KEY</div>
        <div className="relative flex-1" style={{ maxWidth: 280 }}>
          <input
            type={showKey ? 'text' : 'password'}
            placeholder="AIza..."
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            onBlur={() => setGeminiApiKey(localKey)}
            className="w-full outline-none pr-8"
            style={{
              background: '#0d0d1a',
              border: `2px solid ${geminiApiKey ? '#00aa44' : '#2a2a5a'}`,
              color: '#ccccee',
              fontFamily: 'var(--font-terminal)',
              fontSize: '13px',
              padding: '4px 8px',
              height: 28,
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
        </div>
        {geminiApiKey && (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#00ff88', whiteSpace: 'nowrap' }}>
            ● CONNECTED
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {(['rex','nova','sage','byte','flora'] as const).map((id) => (
          <div key={id} style={{
            width: 6, height: 6,
            background: { rex:'#4a8fff', nova:'#b44aff', sage:'#4aff8f', byte:'#ff4a4a', flora:'#ff8fcc' }[id],
            boxShadow: `0 0 4px ${{ rex:'#4a8fff', nova:'#b44aff', sage:'#4aff8f', byte:'#ff4a4a', flora:'#ff8fcc' }[id]}`,
            animation: 'pixel-pulse 2s infinite',
            animationDelay: `${['rex','nova','sage','byte','flora'].indexOf(id) * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  )
}
