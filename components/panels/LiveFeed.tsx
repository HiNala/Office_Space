'use client'
import { useAgentStore } from '@/store/useAgentStore'
import { FeedItem } from '@/types'
import { ChevronDown, ChevronRight, ExternalLink, Search, MessageSquare, Zap, AlertTriangle, FileText, Activity } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { AGENT_COLORS as BASE_AGENT_COLORS } from '@/lib/agents'

const AGENT_COLORS: Record<string, string> = { ...BASE_AGENT_COLORS, system: '#ffd700' }

const AGENT_ICONS: Record<string, string> = {
    rex: 'R', nova: 'N', sage: 'S', byte: 'B', flora: 'F', system: '*',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
    search:     <Search size={10} />,
    reasoning:  <Activity size={10} />,
    chat:       <MessageSquare size={10} />,
    action:     <Zap size={10} />,
    result:     <ChevronRight size={10} />,
    report:     <FileText size={10} />,
    superpower: <Zap size={10} />,
    error:      <AlertTriangle size={10} />,
}

const TYPE_COLORS: Record<string, string> = {
    search:     '#b44aff',
    reasoning:  '#888888',
    chat:       '#ccccee',
    action:     '#ffd700',
    result:     '#4aff8f',
    report:     '#ffd700',
    superpower: '#ff8800',
    error:      '#ff4444',
}

interface FeedItemRowProps {
    item: FeedItem
}

function FeedItemRow({ item }: FeedItemRowProps) {
    const { toggleFeedItemExpanded, setActiveReport, reports } = useAgentStore()
    const color = AGENT_COLORS[item.agentId] ?? AGENT_COLORS.system
    const typeColor = TYPE_COLORS[item.type] ?? '#888888'
    const icon = AGENT_ICONS[item.agentId] ?? '*'

    const handleClick = () => {
        if (item.type === 'report') {
            // Open the exact report this feed item references
            const target = item.reportId
                ? reports.find((r) => r.id === item.reportId)
                : reports[0]
            if (target) setActiveReport(target.id)
        } else if (item.detail) {
            toggleFeedItemExpanded(item.id)
        }
    }

    const time = item.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })

    return (
        <div
            className="feed-item cursor-pointer group"
            onClick={handleClick}
            style={{
                borderLeft: `2px solid ${color}`,
                padding: '6px 8px 6px 10px',
                marginBottom: 2,
                background: item.isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                transition: 'background 0.1s',
            }}
        >
            <div className="flex items-start gap-2">
                {/* Agent badge */}
                <div style={{
                    flexShrink: 0,
                    width: 16, height: 16,
                    background: `${color}22`,
                    border: `1px solid ${color}66`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color,
                }}>
                    {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                        <span style={{ color: typeColor, flexShrink: 0 }}>
                            {TYPE_ICONS[item.type]}
                        </span>
                        <span style={{
                            fontFamily: 'var(--font-terminal)',
                            fontSize: '11px',
                            color: '#ccccee',
                            lineHeight: 1.4,
                        }}>
                            {item.message}
                        </span>
                        {item.type === 'report' && (
                            <span style={{ fontSize: '9px', color: '#ffd700', flexShrink: 0 }}>← OPEN</span>
                        )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '10px', color: '#444466' }}>
                        {time}
                    </div>
                </div>

                {/* Expand/collapse for items with detail */}
                {item.detail && item.type !== 'report' && (
                    <div style={{ color: '#444466', flexShrink: 0 }}>
                        {item.isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </div>
                )}
            </div>

            {/* Expanded detail */}
            {item.isExpanded && item.detail && (
                <div style={{
                    marginTop: 4,
                    padding: '6px 8px',
                    background: '#0a0a15',
                    border: '1px solid #1a1a3a',
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '11px',
                    color: '#8888aa',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}>
                    {item.detail}
                    {item.searchUrl && (
                        <a
                            href={item.searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 mt-2"
                            style={{ color: '#4a8fff', textDecoration: 'none', fontSize: '10px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink size={9} />
                            View source
                        </a>
                    )}
                </div>
            )}
        </div>
    )
}

export function LiveFeed() {
    const { feedItems, clearFeed, isRunning } = useAgentStore()
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [feedItems.length, isRunning])

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2" style={{
                borderBottom: '1px solid #1a1a3a',
                background: '#0a0a15',
            }}>
                <div className="flex items-center gap-2">
                    <div style={{
                        width: 6, height: 6,
                        background: isRunning ? '#00ff88' : '#444466',
                        boxShadow: isRunning ? '0 0 6px #00ff88' : 'none',
                        animation: isRunning ? 'pixel-pulse 0.6s infinite' : 'none',
                    }} />
                    <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#6666aa' }}>
                        LIVE FEED
                    </span>
                    {feedItems.length > 0 && (
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '11px', color: '#444466' }}>
                            ({feedItems.length})
                        </span>
                    )}
                </div>
                {feedItems.length > 0 && !isRunning && (
                    <button
                        onClick={clearFeed}
                        title="Clear feed"
                        style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '6px',
                            color: '#444466',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#ff4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#444466')}
                    >
                        CLEAR
                    </button>
                )}
            </div>

            {/* Feed content */}
            <div className="flex-1 overflow-y-auto" style={{ padding: '8px 0' }}>
                {feedItems.length === 0 && !isRunning ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3" style={{ opacity: 0.4 }}>
                        <div style={{ fontSize: '32px' }}>🕹️</div>
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4a4a6a', textAlign: 'center', lineHeight: 2 }}>
                            WAITING FOR<br />MISSION...
                        </div>
                        <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '12px', color: '#3a3a5a', textAlign: 'center', lineHeight: 1.5 }}>
                            Enter your Gemini API key<br />
                            and give the team a task
                        </div>
                    </div>
                ) : (
                    <>
                        {feedItems.map((item) => (
                            <FeedItemRow key={item.id} item={item} />
                        ))}
                        {isRunning && (
                            <div style={{
                                borderLeft: '2px solid #ffd700',
                                padding: '6px 8px 6px 10px',
                                marginTop: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: 4, height: 4,
                                            background: '#ffd700',
                                            animation: 'pixel-pulse 0.8s infinite',
                                            animationDelay: `${i * 0.2}s`,
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '11px', color: '#ffd700' }}>
                                    Agents working...
                                </span>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>
        </div>
    )
}
