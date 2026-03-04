'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { runMission, runGithubReview } from '@/lib/gemini'
import { useState, KeyboardEvent } from 'react'

export function MissionInput() {
  const { geminiApiKey, isRunning } = useAgentStore()
  const [input, setInput] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [mode, setMode] = useState<'mission' | 'github'>('mission')
  const [reviewType, setReviewType] = useState('Full code review — architecture, security, and UX')

  const handleSubmit = async () => {
    if (!input.trim() || !geminiApiKey || isRunning) return
    const value = input
    setInput('')
    await runMission(value, geminiApiKey)
  }

  const handleGithubReview = async () => {
    if (!githubUrl.trim() || !geminiApiKey || isRunning) return
    const url = githubUrl
    setGithubUrl('')
    await runGithubReview(url, reviewType, geminiApiKey)
  }

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (mode === 'mission') handleSubmit()
      else handleGithubReview()
    }
  }

  const MISSION_PRESETS = [
    'Analyze our tech stack choices',
    'Build a viral consumer app idea',
    'Review our go-to-market strategy',
    'Security threat model for a SaaS',
  ]

  return (
    <div
      style={{
        background: '#080812',
        borderTop: '2px solid #1a1a3a',
        padding: '12px 16px',
      }}
    >
      <div className="flex gap-2 mb-2 items-center">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#ffd700', padding: '4px 0' }}>
          MISSION ASSIGNMENT
        </div>

        {isRunning && (
          <div
            className="ml-auto flex items-center gap-1"
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-pixel)',
              color: '#ffd700',
              animation: 'pixel-pulse 0.8s infinite',
            }}
          >
            TEAM IS WORKING...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            geminiApiKey ? 'Give the team a mission...' : 'Enter your Gemini API key first'
          }
          disabled={isRunning || !geminiApiKey}
          className="flex-1 outline-none"
          style={{
            background: '#0d0d1a',
            border: `2px solid ${isRunning ? '#2a2a3a' : '#2a2a5a'}`,
            color: isRunning ? '#555566' : '#ccccee',
            fontFamily: 'var(--font-terminal)',
            fontSize: '14px',
            padding: '8px 12px',
            height: 40,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || !geminiApiKey || isRunning}
          className="pixel-btn pixel-btn-green flex items-center gap-1"
          style={{
            fontSize: '7px',
            height: 40,
            opacity: !input.trim() || !geminiApiKey || isRunning ? 0.45 : 1,
          }}
        >
          SEND
        </button>
      </div>

      {/* Quick mission presets */}
      {!isRunning && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {MISSION_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setInput(preset)}
              className="px-2 py-0.5 transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid #2a2a4a',
                color: '#6666aa',
                fontFamily: 'var(--font-terminal)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4a4a8a'
                e.currentTarget.style.color = '#aaaacc'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2a2a4a'
                e.currentTarget.style.color = '#6666aa'
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}