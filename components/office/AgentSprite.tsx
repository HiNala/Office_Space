'use client'
import { Agent, AgentId } from '@/types'
import { ChatBubble } from './ChatBubble'

/* Per-agent visual config following Visual Design Guide */
interface AgentVisuals {
  body: string
  accent: string
  skin: string
  hair: string
  hairStyle: 'flat' | 'wild' | 'slick' | 'wave' | 'long'
  outfit: string
  shoes: string
  idleDuration: number
  accessory?: 'hat' | 'glasses' | 'sunglasses'
  accessoryColor?: string
}

const AGENT_VISUALS: Record<AgentId, AgentVisuals> = {
  rex: {
    body: '#2a4a8a', accent: '#4a8fff', skin: '#f5c8a0',
    hair: '#1e2a4a', hairStyle: 'flat', outfit: '#2a4a8a',
    shoes: '#2a2a2a', idleDuration: 1600, accessory: 'hat', accessoryColor: '#4a8fff',
  },
  nova: {
    body: '#6a2a9a', accent: '#b44aff', skin: '#f5c8a0',
    hair: '#3a1a5a', hairStyle: 'long', outfit: '#6a2a9a',
    shoes: '#cc9944', idleDuration: 1200, accessory: 'glasses', accessoryColor: '#aaaacc',
  },
  sage: {
    body: '#3a5a2a', accent: '#4aff8f', skin: '#e8b888',
    hair: '#2a4a1a', hairStyle: 'wild', outfit: '#3a5a2a',
    shoes: '#aa4422', idleDuration: 2000,
  },
  byte: {
    body: '#1a1a1a', accent: '#ff4a4a', skin: '#e0c0a0',
    hair: '#1a1a1a', hairStyle: 'slick', outfit: '#1a1a1a',
    shoes: '#0a0a0a', idleDuration: 2000, accessory: 'sunglasses', accessoryColor: '#0a0a0a',
  },
  flora: {
    body: '#e05090', accent: '#ff8fcc', skin: '#d09870',
    hair: '#c87828', hairStyle: 'wave', outfit: '#e05090',
    shoes: '#2a2a5a', idleDuration: 1500,
  },
}

interface AgentSpriteProps {
  agent: Agent
  onClick?: () => void
}

