'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { AgentSprite } from './AgentSprite'
import { Agent, AgentId } from '@/types'
import { useState } from 'react'
import { AgentCard } from '@/components/agents/AgentCard'
import { AGENT_COLORS } from '@/lib/agents'
import React from 'react'

/* ============================
   MONITOR — agent-colored glow
   ============================ */
const MONITOR_SCREENS: Record<string, string> = {
  rex: '#1a2a4a', nova: '#1a0a2e', sage: '#0a1e0e', byte: '#1e0a0a', flora: '#1e0a14',
}

function PixelMonitor({ color, agentId }: { color: string; agentId?: string }) {
  const screenBg = (agentId && MONITOR_SCREENS[agentId]) || '#1a1a2e'
  return (
    <div style={{ position: 'relative', width: 28, height: 22 }}>
      <div style={{ width: 28, height: 18, background: '#1a1a2e', border: '2px solid #2a2a3a', boxShadow: `0 0 6px ${color}44`, animation: 'monitor-glow 3s ease-in-out infinite' }}>
        <div style={{ margin: 2, height: 12, background: screenBg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: 1, background: color, opacity: 0.5, position: 'absolute', top: 4, animation: 'pixel-pulse 2s infinite' }} />
          <div style={{ width: '100%', height: 1, background: color, opacity: 0.3, position: 'absolute', top: 8, animation: 'pixel-pulse 2s 0.5s infinite' }} />
          <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#ffffff', opacity: 0.4 }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, background: '#2a2a3a' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 10, height: 2, background: '#1a1a2a' }} />
    </div>
  )
}

/* ============================
   DESK — 3-layer 3D pixel desk
   ============================ */
function PixelDesk({ color, label, agentId }: { color: string; label: string; agentId: string }) {
  return (
    <div className="relative" style={{ width: 64, height: 52 }}>
      {/* Desktop surface */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 64, height: 28, background: '#7a5020', borderTop: '1px solid #9a6830', borderLeft: '1px solid #5a3810' }}>
        <div style={{ position: 'absolute', top: 2, left: 4 }}>
          <PixelMonitor color={color} agentId={agentId} />
        </div>
        <div style={{ position: 'absolute', top: 6, right: 4, width: 10, height: 7, background: '#eeeedd', transform: 'rotate(-5deg)' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 6, background: '#ddddcc', transform: 'rotate(3deg)', boxShadow: '1px 1px 0 #aaaaaa' }} />
        {agentId === 'byte' && <div style={{ position: 'absolute', bottom: 4, right: 4, width: 6, height: 6, animation: 'warning-blink 1.5s steps(1) infinite' }} />}
        {agentId === 'flora' && (
          <div style={{ position: 'absolute', bottom: 2, right: 3 }}>
            <div style={{ width: 8, height: 6, background: '#cc8844', borderRadius: '0 0 2px 2px' }} />
            <div style={{ position: 'absolute', top: -4, left: 1, width: 6, height: 6, background: '#44aa44', borderRadius: '50%', animation: 'plant-sway 4s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', top: 1, left: 1, width: 4, height: 4, background: '#55cc55', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        {agentId === 'nova' && <div style={{ position: 'absolute', bottom: 2, right: 3, width: 6, height: 8, background: '#eeeeee', borderRadius: '50% 50% 0 0' }}><div style={{ position: 'absolute', top: 2, left: 1, width: 4, height: 3, background: '#3a2010', borderRadius: '50%' }} /></div>}
        {agentId === 'rex' && <div style={{ position: 'absolute', bottom: 3, right: 4, width: 4, height: 8, background: '#4a8fff', opacity: 0.6, borderRadius: 1 }} />}
        {agentId === 'sage' && <div style={{ position: 'absolute', bottom: 4, right: 3, width: 6, height: 6, background: '#ffff88' }} />}
      </div>
      {/* Desk front face */}
      <div style={{ position: 'absolute', top: 28, left: 2, width: 60, height: 14, background: '#5a3810' }} />
      {/* Drop shadow */}
      <div style={{ position: 'absolute', top: 42, left: 0, width: 64, height: 4, background: 'rgba(0,0,0,0.35)' }} />
      {/* Chair */}
      <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 28, height: 12, background: '#2a1e3a', borderTop: '1px solid #4a3e5a', borderLeft: '1px solid #3a2e4a' }}>
        <div style={{ position: 'absolute', bottom: -2, left: 2, width: 2, height: 2, background: '#1a1a2a' }} />
        <div style={{ position: 'absolute', bottom: -2, right: 2, width: 2, height: 2, background: '#1a1a2a' }} />
      </div>
      {/* Label */}
      <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', fontSize: '6px', fontFamily: 'var(--font-pixel)', color, whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000' }}>
        {label}
      </div>
    </div>
  )
}

