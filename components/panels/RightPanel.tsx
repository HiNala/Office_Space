'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { LiveFeed } from './LiveFeed'
import { ReportDocument } from './ReportDocument'

export function RightPanel() {
  const { activeReportId } = useAgentStore()

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d1a' }}>
      {activeReportId ? <ReportDocument /> : <LiveFeed />}
    </div>
  )
}
