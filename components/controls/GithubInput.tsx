'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { useState } from 'react'
import { Github, Search } from 'lucide-react'
import { runGithubReview } from '@/lib/gemini'

export function GithubInput() {
  const { geminiApiKey, isRunning, setIsRunning, githubUrl, setGithubUrl } = useAgentStore()
  const [input, setInput] = useState('')

  const handleReview = async () => {
    if (!input.trim() || isRunning) return
    const url = input.trim()
    setGithubUrl(url)
    setInput('')
    setIsRunning(true)
    await runGithubReview(url, geminiApiKey)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleReview()
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderTop: '1px solid #0d0d2a', background: '#080812', height: 38 }}>
      <Github size={11} style={{ color: '#4a4a8a', flexShrink: 0 }} />
      <input
        type="text"
        placeholder="github.com/owner/repo — review with all 5 agents"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isRunning}
        className="flex-1 outline-none"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#8888aa',
          fontFamily: 'var(--font-terminal)',
          fontSize: '12px',
          opacity: isRunning ? 0.5 : 1,
        }}
      />
      <button
        onClick={handleReview}
        disabled={!input.trim() || isRunning}
        style={{
          background: 'none',
          border: 'none',
          cursor: (!input.trim() || isRunning) ? 'default' : 'pointer',
          opacity: (!input.trim() || isRunning) ? 0.3 : 1,
          color: '#4a4a8a',
          flexShrink: 0,
        }}
      >
        <Search size={11} />
      </button>
    </div>
  )
}
