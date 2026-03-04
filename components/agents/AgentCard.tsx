'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { AgentId } from '@/types'
import { X, Zap } from 'lucide-react'
import { useState } from 'react'
import { activateSuperPower } from '@/lib/gemini'

interface AgentCardProps {
  agentId: AgentId
  onClose: () => void
}

export function AgentCard({ agentId, onClose }: AgentCardProps) {
  const { agents, setAgentSystemPrompt, updateAgent, geminiApiKey } = useAgentStore()
  const agent = agents[agentId]
  const [prompt, setPrompt] = useState(agent.systemPrompt)
  const [powerLoading, setPowerLoading] = useState(false)

  const handleSuperPower = async () => {
    if (!geminiApiKey || powerLoading) return
    setPowerLoading(true)
    try {
      await activateSuperPower(agentId, geminiApiKey)
    } finally {
      setPowerLoading(false)
      onClose() // close after work is done (or failed), so user sees the loading state
    }
  }

  return (
    <div
      className="absolute z-30 pixel-panel"
      style={{
        left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 280,
        padding: 16,
        borderColor: agent.color,
        boxShadow: `6px 6px 0 #000, 0 0 20px ${agent.color}44`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: agent.color }}>
          {agent.name} — {agent.role}
        </div>
        <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="mb-3 p-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', fontFamily: 'var(--font-terminal)', color: '#8888aa', lineHeight: 1.5 }}>
        {agent.personality}
      </div>

      <div className="mb-3">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#6666aa', marginBottom: 4 }}>
          SYSTEM PROMPT
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onBlur={() => setAgentSystemPrompt(agentId, prompt)}
          rows={5}
          className="w-full resize-none outline-none"
          style={{
            background: '#0a0a1a',
            border: '2px solid #2a2a4a',
            color: '#ccccee',
            fontFamily: 'var(--font-terminal)',
            fontSize: '11px',
            padding: '6px 8px',
            lineHeight: 1.5,
          }}
        />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => updateAgent(agentId, { isActive: !agent.isActive })}
          className="pixel-btn"
          style={{ borderColor: agent.isActive ? '#00aa44' : '#aa2222', color: agent.isActive ? '#00ff88' : '#ff4444', fontSize: '7px' }}
        >
          {agent.isActive ? 'ACTIVE' : 'INACTIVE'}
        </button>
      </div>

      <button
        onClick={handleSuperPower}
        disabled={powerLoading || !geminiApiKey}
        className="w-full flex items-center justify-center gap-2 superpower-btn"
        style={{
          background: powerLoading ? '#1a1a1a' : `linear-gradient(135deg, ${agent.color}22, ${agent.color}44)`,
          border: `2px solid ${agent.color}`,
          color: agent.color,
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          padding: '10px',
          cursor: powerLoading ? 'wait' : 'pointer',
          boxShadow: `3px 3px 0 #000, 0 0 10px ${agent.color}33`,
          animation: powerLoading ? 'pixel-pulse 0.5s infinite' : 'none',
          transition: 'box-shadow 0.2s, transform 0.1s',
          opacity: !geminiApiKey ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!powerLoading) {
            e.currentTarget.style.boxShadow = `3px 3px 0 #000, 0 0 16px ${agent.color}66, 0 0 32px ${agent.color}22`
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `3px 3px 0 #000, 0 0 10px ${agent.color}33`
          e.currentTarget.style.transform = ''
        }}
        onMouseDown={(e) => {
          if (!powerLoading) {
            e.currentTarget.style.transform = 'scale(0.92)'
            e.currentTarget.style.boxShadow = `1px 1px 0 #000, 0 0 20px ${agent.color}88`
          }
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          setTimeout(() => { if (e.currentTarget) e.currentTarget.style.transform = '' }, 150)
        }}
      >
        <Zap size={12} />
        {powerLoading ? 'ACTIVATING...' : `${agent.superPowerName}`}
      </button>

      {!geminiApiKey && (
        <div style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#666688', textAlign: 'center', marginTop: 6 }}>
          Enter API key to activate powers
        </div>
      )}
    </div>
  )
}