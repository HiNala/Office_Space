'use client'
import { useEffect, useState } from 'react'
import { TopBar } from '@/components/controls/TopBar'
import { OfficeMap } from '@/components/office/OfficeMap'
import { RightPanel } from '@/components/panels/RightPanel'
import { BootScreen } from '@/components/ui/BootScreen'
import { startIdleSystem } from '@/lib/idleSystem'

export default function Home() {
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    if (booted) startIdleSystem()
  }, [booted])

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#080812', opacity: booted ? 1 : 0, transition: 'opacity 0.5s' }}>
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1" style={{ minWidth: 0 }}>
            <OfficeMap />
          </div>
          <div style={{ width: 380, flexShrink: 0, borderLeft: '2px solid #1a1a3a' }}>
            <RightPanel />
          </div>
        </div>
      </div>
    </>
  )
}
