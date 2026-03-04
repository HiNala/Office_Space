'use client'
import { TopBar } from '@/components/controls/TopBar'
import { OfficeMap } from '@/components/office/OfficeMap'
import { RightPanel } from '@/components/panels/RightPanel'
import { MissionInput } from '@/components/controls/MissionInput'
import { GithubInput } from '@/components/controls/GithubInput'

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#080812' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Office game world */}
        <div className="relative flex-1 flex flex-col" style={{ minWidth: 0 }}>
          <div className="flex-1 relative overflow-hidden">
            <OfficeMap />
          </div>
          <GithubInput />
          <MissionInput />
        </div>

        {/* Right panel — fixed 380px */}
        <div style={{ width: 380, flexShrink: 0, borderLeft: '2px solid #1a1a3a' }}>
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
