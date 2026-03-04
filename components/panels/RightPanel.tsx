'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { LiveFeed } from './LiveFeed'
import { ReportDocument } from './ReportDocument'

export function RightPanel() {
  const { activeReportId } = useAgentStore()

  return (
    <div className="h-full flex flex-col" style={{ background: '#080812' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{
          background: '#080812',
          borderBottom: '2px solid #1a1a3a',
          height: 40,
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a4a6a' }}>
          {activeReportId ? '◆ REPORT' : '◆ AGENT FEED'}
        </div>

        {/* Gemini badge */}
        <div className="flex items-center gap-1">
          <div
            style={{
              width: 5,
              height: 5,
              background: '#4a8fd4',
              boxShadow: '0 0 4px #4a8fd4',
              animation: 'pixel-pulse 2s infinite',
            }}
          />
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#4a8fd4' }}>
            GEMINI 2.0
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeReportId ? <ReportDocument /> : <LiveFeed />}
      </div>
    </div>
  )
}
