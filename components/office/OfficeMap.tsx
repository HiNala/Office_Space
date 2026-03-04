'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { AgentSprite } from './AgentSprite'
import { Agent, AgentId } from '@/types'
import { useState } from 'react'
import { AgentCard } from '@/components/agents/AgentCard'
import { AGENT_COLORS } from '@/lib/agents'

function PixelDesk({ color, label }: { color: string; label: string }) {
  return (
    <div className="relative" style={{ width: 64, height: 48 }}>
      <div style={{ position: 'absolute', top: 0, left: 8, width: 32, height: 22, background: '#1a1a3a', border: `2px solid ${color}`, boxShadow: `0 0 6px ${color}44` }}>
        <div style={{ margin: 2, background: '#0a0a2a', height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 16, height: 2, background: color, opacity: 0.6, animation: 'pixel-pulse 2s infinite' }} />
        </div>
        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, background: '#333' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: '#5a3e18', border: '2px solid #3a2a0a', boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', top: 3, right: 4, width: 12, height: 8, background: '#eeeedd', transform: 'rotate(-5deg)' }} />
        <div style={{ position: 'absolute', top: 5, right: 8, width: 10, height: 7, background: '#ddddcc', transform: 'rotate(3deg)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)', fontSize: '6px', fontFamily: 'var(--font-pixel)', color, whiteSpace: 'nowrap' }}>
        {label}
      </div>
    </div>
  )
}

function WaterCooler() {
  return (
    <div style={{ width: 20, height: 36, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 3, width: 14, height: 14, background: '#4a8fd4', border: '2px solid #2a5a9a', borderRadius: '50% 50% 0 0' }} />
      <div style={{ position: 'absolute', top: 12, left: 0, width: 20, height: 24, background: '#ccccdd', border: '2px solid #8888aa' }}>
        <div style={{ position: 'absolute', top: 4, left: 2, width: 6, height: 6, background: '#4a8fd4', border: '1px solid #2a5a9a' }} />
        <div style={{ position: 'absolute', top: 4, right: 2, width: 6, height: 6, background: '#ff4444', border: '1px solid #aa2222' }} />
      </div>
    </div>
  )
}

// 5-chair conference table for all 5 agents
const CHAIR_STYLES: React.CSSProperties[] = [
  { top: 4, left: '25%', transform: 'translateX(-50%)' },
  { top: 4, left: '75%', transform: 'translateX(-50%)' },
  { bottom: 4, left: '50%', transform: 'translateX(-50%)' },
  { top: '50%', left: 4, transform: 'translateY(-50%)' },
  { top: '50%', right: 4, transform: 'translateY(-50%)' },
]

