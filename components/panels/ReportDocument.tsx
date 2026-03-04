'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { downloadReport } from '@/lib/report'
import { X, Download, ChevronLeft, FileText, Clock } from 'lucide-react'
import { markdownToHtml } from '@/lib/report'

export function ReportDocument() {
    const { reports, activeReportId, setActiveReport } = useAgentStore()
    const report = reports.find(r => r.id === activeReportId)

    if (!report) return null

    const AGENT_COLORS: Record<string, string> = {
        rex: '#4a8fff', nova: '#b44aff', sage: '#4aff8f', byte: '#ff4a4a', flora: '#ff8fcc'
    }

    return (
        <div
            className="report-doc flex flex-col h-full"
            style={{ background: '#080810' }}
        >
            {/* Document header — styled like Claude's artifact */}
            <div
                style={{
                    background: '#0d0d1a',
                    borderBottom: '1px solid #2a2a4a',
                    padding: '10px 12px',
                    flexShrink: 0,
                }}
            >
                {/* Back button */}
                <button
                    onClick={() => setActiveReport(null)}
                    className="flex items-center gap-1 mb-2"
                    style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: '#6666aa',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#aaaacc')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6666aa')}
                >
                    <ChevronLeft size={10} />
                    BACK TO FEED
                </button>

                {/* Document title */}
                <div className="flex items-start gap-2">
                    <div style={{
                        width: 28, height: 28, flexShrink: 0,
                        background: '#1a1a3a',
                        border: '1px solid #3a3a6a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FileText size={14} style={{ color: '#8888ff' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div style={{
                            fontFamily: 'var(--font-terminal)',
                            fontSize: '13px',
                            color: '#e8e8ff',
                            lineHeight: 1.3,
                            wordBreak: 'break-word',
                        }}>
                            {report.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={9} style={{ color: '#444466' }} />
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '10px', color: '#444466' }}>
                                {report.createdAt.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Agent avatars */}
                <div className="flex items-center gap-1 mt-2">
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444466' }}>BY</span>
                    {report.agentIds.map((id: string) => (
                        <div
                            key={id}
                            style={{
                                width: 14, height: 14,
                                background: AGENT_COLORS[id] + '22',
                                border: `1px solid ${AGENT_COLORS[id]}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                            title={id.toUpperCase()}
                        >
                            <div style={{ width: 6, height: 6, background: AGENT_COLORS[id], borderRadius: '50%' }} />
                        </div>
                    ))}
                </div>

                {/* Download button */}
                <button
                    onClick={() => downloadReport(report)}
                    className="flex items-center gap-1 mt-2 px-3 py-1.5 transition-all"
                    style={{
                        background: '#1a1a3a',
                        border: '2px solid #3a3a6a',
                        color: '#8888ff',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #000',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#ffd700'
                        e.currentTarget.style.color = '#ffd700'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#3a3a6a'
                        e.currentTarget.style.color = '#8888ff'
                    }}
                >
                    <Download size={10} />
                    DOWNLOAD .MD
                </button>
            </div>

            {/* Document body */}
            <div
                className="flex-1 overflow-y-auto report-doc"
                style={{ padding: '16px', fontFamily: 'var(--font-terminal)' }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(report.content) }}
            />

            {/* Report list (if multiple reports) */}
            {reports.length > 1 && (
                <div style={{
                    borderTop: '1px solid #1a1a3a',
                    padding: '8px',
                    background: '#0a0a15',
                    flexShrink: 0,
                }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444466', marginBottom: 4 }}>
                        OTHER REPORTS
                    </div>
                    <div className="flex flex-col gap-1">
                        {reports.filter(r => r.id !== activeReportId).slice(0, 3).map(r => (
                            <button
                                key={r.id}
                                onClick={() => setActiveReport(r.id)}
                                style={{
                                    background: 'none',
                                    border: '1px solid #1a1a3a',
                                    color: '#6666aa',
                                    fontFamily: 'var(--font-terminal)',
                                    fontSize: '11px',
                                    padding: '3px 6px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#4a4a8a'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a3a'}
                            >
                                {r.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
