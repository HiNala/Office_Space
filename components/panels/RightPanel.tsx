'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { FeedItem } from '@/types'
import { FileText, X, Download } from 'lucide-react'
import { useEffect, useRef } from 'react'

const AGENT_COLORS: Record<string, string> = {
  rex: '#4a8fff',
  nova: '#b44aff',
  sage: '#4aff8f',
  byte: '#ff4a4a',
  flora: '#ff8fcc',
  system: '#ffd700',
}

const TYPE_ICONS: Record<string, string> = {
  search: '🔍',
  reasoning: '🧠',
  chat: '💬',
  action: '⚡',
  result: '✅',
  report: '📄',
  superpower: '⚡',
  error: '❌',
}

// Simple markdown → JSX renderer (no extra deps)
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{ fontSize: '0.85rem', color: 'var(--accent-green)', margin: '16px 0 6px', fontFamily: 'var(--font-pixel)' }}>
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize: '0.75rem', color: '#8888ff', margin: '10px 0 4px', fontFamily: 'var(--font-pixel)' }}>
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} style={{ fontSize: '1rem', color: 'var(--accent-yellow)', margin: '0 0 12px', fontFamily: 'var(--font-pixel)' }}>
          {line.slice(2)}
        </h1>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={key++} style={{ fontSize: '0.8rem', color: '#ccccee', lineHeight: 1.6, paddingLeft: 8, marginBottom: 2 }}>
          <span style={{ color: 'var(--accent-yellow)' }}>▸ </span>{line.slice(2)}
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={key++} style={{ fontSize: '0.8rem', color: '#ccccee', lineHeight: 1.6, paddingLeft: 8, marginBottom: 2 }}>
          <span style={{ color: '#4a8fff' }}>{line.match(/^\d+/)?.[0]}.</span> {line.replace(/^\d+\.\s/, '')}
        </div>
      )
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <div key={key++} style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 'bold', marginBottom: 3 }}>
          {line.slice(2, -2)}
        </div>
      )
    } else if (line.trim() === '' || line === '---') {
      elements.push(<div key={key++} style={{ height: 6 }} />)
    } else if (line.trim()) {
      // Inline bold rendering
      const parts = line.split(/\*\*(.*?)\*\*/g)
      elements.push(
        <p key={key++} style={{ fontSize: '0.8rem', color: '#ccccee', lineHeight: 1.6, marginBottom: 4 }}>
          {parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i} style={{ color: '#ffffff' }}>{part}</strong> : part
          )}
        </p>
      )
    }
  }

  return elements
}

function FeedItemRow({ item }: { item: FeedItem }) {
  const { toggleFeedItemExpanded } = useAgentStore()
  const color = AGENT_COLORS[item.agentId] || '#8888aa'
  const hasDetail = Boolean(item.detail)

  return (
    <div
      className="feed-item px-2 py-1.5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderLeft: `2px solid ${color}`,
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        cursor: hasDetail ? 'pointer' : 'default',
      }}
      onClick={() => hasDetail && toggleFeedItemExpanded(item.id)}
    >
      <div className="flex items-start gap-1.5">
        <span style={{ fontSize: '11px', lineHeight: 1.5, flexShrink: 0 }}>{TYPE_ICONS[item.type] || '•'}</span>
        <div className="flex-1 min-w-0">
          <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '12px', color: '#ccccee', lineHeight: 1.4, wordBreak: 'break-word' }}>
            <span style={{ color, fontWeight: 'bold' }}>{item.agentId.toUpperCase()} </span>
            {item.message}
          </div>
          {item.isExpanded && item.detail && (
            <div className="mt-1 p-1.5" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #1a1a3a', fontSize: '11px', color: '#aaaacc', lineHeight: 1.5, fontFamily: 'var(--font-terminal)', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
              {item.detail}
            </div>
          )}
          <div style={{ fontSize: '9px', color: '#333355', marginTop: 1, fontFamily: 'var(--font-terminal)' }}>
            {item.timestamp.toLocaleTimeString()}
            {hasDetail && <span style={{ color: '#444466', marginLeft: 6 }}>{item.isExpanded ? '▲ collapse' : '▼ expand'}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportView() {
  const { reports, activeReportId, setActiveReport } = useAgentStore()
  const report = reports.find((r) => r.id === activeReportId)

  if (!report) return null

  const handleDownload = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full report-doc">
      {/* Report header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1a1a3a', background: '#080812' }}>
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={12} style={{ color: '#ffd700', flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#ffd700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {report.title}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleDownload} className="flex items-center gap-1" style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#4aff8f', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Download size={10} /> .MD
          </button>
          <button onClick={() => setActiveReport(null)} style={{ color: '#444466', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Report agents */}
      <div className="flex items-center gap-1 px-3 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid #0d0d2a' }}>
        {report.agentIds.map((id) => (
          <div key={id} style={{ fontSize: '7px', fontFamily: 'var(--font-pixel)', color: AGENT_COLORS[id], padding: '1px 4px', border: `1px solid ${AGENT_COLORS[id]}44`, background: `${AGENT_COLORS[id]}11` }}>
            {id.toUpperCase()}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '9px', color: '#333355', fontFamily: 'var(--font-terminal)' }}>
          {report.createdAt.toLocaleTimeString()}
        </div>
      </div>

      {/* Report content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {renderMarkdown(report.content)}
      </div>
    </div>
  )
}

export function RightPanel() {
  const { feedItems, reports, activeReportId, setActiveReport, clearFeed, isRunning } = useAgentStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feedItems.length, isRunning, activeReportId])

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d1a' }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '2px solid #1a1a3a', height: 40 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#ffd700' }}>
          {activeReportId ? '◆ REPORT' : '◆ LIVE FEED'}
          {isRunning && !activeReportId && (
            <span style={{ color: '#00ff88', marginLeft: 8, animation: 'pixel-pulse 0.8s infinite' }}>● LIVE</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {reports.length > 0 && !activeReportId && (
            <button
              onClick={() => setActiveReport(reports[0].id)}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#4a8fff', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              📄 {reports.length} REPORT{reports.length > 1 ? 'S' : ''}
            </button>
          )}
          {activeReportId && (
            <button
              onClick={() => setActiveReport(null)}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#8888ff', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              ← FEED
            </button>
          )}
          {!activeReportId && (
            <button onClick={clearFeed} style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#333355', cursor: 'pointer', background: 'none', border: 'none' }}>
              CLEAR
            </button>
          )}
        </div>
      </div>

      {activeReportId ? (
        <ReportView />
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col">
          {feedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: '#333355' }}>
              <div style={{ fontSize: '40px' }}>🕹️</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', textAlign: 'center', lineHeight: 2.2, color: '#2a2a4a' }}>
                OFFICE SPACE<br />
                <span style={{ color: '#1a1a3a' }}>assign a mission to begin</span><br />
                <span style={{ color: '#1a1a3a', fontSize: '6px' }}>or click an agent to activate<br />their super power</span>
              </div>
            </div>
          ) : (
            <>
              {feedItems.map((item) => <FeedItemRow key={item.id} item={item} />)}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
