'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { AgentSprite } from './AgentSprite'
import { Agent, AgentId } from '@/types'
import { useState } from 'react'
import { AgentCard } from '@/components/agents/AgentCard'
import { AGENT_COLORS } from '@/lib/agents'
import React from 'react'

/* ============================
   MONITOR — 3× scale (60×42px)
   ============================ */
const MONITOR_SCREENS: Record<string, string> = {
  rex: '#0a1a3a', nova: '#1a0a2e', sage: '#0a1e0e', byte: '#1e0a0a', flora: '#1e0a14',
}

function PixelMonitor({ color, agentId }: { color: string; agentId?: string }) {
  const screenBg = (agentId && MONITOR_SCREENS[agentId]) || '#0a0a1e'
  return (
    <div style={{ position: 'relative', width: 60, height: 42 }}>
      {/* Bezel */}
      <div style={{ width: 60, height: 39, background: '#1a1a2e', border: '3px solid #2a2a3a', boxShadow: `0 0 8px ${color}44`, animation: 'monitor-glow 3s ease-in-out infinite' }}>
        {/* Screen glass */}
        <div style={{ margin: 3, height: 30, background: screenBg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: 2, background: color, opacity: 0.5, position: 'absolute', top: 8, animation: 'pixel-pulse 2s infinite' }} />
          <div style={{ width: '80%', height: 2, background: color, opacity: 0.3, position: 'absolute', top: 14, animation: 'pixel-pulse 2s 0.3s infinite' }} />
          <div style={{ width: '60%', height: 2, background: color, opacity: 0.25, position: 'absolute', top: 20, animation: 'pixel-pulse 2s 0.6s infinite' }} />
          {/* Shine pixel */}
          <div style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, background: '#ffffff', opacity: 0.3 }} />
          <div style={{ position: 'absolute', top: 2, left: 6, width: 2, height: 2, background: '#ffffff', opacity: 0.15 }} />
        </div>
      </div>
      {/* Stand neck */}
      <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: '#2a2a3a' }} />
      {/* Stand base */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 4, background: '#1a1a2a', borderTop: '1px solid #3a3a4a' }} />
    </div>
  )
}

/* ============================
   POTTED PLANT — floor decoration
   ============================ */
