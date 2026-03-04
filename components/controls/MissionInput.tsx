'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { runMission, runGithubReview } from '@/lib/gemini'
import { useState, KeyboardEvent } from 'react'
import { Zap } from 'lucide-react'

export function MissionInput() {
  const { geminiApiKey, isRunning, githubUrl, setGithubUrl } = useAgentStore()
  const [input, setInput] = useState('')
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
    await runGithubReview(githubUrl, reviewType, geminiApiKey)
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
      {/* Mode tabs */}
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
          🎯 MISSION
        </button>
        <button
          onClick={() => setMode('github')}
          className="pixel-btn"
          style={{
            fontSize: '7px',
            padding: '4px 10px',
            borderColor: mode === 'github' ? '#ffd700' : '#2a2a5a',
            color: mode === 'github' ? '#ffd700' : '#888',
            background: mode === 'github' ? 'rgba(255,215,0,0.06)' : 'transparent',
          }}
        >
          🐙 GITHUB REVIEW
        </button>

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
            ◆ TEAM IS WORKING...
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
              placeholder={
                geminiApiKey ? 'Give the team a mission...' : 'Enter your Gemini API key first ↑'
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
              ▶ SEND
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
        </>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex gap-2 relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#666688' }}>github.com/</span>
            </div>
            <input
              value={githubUrl.replace(/^https?:\/\/github\.com\//, '')}
              onChange={(e) => setGithubUrl('https://github.com/' + e.target.value)}
              onKeyDown={handleKey}
              placeholder="owner/repo"
              disabled={isRunning || !geminiApiKey}
              className="flex-1 outline-none"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#f2f2f7',
                fontFamily: 'var(--font-terminal)',
                fontSize: '14px',
                padding: '8px 12px 8px 80px',
                height: 40,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(10, 132, 255, 0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
            />
            <button
              onClick={handleGithubReview}
              disabled={!githubUrl.trim() || !geminiApiKey || isRunning}
              className="pixel-btn flex items-center gap-1"
              style={{
                fontSize: '7px', height: 40,
                borderColor: 'rgba(10, 132, 255, 0.5)',
                color: '#5ac8fa',
                background: 'rgba(10, 132, 255, 0.1)',
                opacity: !githubUrl.trim() || !geminiApiKey || isRunning ? 0.45 : 1,
              }}
            >
              <Zap size={10} />
              REVIEW
            </button>
          </div>

          {/* Pills for Review Focus */}
          <div className="flex flex-wrap gap-2 items-center">
            <span style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: '#666688', marginRight: 4 }}>STYLE:</span>
            {['Architecture', 'Security', 'Code Quality & UX', 'Full Audit'].map((pill) => {
              const isActive = reviewType.includes(pill) || (pill === 'Full Audit' && reviewType.includes('Full'));
              return (
                <button
                  key={pill}
                  onClick={() => setReviewType(pill === 'Full Audit' ? 'Full code review — architecture, security, and UX' : `${pill} focus`)}
                  style={{
                    background: isActive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${isActive ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: isActive ? '#34c759' : '#8888aa',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-terminal)',
                    cursor: isRunning ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    pointerEvents: isRunning ? 'none' : 'auto',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = '#ccccee';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#8888aa';
                    }
                  }}
                >
                  {pill}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
