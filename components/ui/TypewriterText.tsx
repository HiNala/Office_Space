'use client'
import { useEffect, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  style?: React.CSSProperties
}

export function TypewriterText({ text, speed = 30, onComplete, className, style }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setDisplayed('')
    setIndex(0)
  }, [text])

  useEffect(() => {
    if (index >= text.length) {
      onComplete?.()
      return
    }
    const timer = setTimeout(() => {
      setDisplayed((prev) => prev + text[index])
      setIndex((i) => i + 1)
    }, speed)
    return () => clearTimeout(timer)
  }, [index, text, speed, onComplete])

  return (
    <span className={className} style={style}>
      {displayed}
      {index < text.length && (
        <span style={{ animation: 'blink-cursor 0.7s infinite', borderRight: '2px solid currentColor' }} />
      )}
    </span>
  )
}
