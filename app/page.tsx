'use client'
import { useEffect, useState } from 'react'
import { TopBar } from '@/components/controls/TopBar'
import { OfficeMap } from '@/components/office/OfficeMap'
import { RightPanel } from '@/components/panels/RightPanel'
import { MissionInput } from '@/components/controls/MissionInput'
import { BootScreen } from '@/components/ui/BootScreen'
import { startIdleSystem, stopIdleSystem } from '@/lib/idleSystem'

export default function Home() {
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    if (!booted) return
    startIdleSystem()
    return () => stopIdleSystem()
  }, [booted])

  return (
    <>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#080812', opacity: booted ? 1 : 0, transition: 'opacity 0.5s' }}>
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <div className="relative flex-1 flex flex-col" style={{ minWidth: 0 }}>
            <div className="flex-1 relative overflow-hidden">
              <OfficeMap />
            </div>
            <MissionInput />
          </div>
          <div style={{ width: 380, flexShrink: 0, borderLeft: '2px solid #1a1a3a' }}>
            <RightPanel />
          </div>
        </div>
      </div>
    </>
  )
}