function PottedPlant({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 0.7 : size === 'lg' ? 1.3 : 1
  return (
    <div style={{ width: 24 * s, height: 36 * s, position: 'relative', transform: `scale(${s})`, transformOrigin: 'bottom center' }}>
      {/* Pot */}
      <div style={{ position: 'absolute', bottom: 0, left: 3, width: 18, height: 14, background: '#cc8844', borderTop: '2px solid #ddaa66' }}>
        <div style={{ position: 'absolute', top: 0, left: 2, right: 2, height: 3, background: '#3a2010' }} />
      </div>
      {/* Leaves */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', animation: 'plant-sway 4s ease-in-out infinite' }}>
        <div style={{ width: 6, height: 14, background: '#44aa44', position: 'absolute', bottom: 0, left: -3 }} />
        <div style={{ width: 10, height: 10, background: '#55cc55', borderRadius: '50%', position: 'absolute', bottom: 8, left: -5 }} />
        <div style={{ width: 8, height: 8, background: '#55cc55', borderRadius: '50%', position: 'absolute', bottom: 10, left: 1 }} />
        <div style={{ width: 6, height: 6, background: '#66dd66', borderRadius: '50%', position: 'absolute', bottom: 14, left: -2 }} />
      </div>
    </div>
  )
}

/* ============================
   DESK — 3× scale (144×84px)
   ============================ */
function PixelDesk({ color, label, agentId }: { color: string; label: string; agentId: string }) {
  return (
    <div className="relative" style={{ width: 144, height: 100 }}>
      {/* Desktop surface (top view) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 144, height: 54, background: '#7a5020', borderTop: '2px solid #9a6830', borderLeft: '2px solid #5a3810' }}>
        {/* Monitor on desk */}
        <div style={{ position: 'absolute', top: 2, left: 8 }}>
          <PixelMonitor color={color} agentId={agentId} />
        </div>
        {/* Papers */}
        <div style={{ position: 'absolute', top: 10, right: 10, width: 24, height: 16, background: '#eeeedd', transform: 'rotate(-5deg)', boxShadow: '1px 1px 0 #cccccc' }} />
        <div style={{ position: 'absolute', top: 14, right: 18, width: 20, height: 14, background: '#ddddcc', transform: 'rotate(3deg)', boxShadow: '1px 1px 0 #aaaaaa' }} />
        {/* Agent-specific desk items */}
        {agentId === 'byte' && <div style={{ position: 'absolute', bottom: 6, right: 8, width: 12, height: 12, background: '#ff0000', animation: 'warning-blink 1.5s steps(1) infinite', boxShadow: '0 0 6px #ff2222' }} />}
        {agentId === 'flora' && (
          <div style={{ position: 'absolute', bottom: 4, right: 8 }}>
            <div style={{ width: 16, height: 12, background: '#cc8844', borderRadius: '0 0 3px 3px' }} />
            <div style={{ position: 'absolute', top: -8, left: 2, width: 12, height: 12, background: '#44aa44', borderRadius: '50%', animation: 'plant-sway 4s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', top: 2, left: 2, width: 8, height: 8, background: '#55cc55', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: 4, left: 4, width: 4, height: 4, background: '#aaffaa', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        {agentId === 'nova' && (
          <div style={{ position: 'absolute', bottom: 4, right: 8 }}>
            <div style={{ width: 14, height: 18, background: '#eeeeee', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 3, left: 2, width: 10, height: 7, background: '#3a2010', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: 3, right: -5, width: 5, height: 8, border: '2px solid #cccccc', borderLeft: 'none', borderRadius: '0 4px 4px 0' }} />
            </div>
            <div style={{ position: 'absolute', top: -6, left: 4, width: 2, height: 6, background: 'rgba(255,255,255,0.3)', animation: 'coffee-steam 1.2s infinite' }} />
          </div>
        )}
        {agentId === 'rex' && <div style={{ position: 'absolute', bottom: 6, right: 8, width: 8, height: 18, background: '#4a8fff', opacity: 0.6, borderRadius: 2 }} />}
        {agentId === 'sage' && (<>
          <div style={{ position: 'absolute', bottom: 8, right: 8, width: 12, height: 12, background: '#ffff88', boxShadow: '1px 1px 0 #cccc44' }} />
          <div style={{ position: 'absolute', bottom: 12, right: 22, width: 10, height: 10, background: '#88ffcc' }} />
          <div style={{ position: 'absolute', bottom: 4, right: 24, width: 10, height: 10, background: '#ff88cc' }} />
        </>)}
      </div>
      {/* Desk front face */}
      <div style={{ position: 'absolute', top: 54, left: 4, width: 136, height: 24, background: '#5a3810', borderBottom: '2px solid #3a2008' }}>
        {/* Drawer handle */}
        <div style={{ position: 'absolute', top: 8, right: 16, width: 20, height: 3, background: '#9a6830' }} />
      </div>
      {/* Drop shadow */}
      <div style={{ position: 'absolute', top: 78, left: 0, width: 144, height: 6, background: 'rgba(0,0,0,0.3)' }} />
      {/* Chair */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 42, height: 18, background: '#2a1e3a', borderTop: '2px solid #4a3e5a', borderLeft: '2px solid #3a2e4a' }}>
        <div style={{ position: 'absolute', bottom: -3, left: 4, width: 4, height: 4, background: '#1a1a2a', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -3, right: 4, width: 4, height: 4, background: '#1a1a2a', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, background: '#1a1a2a', borderRadius: '50%' }} />
      </div>
      {/* Label */}
      <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '8px', fontFamily: 'var(--font-pixel)', color, whiteSpace: 'nowrap', textShadow: '1px 1px 0 #000' }}>
        {label}
      </div>
    </div>
  )
}

function WaterCooler() {
  return (
    <div style={{ width: 42, height: 72, position: 'relative' }}>
      {/* Water bottle */}
      <div style={{ position: 'absolute', top: 0, left: 8, width: 26, height: 28, background: 'rgba(74,143,212,0.25)', border: '3px solid #2a5a9a', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -2, left: '50%', transform: 'translateX(-50%)', width: 8, height: 5, background: '#2a2a2a' }} />
        <div style={{ position: 'absolute', bottom: 4, left: 5, width: 3, height: 3, background: '#fff', borderRadius: '50%', animation: 'bubble-rise 4s ease-out infinite' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 14, width: 3, height: 3, background: '#fff', borderRadius: '50%', animation: 'bubble-rise 6s ease-out 2s infinite' }} />
        <div style={{ position: 'absolute', bottom: 2, left: 10, width: 2, height: 2, background: '#fff', borderRadius: '50%', animation: 'bubble-rise 5s ease-out 3.5s infinite' }} />
      </div>
      {/* Cooler body */}
      <div style={{ position: 'absolute', top: 26, left: 0, width: 42, height: 36, background: '#ccccdd', border: '3px solid #8888aa' }}>
        <div style={{ position: 'absolute', top: 10, left: 5, width: 12, height: 12, background: '#4a8fd4', border: '2px solid #2a5a9a' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 2, height: 2, background: '#fff' }} />
        </div>
        <div style={{ position: 'absolute', top: 10, right: 5, width: 12, height: 12, background: '#ff4a4a', border: '2px solid #aa2222' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 2, height: 2, background: '#fff' }} />
        </div>
      </div>
      {/* Base */}
      <div style={{ position: 'absolute', bottom: 0, left: 4, width: 34, height: 8, background: '#aaaacc' }}>
        <div style={{ position: 'absolute', bottom: -2, left: 2, width: 4, height: 4, background: '#888888' }} />
        <div style={{ position: 'absolute', bottom: -2, right: 2, width: 4, height: 4, background: '#888888' }} />
      </div>
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
      {/* ====== NORTH WALL (top 20%) ====== */}
      <div className="absolute top-0 left-0 right-0 office-wall" style={{ height: '20%', zIndex: 1 }}>
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
      <div className="absolute inset-0 office-floor" style={{ top: '20%', zIndex: 0 }} />

      {/* Ambient window light on floor */}
      <div className="absolute pointer-events-none" style={{ top: '20%', left: '18%', width: 60, height: '25%', background: 'linear-gradient(180deg, rgba(100,180,255,0.06) 0%, transparent 100%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', zIndex: 1 }} />
      <div className="absolute pointer-events-none" style={{ top: '20%', right: '18%', width: 60, height: '25%', background: 'linear-gradient(180deg, rgba(100,180,255,0.06) 0%, transparent 100%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', zIndex: 1 }} />

      {/* REX desk */}
      <div className="absolute" style={{ left: '2%', top: '22%', zIndex: 2 }}>
        <PixelDesk color={agentColors.rex} label="REX" agentId="rex" />
      </div>

      {/* NOVA desk */}
      <div className="absolute" style={{ right: '2%', top: '22%', zIndex: 2 }}>
        <PixelDesk color={agentColors.nova} label="NOVA" agentId="nova" />
      </div>

      {/* Conference table */}
      <div className="absolute" style={{ left: '50%', top: '42%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>
        <ConferenceTable />
        {isConferenceMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            style={{ fontSize: '8px', fontFamily: 'var(--font-pixel)', color: '#ffd700', animation: 'pixel-pulse 1s infinite' }}>
            CONFERENCE MODE
          </div>
        )}
      </div>

      {/* SAGE desk */}
      <div className="absolute" style={{ left: '2%', top: '54%', zIndex: 2 }}>
        <PixelDesk color={agentColors.sage} label="SAGE" agentId="sage" />
      </div>

      {/* BYTE desk */}
      <div className="absolute" style={{ right: '2%', top: '54%', zIndex: 2 }}>
        <PixelDesk color={agentColors.byte} label="BYTE" agentId="byte" />
      </div>

      {/* FLORA desk */}
      <div className="absolute" style={{ left: '50%', top: '72%', transform: 'translateX(-50%)', zIndex: 2 }}>
        <PixelDesk color={agentColors.flora} label="FLORA" agentId="flora" />
      </div>

      {/* Water cooler */}
      <div className="absolute" style={{ left: '42%', top: '56%', zIndex: 2 }}>
        <WaterCooler />
      </div>

      {/* Bookshelf */}
      <div className="absolute" style={{ left: '1%', top: '82%', zIndex: 2 }}>
        <div style={{ width: 96, height: 64, background: '#6a3a14', border: '3px solid #4a2a0c', position: 'relative', overflow: 'hidden' }}>
          {[0,1,2].map(shelf => (
            <div key={shelf} style={{ position: 'absolute', top: shelf * 20 + 2, left: 4, right: 4, height: 18 }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#4a2a0c' }} />
              <div style={{ display: 'flex', gap: 2, position: 'absolute', bottom: 3, left: 2, alignItems: 'flex-end' }}>
                {['#cc4444','#4488cc','#44cc88','#cccc44','#cc88cc','#888844','#cc6644','#44cccc'].slice(shelf*3, shelf*3+4).map((c,i) => (
                  <div key={i} style={{ width: 8 + (i%2)*2, height: 12 + (i%3)*2, background: c, borderLeft: `1px solid ${c}88` }} />
                ))}
              </div>
            </div>
          ))}
          {/* Photo frame on top */}
          <div style={{ position: 'absolute', top: 2, right: 6, width: 14, height: 14, background: '#aaaacc', border: '2px solid #888888' }}>
            <div style={{ margin: 2, width: 8, height: 8, background: '#4a8fd4' }} />
          </div>
          {/* Small cactus */}
          <div style={{ position: 'absolute', top: 2, right: 26, width: 8, height: 12 }}>
            <div style={{ position: 'absolute', bottom: 0, width: 8, height: 6, background: '#cc8844' }} />
            <div style={{ position: 'absolute', bottom: 5, left: 2, width: 4, height: 8, background: '#44aa44' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 0, width: 3, height: 4, background: '#44aa44' }} />
          </div>
        </div>
      </div>

      {/* Printer */}
      <div className="absolute" style={{ right: '2%', top: '22%', zIndex: 1 }}>
        <div style={{ position: 'relative', width: 72, height: 48 }}>
          <div style={{ width: 72, height: 36, background: '#ccccdd', border: '3px solid #8888aa', borderTopColor: '#dddded' }}>
            <div style={{ position: 'absolute', top: 6, right: 8, display: 'flex', gap: 4 }}>
              <div style={{ width: 6, height: 6, background: '#00ff44', borderRadius: '50%' }} />
              <div style={{ width: 6, height: 6, background: '#ffff00', borderRadius: '50%' }} />
              <div style={{ width: 6, height: 6, background: '#ff4444', borderRadius: '50%' }} />
            </div>
            <div style={{ position: 'absolute', top: 6, left: 8, width: 28, height: 16, background: '#1a3a1a', border: '2px solid #2a5a2a' }}>
              <div style={{ margin: 3, width: 20, height: 2, background: '#44ff44', opacity: 0.6 }} />
              <div style={{ marginLeft: 3, marginTop: 2, width: 12, height: 2, background: '#44ff44', opacity: 0.4 }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 4, left: 8, width: 56, height: 10, background: '#eeeeee', border: '2px solid #cccccc' }} />
          <div style={{ position: 'absolute', top: 26, left: 12, width: 48, height: 6, background: '#dddddd' }} />
        </div>
      </div>

      {/* Snack bar */}
      <div className="absolute" style={{ right: '2%', bottom: '4%', zIndex: 2 }}>
        <div style={{ width: 96, height: 40, position: 'relative' }}>
          <div style={{ width: 96, height: 28, background: '#ccccdd', borderTop: '2px solid #eeeeee' }}>
            {/* Donut */}
            <div style={{ position: 'absolute', top: 4, left: 8, width: 18, height: 18, borderRadius: '50%', background: '#cc6644', border: '3px solid #aa5533' }}>
              <div style={{ position: 'absolute', top: 5, left: 5, width: 6, height: 6, borderRadius: '50%', background: '#c8a96e' }} />
              <div style={{ position: 'absolute', top: 0, left: 2, width: 12, height: 5, background: '#ff88cc', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
            </div>
            {/* Mug */}
            <div style={{ position: 'absolute', top: 4, left: 36 }}>
              <div style={{ width: 14, height: 18, background: '#eeeeee', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 4, left: 2, width: 10, height: 7, background: '#4a2a0c', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: 4, right: -6, width: 6, height: 9, border: '2px solid #cccccc', borderLeft: 'none', borderRadius: '0 5px 5px 0' }} />
              </div>
              <div style={{ position: 'absolute', top: -6, left: 4, width: 2, height: 6, background: 'rgba(255,255,255,0.3)', animation: 'coffee-steam 1.2s infinite' }} />
              <div style={{ position: 'absolute', top: -4, left: 8, width: 2, height: 5, background: 'rgba(255,255,255,0.2)', animation: 'coffee-steam 1.2s 0.3s infinite' }} />
            </div>
            {/* Apple */}
            <div style={{ position: 'absolute', top: 6, left: 64, width: 14, height: 18, background: '#dd3333', borderRadius: 4 }}>
              <div style={{ position: 'absolute', top: -3, left: 5, width: 2, height: 5, background: '#4a2a0c' }} />
              <div style={{ position: 'absolute', top: -3, left: 7, width: 5, height: 3, background: '#44aa44' }} />
              <div style={{ position: 'absolute', top: 2, left: 2, width: 4, height: 4, background: '#ffcccc', borderRadius: '50%', opacity: 0.4 }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 96, height: 12, background: '#9999bb', borderTop: '2px solid #aaaacc' }} />
        </div>
      </div>

      {/* Potted plants */}
      <div className="absolute" style={{ left: '1%', top: '42%', zIndex: 2 }}><PottedPlant size="lg" /></div>
      <div className="absolute" style={{ right: '1%', top: '42%', zIndex: 2 }}><PottedPlant size="lg" /></div>
      <div className="absolute" style={{ left: '32%', top: '22%', zIndex: 2 }}><PottedPlant size="md" /></div>
      <div className="absolute" style={{ right: '32%', top: '22%', zIndex: 2 }}><PottedPlant size="md" /></div>
      <div className="absolute" style={{ left: '25%', top: '88%', zIndex: 2 }}><PottedPlant size="sm" /></div>
      <div className="absolute" style={{ right: '25%', top: '88%', zIndex: 2 }}><PottedPlant size="sm" /></div>
      <div className="absolute" style={{ left: '48%', top: '58%', zIndex: 1 }}><PottedPlant size="md" /></div>

      {/* Wall painting */}
      {/* Landscape painting - left of clock */}
      <div className="absolute" style={{ top: '4%', left: '8%', zIndex: 2, width: 48, height: 32, border: '3px solid #8a6a3a', background: '#1a3a1a' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: '#44aa44' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 6, width: 16, height: 16, background: '#2a6a2a', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div style={{ position: 'absolute', bottom: 6, right: 6, width: 12, height: 12, background: '#3a8a3a', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <div style={{ position: 'absolute', top: 4, right: 8, width: 8, height: 8, background: '#ffd700', borderRadius: '50%' }} />
      </div>
      {/* Abstract art - right of clock */}
      <div className="absolute" style={{ top: '4%', right: '8%', zIndex: 2, width: 40, height: 28, border: '3px solid #8a6a3a', background: '#1a1a2e' }}>
        <div style={{ position: 'absolute', top: 4, left: 4, width: 14, height: 10, background: '#4a8fff', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: 4, right: 4, width: 12, height: 8, background: '#ff8fcc', opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: 8, left: 14, width: 10, height: 10, background: '#4aff8f', opacity: 0.4, borderRadius: '50%' }} />
      </div>

      {/* Cardboard boxes */}
      <div className="absolute" style={{ left: '20%', top: '86%', zIndex: 2 }}>
        <div style={{ width: 24, height: 20, background: '#b89458', border: '2px solid #8a6a30', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#a07840' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: 2, height: 3, background: '#8a6a30', transform: 'translateX(-50%)' }} />
        </div>
      </div>
      <div className="absolute" style={{ left: '23%', top: '84%', zIndex: 1 }}>
        <div style={{ width: 20, height: 16, background: '#a07840', border: '2px solid #7a5a28' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#8a6a30' }} />
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