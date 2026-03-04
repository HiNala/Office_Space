'use client'
import { Agent } from '@/types'
import { ChatBubble } from './ChatBubble'

const AGENT_PIXELS: Record<string, { body: string; hat?: string; accent: string }> = {
  rex:   { body: '#3a6fd4', hat: '#1a2d6a', accent: '#4a8fff' },
  nova:  { body: '#8a3ab8', hat: undefined, accent: '#b44aff' },
  sage:  { body: '#2a7a4a', hat: undefined, accent: '#4aff8f' },
  byte:  { body: '#2a2a2a', hat: undefined, accent: '#ff4a4a' },
  flora: { body: '#c43a7a', hat: undefined, accent: '#ff8fcc' },
}

const STATE_ANIMATIONS: Record<string, string> = {
  idle: 'animate-[idle-bounce_2s_ease-in-out_infinite]',
  working: 'animate-[typing_0.5s_ease-in-out_infinite]',
  thinking: 'animate-[thinking_1s_ease-in-out_infinite]',
  walking: 'animate-[walk-right_0.3s_ease-in-out_infinite]',
  chatting: 'animate-[idle-bounce_1s_ease-in-out_infinite]',
  break: 'animate-[idle-bounce_3s_ease-in-out_infinite]',
  conference: 'animate-[idle-bounce_2s_ease-in-out_infinite]',
}

interface AgentSpriteProps {
  agent: Agent
  onClick?: () => void
}

export function AgentSprite({ agent, onClick }: AgentSpriteProps) {
  const colors = AGENT_PIXELS[agent.id]
  const animClass = STATE_ANIMATIONS[agent.state] || STATE_ANIMATIONS.idle

  const stateEmoji: Record<string, string> = {
    working: '⌨️',
    thinking: '💭',
    break: '☕',
    chatting: '💬',
    conference: '🗣️',
  }

  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer group"
      style={{
        left: `${agent.position.x}%`,
        top: `${agent.position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        transition: 'left 0.8s ease-in-out, top 0.8s ease-in-out',
      }}
      onClick={onClick}
    >
      {agent.chatBubble && (
        <ChatBubble message={agent.chatBubble} color={colors.accent} />
      )}

      <div
        className={`relative ${animClass}`}
        style={{ filter: agent.superPowerActive ? `drop-shadow(0 0 8px ${colors.accent})` : 'none' }}
      >
        {stateEmoji[agent.state] && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs" style={{ fontSize: '10px' }}>
            {stateEmoji[agent.state]}
          </div>
        )}

        <div className="relative" style={{ width: 20, height: 32, imageRendering: 'pixelated' }}>
          {colors.hat && (
            <div className="absolute" style={{
              top: 0, left: 2, width: 16, height: 4,
              background: colors.hat,
              boxShadow: `0 2px 0 ${colors.hat}`,
            }} />
          )}

          <div className="absolute rounded-none" style={{
            top: colors.hat ? 4 : 2,
            left: 4, width: 12, height: 10,
            background: '#f5c8a0',
            boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.2)`,
          }}>
            <div className="absolute" style={{ top: 3, left: 2, width: 2, height: 2, background: '#1a1a1a' }} />
            <div className="absolute" style={{ top: 3, left: 8, width: 2, height: 2, background: '#1a1a1a' }} />
            <div className="absolute" style={{ top: 7, left: 3, width: 6, height: 1, background: '#cc8866' }} />
          </div>

          <div className="absolute" style={{
            top: 12, left: 2, width: 16, height: 14,
            background: colors.body,
            boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.25), inset 1px 1px 0 rgba(255,255,255,0.1)`,
          }}>
            <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: 2, background: colors.accent, opacity: 0.6 }} />
          </div>

          <div className="absolute" style={{
            top: 13, left: 0, width: 3, height: 10,
            background: colors.body,
            boxShadow: `inset -1px -1px 0 rgba(0,0,0,0.2)`,
          }} />

          <div className="absolute" style={{
            top: 13, right: 0, width: 3, height: 10,
            background: colors.body,
            boxShadow: `inset -1px -1px 0 rgba(0,0,0,0.2)`,
          }} />

          <div className="absolute flex gap-1" style={{ bottom: 0, left: 3 }}>
            <div style={{ width: 6, height: 8, background: '#2a1a4a', boxShadow: `0 2px 0 rgba(0,0,0,0.3)` }} />
            <div style={{ width: 6, height: 8, background: '#2a1a4a', boxShadow: `0 2px 0 rgba(0,0,0,0.3)` }} />
          </div>

          <div className="absolute flex gap-0.5" style={{ bottom: -2, left: 2 }}>
            <div style={{ width: 7, height: 3, background: '#1a1a1a' }} />
            <div style={{ width: 7, height: 3, background: '#1a1a1a' }} />
          </div>
        </div>
      </div>

      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 px-1 py-0.5"
        style={{
          background: 'rgba(0,0,0,0.8)',
          border: `1px solid ${colors.accent}`,
          fontSize: '7px',
          fontFamily: 'var(--font-pixel)',
          color: colors.accent,
          whiteSpace: 'nowrap',
        }}
      >
        {agent.name}
      </div>
    </div>
  )
}