function WaterCooler() {
  return (
    <div style={{ width: 24, height: 40, position: 'relative' }}>
      {/* Water bottle */}
      <div style={{ position: 'absolute', top: 0, left: 5, width: 14, height: 16, background: 'rgba(74,143,212,0.3)', border: '2px solid #2a5a9a', borderRadius: '2px 2px 0 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 3, background: '#2a2a2a' }} />
        <div style={{ position: 'absolute', bottom: 2, left: 3, width: 2, height: 2, background: '#fff', borderRadius: '50%', animation: 'bubble-rise 4s ease-out infinite' }} />
        <div style={{ position: 'absolute', bottom: 4, left: 7, width: 2, height: 2, background: '#fff', borderRadius: '50%', animation: 'bubble-rise 6s ease-out 2s infinite' }} />
      </div>
      {/* Cooler body */}
      <div style={{ position: 'absolute', top: 14, left: 0, width: 24, height: 22, background: '#ccccdd', border: '2px solid #8888aa' }}>
        <div style={{ position: 'absolute', top: 6, left: 3, width: 6, height: 6, background: '#4a8fd4', border: '1px solid #2a5a9a' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 1, height: 1, background: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', top: 6, right: 3, width: 6, height: 6, background: '#ff4a4a', border: '1px solid #aa2222' }}>
          <div style={{ position: 'absolute', top: 1, left: 1, width: 1, height: 1, background: '#fff' }} />
        </div>
      </div>
      {/* Base */}
      <div style={{ position: 'absolute', bottom: 0, left: 2, width: 20, height: 4, background: '#aaaacc' }} />
    </div>
  )
}

function ConferenceTable() {
  return (
    <div style={{ position: 'relative', width: 128, height: 80 }}>
      {/* Carpet zone */}
      <div className="carpet-zone" style={{ position: 'absolute', inset: -16, borderRadius: 4 }} />
      {/* Table surface */}
      <div style={{ position: 'absolute', top: 10, left: 14, width: 100, height: 50, background: '#5a3010', borderTop: '2px solid #7a4a20', borderLeft: '1px solid #6a3a18' }}>
        <div style={{ position: 'absolute', inset: 8, border: '1px solid #6a3a18', borderRadius: '50%', opacity: 0.5 }} />
      </div>
      {/* Table south face (3D) */}
      <div style={{ position: 'absolute', top: 60, left: 16, width: 96, height: 8, background: '#3a1a08' }} />
      <div style={{ position: 'absolute', top: 66, left: 20, width: 90, height: 6, background: 'rgba(0,0,0,0.4)' }} />
      {/* 5 chairs */}
      {[
        { top: 4, left: 32 },
        { top: 4, left: 80 },
        { top: 64, left: 56 },
        { top: 30, left: 4 },
        { top: 30, left: 110 },
      ].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: 14, height: 14, background: '#2a1e3a', border: '1px solid #4a3a5a' }} />
      ))}
    </div>
  )
}