function ConferenceTable() {
  return (
    <div style={{ position: 'relative', width: 120, height: 64 }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 44, background: '#4a3010', border: '3px solid #2a1a08', boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </div>
      {CHAIR_STYLES.map((style, i) => (
        <div key={i} style={{ position: 'absolute', width: 14, height: 14, background: '#2a1a3a', border: '2px solid #4a3a5a', ...style }} />
      ))}
    </div>
  )
}

export function OfficeMap() {
  const { agents, isConferenceMode, screenFlash } = useAgentStore()
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--carpet-blue)' }}>
      {screenFlash && (
        <div
          className="absolute inset-0 bg-white z-50 pointer-events-none"
          style={{ animation: 'screen-flash 0.6s ease-out forwards' }}
        />
      )}

      <div className="scanline-overlay" />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 9998,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 9997,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
          backgroundSize: '4px 4px',
        }}
      />

      {/* Wall */}
      <div className="absolute top-0 left-0 right-0 h-16 office-wall" style={{ zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 8, left: '25%', width: 48, height: 32, background: 'linear-gradient(135deg, #4a8fd4 0%, #6aafff 50%, #4a8fd4 100%)', border: '3px solid #2a3a5a', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(100,200,255,0.3)' }} />)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 8, right: '25%', width: 48, height: 32, background: 'linear-gradient(135deg, #4a8fd4 0%, #6aafff 50%, #4a8fd4 100%)', border: '3px solid #2a3a5a', boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ background: 'rgba(100,200,255,0.3)' }} />)}
          </div>
        </div>
        {/* Clock */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#1a1a3a', border: '2px solid #8888aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 2, height: 8, background: '#ffffff', transformOrigin: 'bottom center', transform: `rotate(${new Date().getHours() * 30}deg)`, position: 'absolute', bottom: '50%' }} />
          <div style={{ width: 1, height: 9, background: '#4a8fff', transformOrigin: 'bottom center', transform: `rotate(${new Date().getMinutes() * 6}deg)`, position: 'absolute', bottom: '50%' }} />
        </div>
      </div>

      <div className="absolute inset-0 office-floor" style={{ top: 64, zIndex: 0 }} />

      {/* REX desk */}
      <div className="absolute" style={{ left: '8%', top: '14%', zIndex: 2 }}>
        <PixelDesk color={AGENT_COLORS.rex} label="REX" />
      </div>

      {/* NOVA desk */}
      <div className="absolute" style={{ right: '8%', top: '14%', zIndex: 2 }}>
        <PixelDesk color={AGENT_COLORS.nova} label="NOVA" />
      </div>

      {/* Conference table */}
      <div className="absolute" style={{ left: '50%', top: '38%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
        <ConferenceTable />
        {isConferenceMode && (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#ffd700', animation: 'pixel-pulse 1s infinite' }}
          >
            ◆ CONFERENCE MODE ◆
          </div>
        )}
      </div>

      {/* SAGE desk */}
      <div className="absolute" style={{ left: '8%', top: '56%', zIndex: 2 }}>
        <PixelDesk color={AGENT_COLORS.sage} label="SAGE" />
      </div>

      {/* BYTE desk */}
      <div className="absolute" style={{ right: '8%', top: '56%', zIndex: 2 }}>
        <PixelDesk color={AGENT_COLORS.byte} label="BYTE" />
      </div>

      {/* FLORA desk */}
      <div className="absolute" style={{ left: '50%', top: '66%', transform: 'translateX(-50%)', zIndex: 2 }}>
        <PixelDesk color={AGENT_COLORS.flora} label="FLORA" />
      </div>

      {/* Water cooler */}
      <div className="absolute" style={{ left: '43%', top: '58%', zIndex: 2 }}>
        <WaterCooler />
      </div>

      {/* Bookshelf */}
      <div className="absolute" style={{ left: '2%', top: '75%', zIndex: 2 }}>
        <div style={{ width: 40, height: 32, background: '#4a3010', border: '2px solid #2a1a08' }}>
          {['#cc4444', '#4488cc', '#44cc88', '#cccc44', '#cc88cc'].map((c, i) => (
            <div key={i} style={{ position: 'absolute', bottom: 2, left: i * 7 + 2, width: 5, height: 22 + (i % 3) * 4, background: c }} />
          ))}
        </div>
      </div>

      {/* Printer */}
      <div className="absolute" style={{ right: '3%', top: '18%', zIndex: 2 }}>
        <div style={{ width: 36, height: 24, background: '#ccccdd', border: '2px solid #8888aa' }}>
          <div style={{ position: 'absolute', top: 4, left: 4, right: 4, height: 6, background: '#1a1a3a', border: '1px solid #4a4a8a' }} />
          <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 16, height: 3, background: '#ffffff', border: '1px solid #cccccc', animation: 'pixel-pulse 3s infinite' }} />
        </div>
      </div>

      {/* Snack bar */}
      <div className="absolute" style={{ right: '4%', bottom: '8%', zIndex: 2 }}>
        <div style={{ width: 48, height: 28, background: '#3a2a10', border: '2px solid #2a1a08' }}>
          {['🍩', '☕', '🍎'].map((e, i) => (
            <span key={i} style={{ position: 'absolute', bottom: 4, left: i * 14 + 4, fontSize: 10 }}>{e}</span>
          ))}
        </div>
      </div>

      {/* Agent sprites */}
      {(Object.values(agents) as Agent[]).map((agent) => (
        <AgentSprite
          key={agent.id}
          agent={agent}
          onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
        />
      ))}

      {/* Agent detail card — positioned near agent to avoid overlap */}
      {selectedAgent && (
        <AgentCard
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      <div className="absolute bottom-2 left-2 z-10" style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: 'rgba(255,255,255,0.2)' }}>
        OFFICE SPACE v1.0
      </div>

      {/* Status bar */}
      <div
        className="absolute bottom-2 right-2 z-10 flex items-center gap-3"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid #2a2a4a',
          padding: '4px 8px',
          fontFamily: 'var(--font-terminal)',
          fontSize: '11px',
          color: '#666688',
        }}
      >
        <span>AGENTS: 5</span>
        <span>|</span>
        <span>GEMINI 2.0</span>
        <span>|</span>
        <span style={{ color: '#4aff8f' }}>●</span>
        <span>LIVE</span>
      </div>
    </div>
  )
}
