'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { useState } from 'react'
import { Send } from 'lucide-react'
import { runMission } from '@/lib/gemini'

export function MissionInput() {
  const { geminiApiKey, currentMission, setCurrentMission, isRunning, setIsRunning, addFeedItem } = useAgentStore()
  const [input, setInput] = useState('')

  const handleSubmit = async () => {
    if (!input.trim() || isRunning) return
    const mission = input.trim()
    setInput('')
    setCurrentMission(mission)
    setIsRunning(true)

    addFeedItem({
      agentId: 'system',
      type: 'action',
      message: `🎯 New mission: "${mission}"`,
    })

    await runMission(mission, geminiApiKey)
    setIsRunning(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2" style={{
      background: '#080812',
      borderTop: '2px solid #1a1a3a',
      height: 52,
    }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a8fff', whiteSpace: 'nowrap' }}>
        MISSION
      </div>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Give the team a mission..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          className="w-full outline-none"
          style={{
            background: '#0d0d1a',
            border: `2px solid ${isRunning ? '#2a4a2a' : '#2a2a5a'}`,
            color: '#ccccee',
            fontFamily: 'var(--font-terminal)',
            fontSize: '14px',
            padding: '6px 10px',
            height: 32,
            opacity: isRunning ? 0.6 : 1,
          }}
        />
        {isRunning && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#00ff88', animation: 'pixel-pulse 0.8s infinite' }}>
            AGENTS WORKING...
          </div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isRunning}
        className="pixel-btn pixel-btn-green flex items-center gap-1"
        style={{ height: 32, opacity: (!input.trim() || isRunning) ? 0.4 : 1 }}
      >
        <Send size={10} />
        <span>GO</span>
      </button>
    </div>
  )
}
