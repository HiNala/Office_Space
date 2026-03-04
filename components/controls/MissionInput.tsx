'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { runMission, runGithubReview } from '@/lib/gemini'
import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

export function MissionInput() {
  const { geminiApiKey, isRunning, setIsRunning } = useAgentStore()
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
    const url = githubUrl.trim()
    if (!url || !geminiApiKey || isRunning || !githubIsValid) return
    await runGithubReview(url, reviewType, geminiApiKey)
  }

  const handleCancel = () => {
    setIsRunning(false)
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

  const githubIsValid = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]/.test(githubUrl.trim())

  return (
    <div style={{ background: '#080812', borderTop: '2px solid #1a1a3a', padding: '12px 16px' }}>
      {/* Mode tabs + status */}
      <div className="flex gap-2 mb-2 items-center">
        <button
          onClick={() => setMode('mission')}
          className="pixel-btn"
          style={{
            fontSize: '7px',
            padding: '4px 10px',
            borderColor: mode === 'mission' ? '#ffd700' : '#2a2a5a',
            color: mode === 'mission' ? '#ffd700' : '#888',
            background: mode === 'mission' ? 'rgba(255,215,0,0.06)' : 'transparent',
          }}
        >
          MISSION
        </button>
        <button
          onClick={() => setMode('github')}
          className="pixel-btn"
          style={{
            fontSize: '7px',
            padding: '4px 10px',
            borderColor: mode === 'github' ? '#4a8fff' : '#2a2a5a',
            color: mode === 'github' ? '#4a8fff' : '#888',
            background: mode === 'github' ? 'rgba(74,143,255,0.06)' : 'transparent',
          }}
        >
          GITHUB REVIEW
        </button>

        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <span style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#ffd700', animation: 'pixel-pulse 0.8s infinite' }}>
              WORKING...
            </span>
            <button
              onClick={handleCancel}
              title="Cancel mission"
              className="flex items-center gap-1"
              style={{
                background: 'rgba(255,68,68,0.1)',
                border: '1px solid #ff4444',
                color: '#ff4444',
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              <X size={8} />
              CANCEL
            </button>
          </div>
        )}
      </div>

      {mode === 'mission' ? (
        <>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={geminiApiKey ? 'Give the team a mission...' : 'Enter your Gemini API key first'}
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
              style={{ fontSize: '7px', height: 40, opacity: !input.trim() || !geminiApiKey || isRunning ? 0.45 : 1 }}
            >
              SEND
            </button>
          </div>

          {!isRunning && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {MISSION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setInput(preset)}
                  className="px-2 py-0.5"
                  style={{
                    background: 'transparent',
                    border: '1px solid #2a2a4a',
                    color: '#6666aa',
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4a4a8a'; e.currentTarget.style.color = '#aaaacc' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#6666aa' }}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://github.com/owner/repo"
              disabled={isRunning || !geminiApiKey}
              className="flex-1 outline-none"
              style={{
                background: '#0d0d1a',
                border: `2px solid ${githubUrl && !githubIsValid ? '#ff4444' : '#2a2a5a'}`,
                color: '#ccccee',
                fontFamily: 'var(--font-terminal)',
                fontSize: '13px',
                padding: '8px 12px',
                height: 36,
              }}
            />
            <button
              onClick={handleGithubReview}
              disabled={!githubIsValid || !geminiApiKey || isRunning}
              className="pixel-btn flex items-center gap-1"
              style={{ fontSize: '7px', height: 36, borderColor: '#4a8fff', color: '#4a8fff', opacity: !githubIsValid || !geminiApiKey || isRunning ? 0.45 : 1 }}
            >
              REVIEW
            </button>
          </div>
          <input
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value)}
            placeholder="Review focus (e.g. security audit, UX review...)"
            className="outline-none"
            style={{
              background: '#0d0d1a',
              border: '1px solid #1a1a3a',
              color: '#8888aa',
              fontFamily: 'var(--font-terminal)',
              fontSize: '12px',
              padding: '4px 10px',
              height: 28,
            }}
          />
          {githubUrl && !githubIsValid && (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#ff4444' }}>
              Enter a valid URL: https://github.com/owner/repo
            </div>
          )}
        </div>
      )}
    </div>
  )
}