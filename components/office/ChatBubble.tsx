'use client'

interface ChatBubbleProps {
  message: string
  color: string
}

export function ChatBubble({ message, color }: ChatBubbleProps) {
  return (
    <div
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/4 z-20"
      style={{ animation: 'chat-bubble-in 0.2s ease-out forwards', maxWidth: '140px', minWidth: '60px' }}
    >
      <div
        className="relative px-2 py-1.5 text-center"
        style={{
          background: 'rgba(5,5,20,0.95)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 8px ${color}44, 2px 2px 0 #000`,
          fontSize: '8px',
          fontFamily: 'var(--font-terminal)',
          color: '#e8e8ff',
          lineHeight: 1.4,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        }}
      >
        {message}
        <div
          className="absolute -bottom-2 left-3"
          style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `4px solid ${color}`,
          }}
        />
      </div>
    </div>
  )
}