export function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  const v = AGENT_VISUALS[agent.id as AgentId]
  if (!v) return null

  /* Per-agent idle timing + state-based animation */
  let animStyle: React.CSSProperties = {}
  if (agent.state === 'walking') {
    const dir = agent.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
    animStyle = { animation: `walk-bob 0.4s ease-in-out infinite`, transform: dir }
  } else if (agent.state === 'working') {
    animStyle = { animation: `typing-bob 0.5s ease-in-out infinite` }
  } else if (agent.state === 'thinking') {
    animStyle = { animation: `thinking-hover 1.2s ease-in-out infinite` }
  } else {
    animStyle = { animation: `idle-breathe ${v.idleDuration}ms ease-in-out infinite` }
  }

  /* Superpower flash */
  if (agent.superPowerActive) {
    animStyle = {
      ...animStyle,
      animation: `superpower-flash 0.6s ease-out`,
      filter: `drop-shadow(0 0 8px ${v.accent})`,
    }
  }

  /* Y-sort: agents lower on screen render in front */
  const zIndex = Math.floor(agent.position.y) + 10

  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        left: `${agent.position.x}%`,
        top: `${agent.position.y}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out',
        zIndex,
      }}
      onClick={onClick}
    >
      {/* Chat bubble */}
      {agent.chatBubble && (
        <ChatBubble message={agent.chatBubble} color={v.accent} />
      )}

      {/* Thought bubble (thinking state) */}
      {agent.state === 'thinking' && !agent.chatBubble && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-end gap-1" style={{ zIndex: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1px solid ${v.accent}`, background: 'rgba(5,5,20,0.8)', opacity: 0.4 }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1px solid ${v.accent}`, background: 'rgba(5,5,20,0.8)', opacity: 0.6 }} />
          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${v.accent}`, background: 'rgba(5,5,20,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <div style={{ width: 4, height: 4, background: v.accent, borderRadius: '50%', animation: 'thought-dot 0.6s infinite' }} />
            <div style={{ width: 4, height: 4, background: v.accent, borderRadius: '50%', animation: 'thought-dot 0.6s 0.2s infinite' }} />
            <div style={{ width: 4, height: 4, background: v.accent, borderRadius: '50%', animation: 'thought-dot 0.6s 0.4s infinite' }} />
          </div>
        </div>
      )}

      {/* Sprite body — 48×96 CSS pixels (16×32 base at 3× scale) */}
      <div className="relative" style={{ width: 48, height: 96, imageRendering: 'pixelated', ...animStyle }}>

        {/* === HAIR === */}
        {v.hairStyle === 'flat' && (
          <div style={{ position: 'absolute', top: 0, left: 9, width: 30, height: 12, background: v.hair }} />
        )}
        {v.hairStyle === 'long' && (<>
          <div style={{ position: 'absolute', top: 0, left: 6, width: 36, height: 15, background: v.hair }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 9, height: 9, background: '#5a2a8a' }} />
          </div>
          <div style={{ position: 'absolute', top: 15, left: 3, width: 9, height: 24, background: v.hair, opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 15, right: 3, width: 9, height: 21, background: v.hair, opacity: 0.7 }} />
        </>)}
        {v.hairStyle === 'wild' && (<>
          <div style={{ position: 'absolute', top: 0, left: 9, width: 30, height: 12, background: v.hair }} />
          <div style={{ position: 'absolute', top: -6, left: 12, width: 3, height: 9, background: v.hair }} />
          <div style={{ position: 'absolute', top: -3, left: 21, width: 3, height: 6, background: v.hair }} />
          <div style={{ position: 'absolute', top: -6, left: 30, width: 3, height: 9, background: v.hair }} />
          <div style={{ position: 'absolute', top: -3, left: 36, width: 3, height: 6, background: v.hair }} />
        </>)}
        {v.hairStyle === 'slick' && (
          <div style={{ position: 'absolute', top: 0, left: 9, width: 30, height: 9, background: v.hair }} />
        )}
        {v.hairStyle === 'wave' && (<>
          <div style={{ position: 'absolute', top: 0, left: 6, width: 36, height: 15, background: v.hair }} />
          <div style={{ position: 'absolute', top: 3, left: 3, width: 12, height: 9, background: v.hair }} />
          <div style={{ position: 'absolute', top: 15, left: 3, width: 9, height: 18, background: v.hair, opacity: 0.6 }} />
          <div style={{ position: 'absolute', top: 15, right: 6, width: 9, height: 15, background: v.hair, opacity: 0.6 }} />
        </>)}

        {/* === ACCESSORY on head === */}
        {v.accessory === 'hat' && (
          <div style={{ position: 'absolute', top: -3, left: 3, width: 42, height: 15, background: v.accessoryColor, borderRadius: '6px 6px 0 0' }}>
            <div style={{ position: 'absolute', bottom: 0, left: -3, right: -3, height: 6, background: v.accessoryColor }} />
          </div>
        )}

        {/* === HEAD / FACE === */}
        <div style={{
          position: 'absolute',
          top: v.accessory === 'hat' ? 12 : (v.hairStyle === 'flat' || v.hairStyle === 'slick' ? 9 : 12),
          left: 9, width: 30, height: 30,
          background: v.skin,
          boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.15)',
        }}>
          {/* Eyes */}
          <div style={{ position: 'absolute', top: 9, left: 6, width: 6, height: 6, background: '#1a1a1a' }} />
          <div style={{ position: 'absolute', top: 9, right: 6, width: 6, height: 6, background: '#1a1a1a' }} />
          {/* Eye whites */}
          <div style={{ position: 'absolute', top: 9, left: 6, width: 3, height: 3, background: '#ffffff', opacity: 0.3 }} />
          <div style={{ position: 'absolute', top: 9, right: 6, width: 3, height: 3, background: '#ffffff', opacity: 0.3 }} />
          {/* Mouth */}
          <div style={{ position: 'absolute', top: 21, left: 9, width: 12, height: 3, background: '#cc8866' }} />

          {/* Glasses (NOVA) */}
          {v.accessory === 'glasses' && (<>
            <div style={{ position: 'absolute', top: 6, left: 3, width: 10, height: 10, border: '2px solid #aaaacc', background: 'transparent' }} />
            <div style={{ position: 'absolute', top: 6, right: 3, width: 10, height: 10, border: '2px solid #aaaacc', background: 'transparent' }} />
            <div style={{ position: 'absolute', top: 9, left: 13, width: 4, height: 2, background: '#aaaacc' }} />
          </>)}
          {/* Sunglasses (BYTE) */}
          {v.accessory === 'sunglasses' && (
            <div style={{ position: 'absolute', top: 6, left: 3, width: 24, height: 9, background: '#0a0a0a', border: '2px solid #2a2a2a' }}>
              <div style={{ position: 'absolute', top: 1, left: 1, width: 3, height: 3, background: '#aaaaaa', opacity: 0.4 }} />
            </div>
          )}
          {/* REX stubble */}
          {agent.id === 'rex' && (
            <div style={{ position: 'absolute', top: 24, left: 6, width: 18, height: 3, background: '#8a6a4a', opacity: 0.25 }} />
          )}
        </div>

        {/* === NECK === */}
        <div style={{
          position: 'absolute',
          top: v.accessory === 'hat' ? 39 : (v.hairStyle === 'flat' || v.hairStyle === 'slick' ? 36 : 39),
          left: 15, width: 18, height: 6, background: v.skin,
        }} />

        {/* === TORSO === */}
        <div style={{
          position: 'absolute', top: 42, left: 6, width: 36, height: 30,
          background: v.outfit,
          boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.2), inset 2px 2px 0 rgba(255,255,255,0.1)',
        }}>
          {/* Outfit details per agent */}
          {agent.id === 'rex' && (
            <div style={{ position: 'absolute', top: 3, left: 6, right: 6, height: 6, background: '#4a8fff', opacity: 0.6 }} />
          )}
          {agent.id === 'nova' && (<>
            <div style={{ position: 'absolute', top: 0, left: 9, right: 9, height: 6, background: '#7a3aaa' }} />
            <div style={{ position: 'absolute', bottom: 3, left: 6, width: 24, height: 12, border: '2px solid #5a1a8a', background: 'transparent' }} />
          </>)}
          {agent.id === 'flora' && (<>
            <div style={{ position: 'absolute', top: 0, left: 12, width: 12, height: 9, background: '#ffffff', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: 12, left: 16, width: 3, height: 3, background: '#aa2868' }} />
            <div style={{ position: 'absolute', top: 18, left: 16, width: 3, height: 3, background: '#aa2868' }} />
            <div style={{ position: 'absolute', top: 24, left: 16, width: 3, height: 3, background: '#aa2868' }} />
          </>)}

          {/* Superpower aura */}
          {agent.superPowerActive && (
            <div style={{
              position: 'absolute', inset: -8,
              border: `3px solid ${v.accent}`,
              boxShadow: `0 0 16px ${v.accent}`,
              animation: 'pixel-pulse 0.3s infinite',
            }} />
          )}
        </div>

        {/* === ARMS === */}
        <div style={{ position: 'absolute', top: 42, left: 0, width: 9, height: 27, background: v.outfit, boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2)' }} />
        <div style={{ position: 'absolute', top: 42, right: 0, width: 9, height: 27, background: v.outfit, boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.2)' }} />
        {/* Hands (skin) */}
        <div style={{ position: 'absolute', top: 66, left: 0, width: 9, height: 6, background: v.skin }} />
        <div style={{ position: 'absolute', top: 66, right: 0, width: 9, height: 6, background: v.skin }} />

        {/* === LEGS === */}
        <div style={{ position: 'absolute', bottom: 9, left: 6, width: 15, height: 21, background: '#2a1a4a' }} />
        <div style={{ position: 'absolute', bottom: 9, right: 6, width: 15, height: 21, background: '#2a1a4a' }} />

        {/* === SHOES === */}
        <div style={{ position: 'absolute', bottom: 0, left: 3, width: 18, height: 9, background: v.shoes, borderTop: `2px solid ${v.shoes}88` }} />
        <div style={{ position: 'absolute', bottom: 0, right: 3, width: 18, height: 9, background: v.shoes, borderTop: `2px solid ${v.shoes}88` }} />

        {/* Drop shadow */}
        <div style={{ position: 'absolute', bottom: -3, left: 3, right: 3, height: 6, background: 'rgba(0,0,0,0.25)', borderRadius: '50%' }} />
      </div>

      {/* Hover name tag */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          textAlign: 'center', marginTop: 4, padding: '2px 6px',
          background: 'rgba(0,0,0,0.85)', border: `1px solid ${v.accent}`,
          fontFamily: 'var(--font-pixel)', fontSize: '8px',
          color: v.accent, whiteSpace: 'nowrap',
          transform: 'translateY(-2px)',
        }}
      >
        {agent.name}
      </div>
    </div>
  )
}