export function OfficeMap() {
  const { agents, isConferenceMode, screenFlash } = useAgentStore()
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)
  const agentColors = AGENT_COLORS

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#c8a96e' }}>
      {screenFlash && (
        <div
          className="absolute inset-0 bg-white z-50 pointer-events-none"
          style={{ animation: 'screen-flash 0.6s ease-out forwards' }}
        />
      )}

      <div className="scanline-overlay" />

      {/* CRT vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 9998,
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
      }} />

      {/* Pixel grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        zIndex: 9997,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
        backgroundSize: '4px 4px',
      }} />

      {/* Wall */}
      {/* ====== NORTH WALL (top 15%) ====== */}
      <div className="absolute top-0 left-0 right-0 office-wall" style={{ height: '15%', zIndex: 1 }}>
        {/* Left window */}
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: 48, height: 32, background: '#4a8fd4', border: '3px solid #3a3a58', boxShadow: 'inset 2px 2px 0 #2a5a8a' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(100,180,255,0.15)', position: 'relative' }}><div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#7ab8f0', opacity: 0.6 }} /></div>)}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: '#3a3a58', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: '#3a3a58', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)', animation: 'window-shimmer 4s ease-in-out infinite' }} />
        </div>
        {/* Right window */}
        <div style={{ position: 'absolute', top: '20%', right: '20%', width: 48, height: 32, background: '#4a8fd4', border: '3px solid #3a3a58', boxShadow: 'inset 2px 2px 0 #2a5a8a' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ background: 'rgba(100,180,255,0.15)', position: 'relative' }}><div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#7ab8f0', opacity: 0.6 }} /></div>)}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: '#3a3a58', transform: 'translateX(-50%)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: '#3a3a58', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)', animation: 'window-shimmer 4s 1s ease-in-out infinite' }} />
        </div>
        {/* Clock */}
        <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#1a1a2e', border: '2px solid #3a3a5a' }}>
          {[0,90,180,270].map(deg => <div key={deg} style={{ position: 'absolute', width: 2, height: 2, background: '#888888', top: '50%', left: '50%', transform: `rotate(${deg}deg) translateY(-8px) translate(-1px,-1px)` }} />)}
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: 2, height: 6, background: '#ccccee', transformOrigin: 'bottom center', transform: `translateX(-1px) rotate(${new Date().getHours() * 30 + new Date().getMinutes() * 0.5}deg)` }} />
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: 1, height: 9, background: '#8888cc', transformOrigin: 'bottom center', transform: `translateX(-0.5px) rotate(${new Date().getMinutes() * 6}deg)` }} />
          <div style={{ position: 'absolute', bottom: '50%', left: '50%', width: 1, height: 10, background: '#ff4a4a', transformOrigin: 'bottom center', animation: 'clock-tick 60s linear infinite' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 2, height: 2, background: '#fff', borderRadius: '50%' }} />
        </div>
        {/* Ceiling lights */}
        <div style={{ position: 'absolute', top: 0, left: '25%', transform: 'translateX(-50%)' }}>
          <div style={{ width: 48, height: 4, background: '#aaaacc' }} />
          <div style={{ width: 40, height: 4, margin: '0 auto', background: '#f0e8c0', boxShadow: '0 0 12px rgba(240,232,192,0.4)' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: '25%', transform: 'translateX(50%)' }}>
          <div style={{ width: 48, height: 4, background: '#aaaacc' }} />
          <div style={{ width: 40, height: 4, margin: '0 auto', background: '#f0e8c0', boxShadow: '0 0 12px rgba(240,232,192,0.4)', animation: 'light-flicker 12s steps(1) infinite' }} />
        </div>
      </div>

      {/* ====== FLOOR ====== */}
      <div className="absolute inset-0 office-floor" style={{ top: '15%', zIndex: 0 }} />

      {/* Ambient window light on floor */}
      <div className="absolute pointer-events-none" style={{ top: '15%', left: '18%', width: 40, height: '30%', background: 'linear-gradient(180deg, rgba(100,180,255,0.05) 0%, transparent 100%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', zIndex: 1 }} />
      <div className="absolute pointer-events-none" style={{ top: '15%', right: '18%', width: 40, height: '30%', background: 'linear-gradient(180deg, rgba(100,180,255,0.05) 0%, transparent 100%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', zIndex: 1 }} />

      {/* REX desk */}
      <div className="absolute" style={{ left: '8%', top: '18%', zIndex: 2 }}>
        <PixelDesk color={agentColors.rex} label="REX" agentId="rex" />
      </div>

      {/* NOVA desk */}
      <div className="absolute" style={{ right: '10%', top: '18%', zIndex: 2 }}>
        <PixelDesk color={agentColors.nova} label="NOVA" agentId="nova" />
      </div>

      {/* Conference table */}
      <div className="absolute" style={{ left: '50%', top: '38%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
        <ConferenceTable />
        {isConferenceMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#ffd700', animation: 'pixel-pulse 1s infinite' }}>
            CONFERENCE MODE
          </div>
        )}
      </div>

      {/* SAGE desk */}
      <div className="absolute" style={{ left: '8%', top: '58%', zIndex: 2 }}>
        <PixelDesk color={agentColors.sage} label="SAGE" agentId="sage" />
      </div>

      {/* BYTE desk */}
      <div className="absolute" style={{ right: '10%', top: '58%', zIndex: 2 }}>
        <PixelDesk color={agentColors.byte} label="BYTE" agentId="byte" />
      </div>

      {/* FLORA desk */}
      <div className="absolute" style={{ left: '50%', top: '70%', transform: 'translateX(-50%)', zIndex: 2 }}>
        <PixelDesk color={agentColors.flora} label="FLORA" agentId="flora" />
      </div>

      {/* Water cooler */}
      <div className="absolute" style={{ left: '43%', top: '58%', zIndex: 2 }}>
        <WaterCooler />
      </div>

      {/* Bookshelf */}
      <div className="absolute" style={{ left: '2%', top: '78%', zIndex: 2 }}>
        <div style={{ width: 48, height: 40, background: '#6a3a14', border: '2px solid #4a2a0c', position: 'relative', overflow: 'hidden' }}>
          {[0,1,2].map(shelf => (
            <div key={shelf} style={{ position: 'absolute', top: shelf * 13, left: 2, right: 2, height: 12 }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#4a2a0c' }} />
              <div style={{ display: 'flex', gap: 1, position: 'absolute', bottom: 2, left: 1 }}>
                {['#cc4444','#4488cc','#44cc88','#cccc44','#cc88cc','#888844','#cc6644','#44cccc'].slice(shelf*3, shelf*3+3).map((c,i) => (
                  <div key={i} style={{ width: 4 + (i%2), height: 8 + (i%3), background: c, borderLeft: `1px solid ${c}88` }} />
                ))}
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', top: 1, right: 3, width: 8, height: 8, background: '#4a8fd4', border: '1px solid #aaaacc' }} />
        </div>
      </div>

      {/* Printer */}
      <div className="absolute" style={{ right: '3%', top: '18%', zIndex: 2 }}>
        <div style={{ width: 40, height: 28, position: 'relative' }}>
          <div style={{ width: 40, height: 20, background: '#ccccdd', borderTop: '2px solid #dddded', border: '2px solid #8888aa' }}>
            <div style={{ position: 'absolute', top: 3, right: 4, display: 'flex', gap: 2 }}>
              <div style={{ width: 3, height: 3, background: '#00ff44', borderRadius: '50%' }} />
              <div style={{ width: 3, height: 3, background: '#ffff00', borderRadius: '50%' }} />
              <div style={{ width: 3, height: 3, background: '#ff4444', borderRadius: '50%' }} />
            </div>
            <div style={{ position: 'absolute', top: 3, left: 4, width: 14, height: 8, background: '#1a3a1a', border: '1px solid #2a5a2a' }}>
              <div style={{ margin: 2, width: 10, height: 1, background: '#44ff44', opacity: 0.6 }} />
              <div style={{ marginLeft: 2, marginTop: 1, width: 6, height: 1, background: '#44ff44', opacity: 0.4 }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 2, left: 4, width: 32, height: 6, background: '#eeeeee', border: '1px solid #cccccc' }} />
          <div style={{ position: 'absolute', top: 14, left: 6, width: 28, height: 4, background: '#dddddd' }} />
        </div>
      </div>

      {/* Snack bar */}
      <div className="absolute" style={{ right: '3%', bottom: '6%', zIndex: 2 }}>
        <div style={{ width: 56, height: 24, position: 'relative' }}>
          <div style={{ width: 56, height: 16, background: '#ccccdd', borderTop: '1px solid #eeeeee' }}>
            {/* Donut */}
            <div style={{ position: 'absolute', top: 2, left: 4, width: 10, height: 10, borderRadius: '50%', background: '#cc6644', border: '2px solid #aa5533' }}>
              <div style={{ position: 'absolute', top: 3, left: 3, width: 4, height: 4, borderRadius: '50%', background: '#c8a96e' }} />
              <div style={{ position: 'absolute', top: 0, left: 1, width: 8, height: 3, background: '#ff88cc', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
            </div>
            {/* Mug */}
            <div style={{ position: 'absolute', top: 3, left: 20 }}>
              <div style={{ width: 8, height: 10, background: '#eeeeee', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 2, left: 1, width: 6, height: 4, background: '#4a2a0c', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: 2, right: -3, width: 3, height: 5, border: '1px solid #cccccc', borderLeft: 'none', borderRadius: '0 3px 3px 0' }} />
              </div>
              <div style={{ position: 'absolute', top: -4, left: 2, width: 1, height: 4, background: 'rgba(255,255,255,0.3)', animation: 'coffee-steam 1.2s infinite' }} />
              <div style={{ position: 'absolute', top: -3, left: 5, width: 1, height: 3, background: 'rgba(255,255,255,0.2)', animation: 'coffee-steam 1.2s 0.3s infinite' }} />
            </div>
            {/* Apple */}
            <div style={{ position: 'absolute', top: 4, left: 36, width: 8, height: 10, background: '#dd3333', borderRadius: 3 }}>
              <div style={{ position: 'absolute', top: -2, left: 3, width: 1, height: 3, background: '#4a2a0c' }} />
              <div style={{ position: 'absolute', top: -2, left: 4, width: 3, height: 2, background: '#44aa44' }} />
              <div style={{ position: 'absolute', top: 1, left: 1, width: 2, height: 2, background: '#ffcccc', borderRadius: '50%', opacity: 0.5 }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 56, height: 8, background: '#9999bb' }} />
        </div>
      </div>

      {/* Agent sprites */}
      {(Object.values(agents) as Agent[])
        .sort((a, b) => a.position.y - b.position.y)
        .map((agent) => (
          <AgentSprite
            key={agent.id}
            agent={agent}
            onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
          />
        ))}

      {selectedAgent && (
        <AgentCard agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

      <div className="absolute bottom-2 left-2 z-10" style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: 'rgba(255,255,255,0.2)' }}>
        OFFICE SPACE v1.0
      </div>

      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-3" style={{
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid #2a2a4a',
        padding: '4px 8px',
        fontFamily: 'var(--font-terminal)',
        fontSize: '11px',
        color: '#666688',
      }}>
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