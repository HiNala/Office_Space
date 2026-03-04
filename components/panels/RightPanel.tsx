'use client'
import { useAgentStore } from '@/store/useAgentStore'

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

export function RightPanel() {
  const { feedItems, reports, activeReportId, setActiveReport, clearFeed } = useAgentStore()
  const activeReport = reports.find(r => r.id === activeReportId)

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d1a' }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2" style={{
        borderBottom: '2px solid #1a1a3a',
        height: 40,
      }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#ffd700' }}>
          ◆ LIVE FEED
        </div>
        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <button
              onClick={() => setActiveReport(activeReportId ? null : reports[0].id)}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#8888ff', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              {activeReportId ? 'FEED' : `REPORTS (${reports.length})`}
            </button>
          )}
          <button
            onClick={clearFeed}
            style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444466', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {activeReport ? (
        <div className="flex-1 overflow-y-auto p-3 report-doc">
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#ffd700' }}>
              {activeReport.title}
            </div>
            <button onClick={() => setActiveReport(null)} style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#666688', background: 'none', border: 'none', cursor: 'pointer' }}>
              ✕ CLOSE
            </button>
          </div>
          <div
            className="report-doc"
            dangerouslySetInnerHTML={{ __html: activeReport.content.replace(/\n/g, '<br/>') }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {feedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: '#333355' }}>
              <div style={{ fontSize: '32px' }}>🕹️</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', textAlign: 'center', lineHeight: 2 }}>
                OFFICE SPACE<br/>
                <span style={{ color: '#222244' }}>assign a mission to begin</span>
              </div>
            </div>
          ) : (
            feedItems.map((item) => (
              <div
                key={item.id}
                className="feed-item px-2 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${AGENT_COLORS[item.agentId] || '#2a2a4a'}22`,
                  borderLeft: `2px solid ${AGENT_COLORS[item.agentId] || '#2a2a4a'}`,
                }}
              >
                <div className="flex items-start gap-1.5">
                  <span style={{ fontSize: '10px', lineHeight: 1.4 }}>{TYPE_ICONS[item.type] || '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div style={{
                      fontFamily: 'var(--font-terminal)',
                      fontSize: '12px',
                      color: '#ccccee',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}>
                      <span style={{ color: AGENT_COLORS[item.agentId] || '#8888aa', fontWeight: 'bold' }}>
                        {item.agentId.toUpperCase()}
                      </span>
                      {' '}
                      {item.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#333355', marginTop: 1 }}>
                      {item.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
