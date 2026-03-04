'use client'
import { useState, useEffect } from 'react'

interface ChatBubbleProps {
  message: string
  color: string
}

export function ChatBubble({ message, color }: ChatBubbleProps) {
  const [exiting, setExiting] = useState(false)

  /* Auto-dismiss: max(4000ms, text.length × 80ms) */
  useEffect(() => {
    const duration = Math.max(4000, message.length * 80)
    const timer = setTimeout(() => setExiting(true), duration)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <div
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/4 z-20 pointer-events-none"
      style={{
        animation: exiting
          ? 'bubble-out 0.2s ease-in forwards'
          : 'bubble-in 0.25s ease-out forwards',
        maxWidth: '150px',
        minWidth: '60px',
      }}
    >
      <div
        className="relative px-2 py-1.5 text-center"
        style={{
          background: 'rgba(5,5,20,0.92)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 8px ${color}33, inset 0 0 6px ${color}15, 2px 2px 0 rgba(0,0,0,0.5)`,
          fontSize: '8px',
          fontFamily: 'var(--font-terminal)',
          color: '#e8e8ff',
          lineHeight: 1.4,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        {/* Colored accent line at top */}
        <div style={{
          position: 'absolute', top: 0, left: 2, right: 2, height: 1,
          background: color, opacity: 0.5,
        }} />
        {message}
        {/* Tail */}
        <div
          className="absolute -bottom-2 left-3"
          style={{
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `4px solid ${color}`,
            filter: `drop-shadow(1px 1px 0 rgba(0,0,0,0.5))`,
          }}
        />
        {/* Inner tail fill */}
        <div
          className="absolute left-3"
          style={{
            bottom: -1, width: 0, height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderTop: '3px solid rgba(5,5,20,0.92)',
          }}
        />
      </div>
    </div>
  )
}
