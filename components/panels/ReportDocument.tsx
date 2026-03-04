'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { downloadReport, markdownToHtml } from '@/lib/report'
import { Download, ChevronLeft, FileText, Clock, GitBranch, Zap } from 'lucide-react'
import { AGENT_COLORS } from '@/lib/agents'
import { AgentId } from '@/types'

const REPORT_THEME: Record<string, { accent: string; label: string; icon: React.ReactNode }> = {
    mission_result: {
        accent: '#ffd700',
        label: 'MISSION REPORT',
        icon: <FileText size={14} style={{ color: '#ffd700' }} />,
    },
    github_review: {
        accent: '#4aff8f',
        label: 'CODE REVIEW',
        icon: <GitBranch size={14} style={{ color: '#4aff8f' }} />,
    },
    superpower: {
        accent: '#ff8800',
        label: 'SUPER POWER',
        icon: <Zap size={14} style={{ color: '#ff8800' }} />,
    },
}

export function ReportDocument() {
    const { reports, activeReportId, setActiveReport } = useAgentStore()
    const report = reports.find(r => r.id === activeReportId)

    if (!report) return null

    const theme = REPORT_THEME[report.type] ?? REPORT_THEME.mission_result

    return (
        <div className="report-doc flex flex-col h-full" style={{ background: '#080810' }}>
            {/* Document header */}
            <div style={{
                background: '#0d0d1a',
                borderBottom: `2px solid ${theme.accent}44`,
                padding: '10px 12px',
                flexShrink: 0,
            }}>
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

                {/* Report type badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: `${theme.accent}18`,
                    border: `1px solid ${theme.accent}55`,
                    padding: '2px 6px',
                    marginBottom: 8,
                }}>
                    <div style={{ width: 6, height: 6, background: theme.accent }} />
                    <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: theme.accent,
                        letterSpacing: 1,
                    }}>
                        {theme.label}
                    </span>
                </div>

                {/* Document title */}
                <div className="flex items-start gap-2">
                    <div style={{
                        width: 28, height: 28, flexShrink: 0,
                        background: `${theme.accent}18`,
                        border: `1px solid ${theme.accent}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {theme.icon}
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
                    {report.agentIds.map((id: string) => {
                        const c = AGENT_COLORS[id as AgentId] ?? '#8888aa'
                        return (
                            <div key={id} style={{
                                width: 14, height: 14,
                                background: c + '22',
                                border: `1px solid ${c}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }} title={id.toUpperCase()}>
                                <div style={{ width: 6, height: 6, background: c, borderRadius: '50%' }} />
                            </div>
                        )
                    })}
                </div>

                {/* Download button */}
                <button
                    onClick={() => downloadReport(report)}
                    className="flex items-center gap-1 mt-2 px-3 py-1.5"
                    style={{
                        background: '#1a1a3a',
                        border: `2px solid ${theme.accent}44`,
                        color: theme.accent,
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0 #000',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = theme.accent
                        e.currentTarget.style.background = `${theme.accent}18`
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = `${theme.accent}44`
                        e.currentTarget.style.background = '#1a1a3a'
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

            {/* Other reports list — scrollable, no hard cap */}
            {reports.length > 1 && (
                <div style={{
                    borderTop: '1px solid #1a1a3a',
                    padding: '8px',
                    background: '#0a0a15',
                    flexShrink: 0,
                    maxHeight: 120,
                    overflowY: 'auto',
                }}>
                    <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: '#444466', marginBottom: 4 }}>
                        OTHER REPORTS ({reports.length - 1})
                    </div>
                    <div className="flex flex-col gap-1">
                        {reports.filter(r => r.id !== activeReportId).map(r => {
                            const t = REPORT_THEME[r.type] ?? REPORT_THEME.mission_result
                            return (
                                <button
                                    key={r.id}
                                    onClick={() => setActiveReport(r.id)}
                                    style={{
                                        background: 'none',
                                        border: `1px solid ${t.accent}33`,
                                        color: '#6666aa',
                                        fontFamily: 'var(--font-terminal)',
                                        fontSize: '11px',
                                        padding: '3px 6px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = `${t.accent}33`}
                                >
                                    <div style={{ width: 4, height: 4, background: t.accent, flexShrink: 0 }} />
                                    {r.title}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}