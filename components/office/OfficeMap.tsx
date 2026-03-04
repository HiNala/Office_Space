'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useAgentStore } from '@/store/useAgentStore'
import { AgentSprite } from './AgentSprite'
import { AgentCard } from '@/components/agents/AgentCard'
import { Agent, AgentId } from '@/types'

const MAP_W = 720
const MAP_H = 560

// ─── MASTER COLOR PALETTE ──────────────────────────────────────────────────
const C = {
  floorA1: '#c8a96e', floorA2: '#b89458',
  floorB1: '#2d3d5e', floorB2: '#253450',
  floorC1: '#d2cfc8', floorC2: '#c4c1ba',
  wallDark: '#1e1e38', wallMid: '#28283e', wallPanel: '#343450',
  wallTrim: '#4a4a6a', wallBase: '#3a3a58',
  deskTop: '#8a6030', deskFace: '#6a4018', deskShadow: '#3a2008', deskHi: '#aa7838',
  shelfWood: '#7a4a18', shelfDark: '#5a3010',
  tableTop: '#6a3818', tableFace: '#4a2808',
  chairDark: '#2a1e3a', chairMid: '#3a2e4a',
  sofaRed: '#b85050', sofaRedHi: '#cc6666', sofaRedSh: '#883838',
  metalGrey: '#888899', metalDark: '#666677',
  cabinetFace: '#9999aa', cabinetDark: '#777788',
  glassBlue: '#4a8fd4', glassDark: '#2a5a8a', glassHi: '#7ab8f0',
  screenGreen: '#00ff44',
  plantGreen: '#44aa44', plantDark: '#2a6a2a', plantHi: '#66cc66',
  potTerra: '#cc8844', potDark: '#aa6622',
  appliWhite: '#e8e8f0', appliGrey: '#ccccdc', appliDark: '#aaaabc',
  chromeSilver: '#aaaacc', chromeHi: '#ddddee', chromeDark: '#6a6a88',
  rexBlue: '#4a8fff', novaViolet: '#b44aff', sageGreen: '#4aff8f',
  byteRed: '#ff4a4a', floraPink: '#ff8fcc',
  panelBg: '#0d0d1a',
}

// ─── PIXEL PRIMITIVES ──────────────────────────────────────────────────────
interface PixProps {
  x: number; y: number; w: number; h: number
  color: string; style?: React.CSSProperties; children?: React.ReactNode
}
const Pix = ({ x, y, w, h, color, style = {}, children }: PixProps) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h,
    background: color, imageRendering: 'pixelated', ...style,
  }}>{children}</div>
)

// ─── BOOKSHELF ──────────────────────────────────────────────────────────────
function BookShelf({ x, y, w = 96, shelves = 4 }: { x: number; y: number; w?: number; shelves?: number }) {
  const shelfH = 22
  const bookColors = [
    '#cc4444','#4488cc','#44cc88','#cccc44','#cc88cc',
    '#888844','#cc6644','#44cccc','#cc4488','#88cc44',
    '#5566dd','#dd8855','#55dd88','#8855dd','#dd5566',
  ]
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: shelves * shelfH + 8, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={w} h={shelves * shelfH + 8} color={C.shelfWood} />
      <Pix x={0} y={0} w={2} h={shelves * shelfH + 8} color={C.shelfDark} />
      <Pix x={w - 2} y={0} w={2} h={shelves * shelfH + 8} color={C.shelfDark} />
      {[...Array(shelves)].map((_, si) => {
        const sy = 4 + si * shelfH
        const slice = bookColors.slice((si * 5) % bookColors.length, (si * 5) % bookColors.length + 8)
        return (
          <div key={si}>
            <Pix x={2} y={sy + shelfH - 3} w={w - 4} h={3} color={C.shelfDark} />
            <Pix x={2} y={sy + shelfH - 4} w={w - 4} h={1} color={C.shelfWood} />
            {slice.map((bc, bi) => {
              const bw = 6 + (bi % 3) * 2
              const bh = 12 + (bi % 4) * 2
              const bx = 4 + slice.slice(0, bi).reduce((a, _, i) => a + 6 + (i % 3) * 2 + 1, 0)
              return bx + bw < w - 4 ? (
                <div key={bi}>
                  <Pix x={bx} y={sy + shelfH - 4 - bh} w={bw} h={bh} color={bc} />
                  <Pix x={bx} y={sy + shelfH - 4 - bh} w={2} h={bh} color={bc + '88'} />
                  <Pix x={bx} y={sy + shelfH - 4 - bh} w={bw} h={1} color={C.appliWhite + '44'} />
                </div>
              ) : null
            })}
          </div>
        )
      })}
    </div>
  )
}

// ─── DESK ──────────────────────────────────────────────────────────────────
function Desk({ x, y, w = 72, agentColor = C.rexBlue }: { x: number; y: number; w?: number; agentColor?: string }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={4} y={36} w={w + 4} h={8} color="rgba(0,0,0,0.25)" />
      <Pix x={0} y={0} w={w} h={28} color={C.deskTop} />
      <Pix x={0} y={0} w={w} h={1} color={C.deskHi} />
      <Pix x={0} y={0} w={1} h={28} color={C.deskHi} />
      <Pix x={w - 1} y={0} w={1} h={28} color={C.deskShadow} />
      {/* Monitor */}
      <Pix x={10} y={4} w={28} h={18} color="#1a1a2a" />
      <Pix x={10} y={4} w={28} h={1} color={agentColor} style={{ opacity: 0.8 }} />
      <Pix x={10} y={4} w={1} h={18} color={agentColor} style={{ opacity: 0.4 }} />
      <Pix x={12} y={6} w={24} h={14} color="#0a0a18" style={{ boxShadow: `0 0 6px ${agentColor}44` }} />
      <Pix x={13} y={7} w={4} h={2} color={agentColor} style={{ opacity: 0.6 }} />
      <Pix x={13} y={10} w={6} h={1} color={agentColor} style={{ opacity: 0.3 }} />
      <Pix x={13} y={12} w={5} h={1} color={agentColor} style={{ opacity: 0.3 }} />
      {/* Monitor stand */}
      <Pix x={22} y={22} w={4} h={4} color={C.metalDark} />
      <Pix x={18} y={26} w={12} h={2} color={C.metalDark} />
      {/* Keyboard */}
      <Pix x={32} y={18} w={22} h={8} color="#1e1e30" />
      <Pix x={32} y={18} w={22} h={1} color="#2e2e40" />
      {[0, 1, 2].map(row => [0, 1, 2, 3, 4].map(col => (
        <Pix key={`${row}-${col}`} x={34 + col * 4} y={20 + row * 2} w={3} h={1} color="#2a2a3c" />
      )))}
      {/* Desk front face */}
      <Pix x={0} y={28} w={w} h={8} color={C.deskFace} />
      <Pix x={0} y={36} w={w} h={2} color={C.deskShadow} />
      <Pix x={w - 18} y={30} w={10} h={4} color={C.deskShadow} />
      <Pix x={w - 17} y={31} w={8} h={2} color={C.metalDark} />
    </div>
  )
}

// ─── CHAIR ─────────────────────────────────────────────────────────────────
function Chair({ x, y, color = C.chairDark, hi = C.chairMid }: { x: number; y: number; color?: string; hi?: string }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={28} h={14} color={color} />
      <Pix x={0} y={0} w={28} h={1} color={hi} />
      <Pix x={0} y={0} w={1} h={14} color={hi} />
      <Pix x={6} y={2} w={16} h={10} color={hi} />
      <Pix x={0} y={14} w={6} h={4} color={color} />
      <Pix x={22} y={14} w={6} h={4} color={color} />
      <Pix x={2} y={16} w={2} h={2} color="#0a0a12" />
      <Pix x={24} y={16} w={2} h={2} color="#0a0a12" />
    </div>
  )
}

// ─── PLANT ─────────────────────────────────────────────────────────────────
interface PlantProps { x: number; y: number; size?: 'sm' | 'med' | 'lg'; variant?: number }
function Plant({ x, y, size = 'med', variant = 0 }: PlantProps) {
  const configs = { sm: { pw: 10, ph: 8, gw: 10, gh: 10 }, med: { pw: 14, ph: 10, gw: 16, gh: 16 }, lg: { pw: 18, ph: 14, gw: 24, gh: 28 } }
  const cfg = configs[size] || configs.med
  const lc = [
    [C.plantGreen, C.plantDark, C.plantHi],
    ['#3aaa5a', '#1a6a3a', '#5acc7a'],
    ['#4a9a44', '#2a6a24', '#6acc64'],
  ][variant % 3]
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={(cfg.gw - cfg.pw) / 2} y={cfg.gh - cfg.ph + 4} w={cfg.pw} h={cfg.ph - 4} color={C.potTerra} />
      <Pix x={(cfg.gw - cfg.pw) / 2} y={cfg.gh - cfg.ph} w={cfg.pw} h={4} color={C.potDark} />
      <Pix x={(cfg.gw - cfg.pw) / 2} y={cfg.gh - cfg.ph} w={cfg.pw} h={1} color={C.potTerra} />
      <Pix x={(cfg.gw - cfg.pw) / 2 + 1} y={cfg.gh - cfg.ph + 1} w={cfg.pw - 2} h={2} color="#3a2010" />
      {size === 'lg' ? (
        <>
          <Pix x={2} y={4} w={8} h={12} color={lc[0]} style={{ borderRadius: '4px 8px 2px 6px' }} />
          <Pix x={cfg.gw - 10} y={2} w={8} h={14} color={lc[0]} style={{ borderRadius: '8px 4px 6px 2px' }} />
          <Pix x={6} y={0} w={10} h={16} color={lc[1]} style={{ borderRadius: '6px 6px 4px 4px' }} />
          <Pix x={4} y={8} w={16} h={8} color={lc[1]} style={{ borderRadius: '2px' }} />
          <Pix x={8} y={2} w={6} h={10} color={lc[2]} />
        </>
      ) : size === 'med' ? (
        <>
          <Pix x={1} y={4} w={6} h={8} color={lc[1]} style={{ borderRadius: '4px 2px 2px 4px' }} />
          <Pix x={cfg.gw - 7} y={3} w={6} h={9} color={lc[1]} style={{ borderRadius: '2px 4px 4px 2px' }} />
          <Pix x={4} y={0} w={8} h={12} color={lc[0]} style={{ borderRadius: '6px' }} />
          <Pix x={5} y={2} w={4} h={4} color={lc[2]} />
        </>
      ) : (
        <>
          <Pix x={1} y={2} w={4} h={6} color={lc[1]} style={{ borderRadius: '3px' }} />
          <Pix x={cfg.gw - 5} y={2} w={4} h={6} color={lc[1]} style={{ borderRadius: '3px' }} />
          <Pix x={3} y={0} w={4} h={7} color={lc[0]} style={{ borderRadius: '4px' }} />
        </>
      )}
    </div>
  )
}

// ─── PENDANT LIGHT ─────────────────────────────────────────────────────────
function PendantLight({ x, y, cordH = 28 }: { x: number; y: number; cordH?: number }) {
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: 0, imageRendering: 'pixelated', zIndex: 2 }}>
        <Pix x={7} y={0} w={2} h={cordH} color="#44446a" />
        <Pix x={2} y={cordH} w={12} h={6} color="#ccccaa" style={{ clipPath: 'polygon(20% 0,80% 0,100% 100%,0 100%)' }} />
        <Pix x={5} y={cordH + 6} w={6} h={6} color="#fff8c0" style={{ boxShadow: '0 0 10px #fff8c0' }} />
        <Pix x={3} y={cordH + 3} w={10} h={3} color="#eeee88" style={{ boxShadow: '0 0 6px #eeee8888' }} />
      </div>
      <div style={{
        position: 'absolute', left: x - 32, top: y,
        width: 80, height: 40,
        background: 'radial-gradient(ellipse,rgba(255,240,180,0.09) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
    </>
  )
}

// ─── WHITEBOARD ────────────────────────────────────────────────────────────
function Whiteboard({ x, y, w = 100, h = 60 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={w} h={h} color="#3a3a5a" />
      <Pix x={3} y={3} w={w - 6} h={h - 6} color="#e8e8ee" />
      <Pix x={10} y={8} w={20} h={2} color="#cc4444" style={{ opacity: 0.7 }} />
      <Pix x={10} y={12} w={16} h={2} color="#4444cc" style={{ opacity: 0.7 }} />
      <Pix x={8} y={16} w={8} h={8} color="none" style={{ border: '2px solid #44aa44', opacity: 0.7 }} />
      <Pix x={22} y={16} w={8} h={8} color="none" style={{ border: '2px solid #44aa44', opacity: 0.7 }} />
      <Pix x={30} y={20} w={8} h={2} color="#44aa44" style={{ opacity: 0.7 }} />
      <Pix x={40} y={16} w={8} h={8} color="none" style={{ border: '2px solid #44aa44', opacity: 0.7 }} />
      <Pix x={18} y={20} w={4} h={2} color="#44aa44" style={{ opacity: 0.7 }} />
      <Pix x={3} y={h - 8} w={w - 6} h={5} color="#cccccc" />
      {['#cc4444', '#4444cc', '#44aa44', '#cccc44', '#cc44cc'].map((mc, i) => (
        <Pix key={i} x={8 + i * 12} y={h - 7} w={4} h={3} color={mc} />
      ))}
    </div>
  )
}

// ─── CONFERENCE TABLE ──────────────────────────────────────────────────────
function ConferenceTable({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={4} y={68} w={156} h={10} color="rgba(0,0,0,0.3)" />
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 160, height: 70,
        background: C.tableTop, borderRadius: '50%',
        outline: `2px solid ${C.tableFace}`,
        boxShadow: `inset 0 2px 0 ${C.shelfWood}44`,
      }} />
      <div style={{
        position: 'absolute', left: 30, top: 15, width: 100, height: 40,
        border: `1px solid ${C.tableFace}`, borderRadius: '50%', background: 'transparent',
      }} />
      <Pix x={64} y={28} w={32} h={12} color={C.metalGrey} style={{ borderRadius: '50%', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
      <Pix x={76} y={32} w={8} h={4} color={C.metalDark} style={{ borderRadius: '50%' }} />
      <Pix x={80} y={42} w={2} h={10} color={C.metalDark} />
      <div style={{ position: 'absolute', left: 10, top: 68, width: 140, height: 8, background: C.tableFace, borderRadius: '0 0 4px 4px' }} />
    </div>
  )
}

// ─── SOFA ──────────────────────────────────────────────────────────────────
function Sofa({ x, y, w = 80, orientation = 'h' }: { x: number; y: number; w?: number; orientation?: 'h' | 'v' }) {
  const isH = orientation === 'h'
  const sw = isH ? w : 22
  const sh = isH ? 22 : w
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={sw} h={sh} color={C.sofaRed} />
      <Pix x={0} y={0} w={sw} h={1} color={C.sofaRedHi} />
      <Pix x={0} y={0} w={1} h={sh} color={C.sofaRedHi} />
      {isH ? (
        <>
          <Pix x={4} y={4} w={(sw / 2) - 8} h={sh - 10} color={C.sofaRedHi} style={{ borderRadius: '2px' }} />
          <Pix x={sw / 2 + 4} y={4} w={(sw / 2) - 8} h={sh - 10} color={C.sofaRedHi} style={{ borderRadius: '2px' }} />
          <Pix x={0} y={sh - 6} w={sw} h={6} color={C.sofaRedSh} />
        </>
      ) : (
        <>
          <Pix x={4} y={4} w={sw - 10} h={(sh / 2) - 8} color={C.sofaRedHi} style={{ borderRadius: '2px' }} />
          <Pix x={4} y={sh / 2 + 4} w={sw - 10} h={(sh / 2) - 8} color={C.sofaRedHi} style={{ borderRadius: '2px' }} />
          <Pix x={sw - 6} y={0} w={6} h={sh} color={C.sofaRedSh} />
        </>
      )}
    </div>
  )
}

// ─── COFFEE TABLE ──────────────────────────────────────────────────────────
function CoffeeTable({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={4} w={56} h={26} color={C.deskTop} />
      <Pix x={0} y={4} w={56} h={1} color={C.deskHi} />
      <Pix x={4} y={8} w={18} h={10} color="#dd5544" />
      <Pix x={5} y={9} w={16} h={1} color="#eeeeee" style={{ opacity: 0.5 }} />
      <Pix x={6} y={10} w={12} h={1} color="#eeeeee" style={{ opacity: 0.4 }} />
      <Pix x={4} y={18} w={18} h={2} color="#884433" />
      <div style={{ position: 'absolute', left: 28, top: 10, width: 10, height: 10, border: '1px solid rgba(100,60,20,0.3)', borderRadius: '50%' }} />
      <Plant x={38} y={0} size="sm" variant={1} />
      <Pix x={2} y={28} w={4} h={4} color={C.deskFace} />
      <Pix x={50} y={28} w={4} h={4} color={C.deskFace} />
    </div>
  )
}

// ─── FLOOR LAMP ────────────────────────────────────────────────────────────
function FloorLamp({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={5} y={0} w={3} h={40} color={C.metalGrey} />
      <Pix x={5} y={0} w={1} h={40} color={C.chromeHi} />
      <Pix x={0} y={4} w={14} h={6} color="#ddddaa" style={{ clipPath: 'polygon(15% 0,85% 0,100% 100%,0 100%)' }} />
      <Pix x={3} y={10} w={8} h={4} color="#e8e890" style={{ boxShadow: '0 0 8px #e8e87088' }} />
      <Pix x={2} y={38} w={10} h={4} color={C.metalDark} style={{ borderRadius: '2px' }} />
    </div>
  )
}

// ─── WALL PAINTING ─────────────────────────────────────────────────────────
function WallPainting({ x, y, w = 56, h = 36 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={w} h={h} color="#3a2808" />
      <Pix x={4} y={4} w={w - 8} h={h - 8} color="#eeeeee" />
      <Pix x={8} y={8} w={w - 16} h={h - 16} color={C.glassBlue} />
      <Pix x={8} y={8} w={w - 16} h={Math.floor((h - 16) * 0.6)} color={C.glassBlue} />
      <Pix x={12} y={12} w={8} h={3} color="rgba(255,255,255,0.5)" style={{ borderRadius: '4px' }} />
      <Pix x={28} y={10} w={12} h={4} color="rgba(255,255,255,0.4)" style={{ borderRadius: '4px' }} />
      <Pix x={8} y={Math.floor(8 + (h - 16) * 0.55)} w={w - 16} h={Math.floor((h - 16) * 0.25)} color="#44aa44" style={{ borderRadius: '50% 50% 0 0' }} />
      <Pix x={8} y={Math.floor(8 + (h - 16) * 0.75)} w={w - 16} h={Math.floor((h - 16) * 0.25)} color="#55aa55" />
      <Pix x={w - 20} y={10} w={6} h={6} color="#ffcc44" style={{ borderRadius: '50%', boxShadow: '0 0 4px #ffcc44' }} />
    </div>
  )
}

// ─── SNACK CABINET ─────────────────────────────────────────────────────────
function SnackCabinet({ x, y }: { x: number; y: number }) {
  const snacks = [['#cc4444','#44cc88','#cccc44'],['#cc8844','#44cccc','#cc44cc'],['#4488cc','#cc4488','#88cc44']]
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={32} h={56} color={C.appliGrey} />
      <Pix x={0} y={0} w={2} h={56} color={C.chromeHi} />
      <Pix x={30} y={0} w={2} h={56} color={C.appliDark} />
      <Pix x={4} y={4} w={20} h={40} color="#1a2a3a" style={{ opacity: 0.85 }} />
      {snacks.map((row, ri) => (
        <div key={ri}>
          <Pix x={4} y={12 + ri * 14} w={20} h={1} color="#334455" />
          {row.map((sc, ci) => (
            <div key={ci}>
              <Pix x={5 + ci * 6} y={4 + ri * 14} w={5} h={8} color={sc} style={{ opacity: 0.9 }} />
              <Pix x={5 + ci * 6} y={4 + ri * 14} w={5} h={1} color="#ffffff44" />
            </div>
          ))}
        </div>
      ))}
      <Pix x={4} y={44} w={20} h={10} color={C.appliDark} />
      <Pix x={6} y={46} w={6} h={4} color="#1a2a1a" style={{ boxShadow: `0 0 3px ${C.screenGreen}88` }} />
      {[0, 1].map(i => <Pix key={i} x={16 + i * 4} y={47} w={3} h={2} color={i === 0 ? '#44ff44' : '#ff4444'} />)}
    </div>
  )
}

// ─── WALL CLOCK (animated) ─────────────────────────────────────────────────
function WallClock({ x, y }: { x: number; y: number }) {
  const [secondAngle, setSecondAngle] = useState(() => {
    const now = new Date()
    return now.getSeconds() * 6
  })
  useEffect(() => {
    const t = setInterval(() => setSecondAngle(a => (a + 6) % 360), 1000)
    return () => clearInterval(t)
  }, [])
  const now = new Date()
  const hourAngle = now.getHours() * 30 + now.getMinutes() * 0.5
  const minuteAngle = now.getMinutes() * 6
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <div style={{ width: 22, height: 22, background: '#1a1a2e', borderRadius: '50%', border: '2px solid #3a3a5a', position: 'relative' }}>
        {[0, 3, 6, 9].map(m => {
          const a = m * 30 * (Math.PI / 180)
          return <div key={m} style={{ position: 'absolute', left: 11 + Math.sin(a) * 7, top: 11 - Math.cos(a) * 7, width: 2, height: 2, background: '#666688', transform: 'translate(-50%,-50%)' }} />
        })}
        <div style={{ position: 'absolute', left: 11, top: 11, width: 1, height: 6, background: '#ccccee', transformOrigin: 'bottom center', transform: `rotate(${hourAngle}deg)`, marginLeft: 0, marginTop: -6 }} />
        <div style={{ position: 'absolute', left: 11, top: 11, width: 1, height: 8, background: '#8888cc', transformOrigin: 'bottom center', transform: `rotate(${minuteAngle}deg)`, marginLeft: 0, marginTop: -8 }} />
        <div style={{ position: 'absolute', left: 11, top: 11, width: 1, height: 9, background: '#ff4a4a', transformOrigin: 'bottom center', transform: `rotate(${secondAngle}deg)`, marginLeft: 0, marginTop: -9 }} />
        <div style={{ position: 'absolute', left: 10, top: 10, width: 2, height: 2, background: '#ffffff', borderRadius: '50%' }} />
      </div>
    </div>
  )
}

// ─── KITCHEN COUNTER ───────────────────────────────────────────────────────
function KitchenCounter({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={192} h={16} color="#d8d8e4" />
      <Pix x={0} y={0} w={192} h={2} color="#eeeeee" />
      <Pix x={0} y={16} w={192} h={6} color="#aaaabc" />
      {[...Array(8)].map((_, i) => [0, 1, 2].map(ri => (
        <div key={`${i}-${ri}`}>
          <Pix x={i * 24} y={-ri * 10 - 10} w={22} h={8} color={ri === 1 ? '#a8c8d8' : '#b8d8e8'} />
          <Pix x={i * 24} y={-ri * 10 - 10} w={22} h={1} color="#c8e8f0" />
        </div>
      )))}
      {/* Coffee machine */}
      <Pix x={8} y={-24} w={22} h={22} color="#1a1a2a" />
      <Pix x={8} y={-24} w={22} h={2} color="#2a2a3a" />
      <Pix x={10} y={-18} w={6} h={8} color="rgba(100,160,220,0.4)" />
      <Pix x={10} y={-8} w={18} h={4} color="#cc8844" />
      <Pix x={26} y={-22} w={3} h={2} color="#ff3333" style={{ boxShadow: '0 0 3px #ff3333' }} />
      {/* Microwave */}
      <Pix x={38} y={-22} w={32} h={20} color={C.appliWhite} />
      <Pix x={38} y={-22} w={32} h={2} color={C.chromeHi} />
      <Pix x={40} y={-20} w={20} h={14} color="#1a2a1a" style={{ opacity: 0.85 }} />
      <Pix x={62} y={-20} w={6} h={4} color="#1a2a1a" />
      <Pix x={62} y={-15} w={6} h={1} color="#44cc44" style={{ boxShadow: '0 0 3px #44cc44' }} />
      {/* Sink */}
      <Pix x={80} y={-2} w={32} h={14} color="#aaaaaa" />
      <Pix x={82} y={0} w={28} h={10} color="#888888" />
      <Pix x={94} y={-12} w={6} h={12} color={C.metalGrey} />
      <Pix x={96} y={-14} w={4} h={4} color={C.chromeHi} style={{ borderRadius: '50% 50% 0 0' }} />
      {/* Toaster */}
      <Pix x={122} y={-14} w={20} h={12} color={C.chromeSilver} />
      <Pix x={122} y={-14} w={20} h={2} color={C.chromeHi} />
      <Pix x={126} y={-14} w={4} h={2} color="#1a1a1a" />
      <Pix x={134} y={-14} w={4} h={2} color="#1a1a1a" />
      {/* Bar stools */}
      {[0, 1, 2].map(i => (
        <div key={i}>
          <Pix x={160 + i * 14} y={6} w={10} h={8} color={C.deskTop} style={{ borderRadius: '50%' }} />
          <Pix x={162 + i * 14} y={14} w={6} h={10} color={C.metalDark} />
          <Pix x={160 + i * 14} y={24} w={10} h={2} color={C.metalDark} />
        </div>
      ))}
    </div>
  )
}

// ─── FRIDGE ─────────────────────────────────────────────────────────────────
function Fridge({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={30} h={52} color={C.appliWhite} />
      <Pix x={0} y={0} w={2} h={52} color={C.chromeHi} />
      <Pix x={28} y={0} w={2} h={52} color={C.appliDark} />
      <Pix x={0} y={14} w={30} h={2} color={C.appliGrey} />
      <Pix x={2} y={2} w={26} h={10} color={C.appliGrey} />
      <Pix x={2} y={16} w={26} h={34} color={C.appliGrey} />
      <Pix x={24} y={6} w={3} h={6} color={C.chromeSilver} />
      <Pix x={24} y={22} w={3} h={12} color={C.chromeSilver} />
      {[{x:6,y:18,c:'#cc4444'},{x:12,y:20,c:'#4488cc'},{x:8,y:28,c:'#44aa44'},{x:16,y:26,c:'#cccc44'}].map((m, i) => (
        <Pix key={i} x={m.x} y={m.y} w={4} h={4} color={m.c} />
      ))}
      <Pix x={4} y={36} w={20} h={8} color="#eeeecc" />
      <Pix x={5} y={37} w={18} h={1} color="#cc4444" />
      <Pix x={5} y={39} w={12} h={1} color="#1a1a1a" style={{ opacity: 0.5 }} />
      <Pix x={5} y={41} w={10} h={1} color="#1a1a1a" style={{ opacity: 0.5 }} />
    </div>
  )
}

// ─── FILING CABINET ────────────────────────────────────────────────────────
function FilingCabinet({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={26} h={44} color={C.cabinetFace} />
      <Pix x={0} y={0} w={2} h={44} color={C.chromeHi} />
      <Pix x={24} y={0} w={2} h={44} color={C.metalDark} />
      {[0, 1, 2].map(i => (
        <div key={i}>
          <Pix x={2} y={2 + i * 14} w={22} h={12} color={C.cabinetDark} />
          <Pix x={2} y={2 + i * 14} w={22} h={1} color={C.metalDark} />
          <Pix x={8} y={7 + i * 14} w={12} h={3} color={C.chromeSilver} />
          <Pix x={4} y={4 + i * 14} w={8} h={4} color="#eeeeee" />
          <Pix x={5} y={5 + i * 14} w={6} h={1} color="#888888" style={{ opacity: 0.5 }} />
        </div>
      ))}
      <Pix x={2} y={44} w={22} h={2} color={C.metalDark} />
    </div>
  )
}

// ─── WATER COOLER (animated bubble) ──────────────────────────────────────
function WaterCooler({ x, y }: { x: number; y: number }) {
  const [bubbleY, setBubbleY] = useState(8)
  useEffect(() => {
    const t = setInterval(() => setBubbleY(v => v > 2 ? v - 1 : 8), 180)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={5} y={0} w={14} h={18} color="rgba(100,180,240,0.35)" style={{ border: '2px solid #4488cc' }} />
      <Pix x={10} y={bubbleY} w={2} h={2} color="rgba(255,255,255,0.5)" style={{ borderRadius: '50%' }} />
      <Pix x={6} y={2} w={2} h={2} color="#2a5a9a" />
      <Pix x={2} y={18} w={20} h={24} color={C.appliWhite} />
      <Pix x={2} y={18} w={2} h={24} color={C.chromeHi} />
      <Pix x={20} y={18} w={2} h={24} color={C.appliDark} />
      <Pix x={4} y={20} w={16} h={14} color={C.appliGrey} />
      <Pix x={6} y={34} w={5} h={4} color="#4a8fd4" />
      <Pix x={13} y={34} w={5} h={4} color="#ff4444" />
      <Pix x={4} y={40} w={16} h={2} color={C.appliDark} />
      <Pix x={3} y={42} w={18} h={2} color={C.appliGrey} />
      <Pix x={4} y={44} w={4} h={4} color={C.metalDark} />
      <Pix x={16} y={44} w={4} h={4} color={C.metalDark} />
    </div>
  )
}

// ─── PRINTER (animated paper) ──────────────────────────────────────────────
function Printer({ x, y }: { x: number; y: number }) {
  const [printing, setPrinting] = useState(false)
  const [paperW, setPaperW] = useState(0)
  useEffect(() => {
    const t = setInterval(() => {
      setPrinting(true)
      setPaperW(0)
      let w = 0
      const grow = setInterval(() => {
        w = Math.min(w + 2, 28)
        setPaperW(w)
        if (w >= 28) { clearInterval(grow); setTimeout(() => { setPrinting(false); setPaperW(0) }, 2000) }
      }, 100)
    }, 15000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={48} h={22} color={C.appliGrey} />
      <Pix x={0} y={0} w={48} h={2} color={C.chromeHi} />
      <Pix x={6} y={4} w={8} h={4} color="#1a2a1a" style={{ boxShadow: `0 0 4px ${C.screenGreen}66` }} />
      {[0, 1, 2, 3, 4].map(i => (
        <Pix key={i} x={26 + i * 4} y={5} w={3} h={3} color={i === 0 ? C.screenGreen : i === 1 ? '#cccc44' : C.appliDark} />
      ))}
      <Pix x={4} y={22} w={40} h={4} color={C.appliDark} />
      {printing && <Pix x={10} y={22} w={paperW} h={3} color="#eeeeee" style={{ transition: 'width 0.1s' }} />}
      <Pix x={0} y={26} w={48} h={6} color={C.appliWhite} />
      <Pix x={8} y={27} w={32} h={4} color="#eeeeee" />
    </div>
  )
}

// ─── FIRE EXTINGUISHER ─────────────────────────────────────────────────────
function FireExtinguisher({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={2} y={0} w={10} h={2} color={C.metalGrey} />
      <Pix x={4} y={2} w={6} h={24} color="#cc2222" />
      <Pix x={4} y={2} w={6} h={2} color="#ee4444" />
      <Pix x={5} y={8} w={4} h={8} color="#aa1111" />
      <Pix x={5} y={4} w={4} h={2} color="#ffffff" style={{ opacity: 0.2 }} />
      <Pix x={3} y={26} w={8} h={3} color={C.metalDark} style={{ borderRadius: '2px' }} />
    </div>
  )
}

// ─── BLINKING LIGHT (BYTE's desk) ──────────────────────────────────────────
function BlinkingLight({ x, y }: { x: number; y: number }) {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 1200)
    return () => clearInterval(t)
  }, [])
  return (
    <Pix x={x} y={y} w={6} h={6}
      color={on ? '#ff2222' : '#440000'}
      style={{ borderRadius: '50%', boxShadow: on ? '0 0 6px #ff2222' : 'none', transition: 'background 0.1s, box-shadow 0.1s' }}
    />
  )
}

// ─── NORTH WALL ────────────────────────────────────────────────────────────
function NorthWall({ mapW }: { mapW: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: mapW, height: 48, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={mapW} h={6} color={C.wallDark} />
      <Pix x={0} y={6} w={mapW} h={26} color={C.wallMid} />
      <Pix x={0} y={28} w={mapW} h={2} color={C.wallTrim} />
      <Pix x={0} y={30} w={mapW} h={12} color={C.wallPanel} />
      <Pix x={0} y={42} w={mapW} h={4} color={C.wallBase} />
      <Pix x={0} y={46} w={mapW} h={2} color={C.wallDark} />
      {[48, 148, 280].map((wx, i) => (
        <div key={i}>
          <Pix x={wx} y={8} w={40} h={28} color="#3a3a5a" />
          <Pix x={wx + 2} y={10} w={36} h={24} color={C.glassBlue} style={{ opacity: 0.7 }} />
          <Pix x={wx + 2} y={10} w={36} h={2} color={C.glassHi} style={{ opacity: 0.4 }} />
          <Pix x={wx + 20} y={10} w={2} h={24} color="#3a3a5a" />
          <Pix x={wx + 2} y={22} w={36} h={2} color="#3a3a5a" />
          {i === 0 && [...Array(8)].map((_, bi) => (
            <Pix key={bi} x={wx + 2} y={10 + bi * 3} w={36} h={1} color="#223344" style={{ opacity: 0.5 }} />
          ))}
          <Pix x={wx - 2} y={34} w={44} h={4} color={C.wallPanel} />
        </div>
      ))}
    </div>
  )
}

// ─── ROOM DIVIDER ──────────────────────────────────────────────────────────
function RoomDivider({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, imageRendering: 'pixelated' }}>
      <Pix x={0} y={0} w={6} h={h} color={C.wallDark} />
      <Pix x={6} y={0} w={4} h={h} color={C.wallMid} />
      <Pix x={10} y={0} w={20} h={h} color="rgba(200,220,255,0.06)"
        style={{ borderLeft: '1px solid rgba(200,220,255,0.15)', borderRight: '1px solid rgba(100,140,200,0.08)' }} />
      <Pix x={10} y={Math.floor(h / 3)} w={20} h={2} color="rgba(200,220,255,0.12)" />
      <Pix x={10} y={Math.floor(h * 2 / 3)} w={20} h={2} color="rgba(200,220,255,0.12)" />
    </div>
  )
}

// ─── MAIN OFFICE MAP ───────────────────────────────────────────────────────
export function OfficeMap() {
  const { agents, isConferenceMode, screenFlash } = useAgentStore()
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) {
        setScale(Math.min(width / MAP_W, height / MAP_H))
      }
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleAgentClick = useCallback((agentId: AgentId) => {
    setSelectedAgent(prev => prev === agentId ? null : agentId)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: C.panelBg }}>
      {/* Scaled map canvas */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: MAP_W,
        height: MAP_H,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        imageRendering: 'pixelated',
      }}>

        {/* ── ZONE A FLOOR — warm tan checkerboard ── */}
        <div style={{
          position: 'absolute', left: 0, top: 48, width: 400, height: 512,
          backgroundImage: `repeating-conic-gradient(${C.floorA2} 0% 25%, ${C.floorA1} 0% 50%)`,
          backgroundSize: '48px 48px',
        }} />

        {/* ── ZONE B FLOOR — blue-grey carpet ── */}
        <div style={{
          position: 'absolute', left: 400, top: 48, width: 320, height: 330,
          backgroundColor: C.floorB1,
          backgroundImage: `radial-gradient(circle, ${C.floorB2} 1px, transparent 1px), radial-gradient(circle, ${C.floorB1} 1px, transparent 1px)`,
          backgroundSize: '16px 16px, 16px 16px',
          backgroundPosition: '0 0, 8px 8px',
        }} />

        {/* ── ZONE C FLOOR — kitchen tile ── */}
        <div style={{
          position: 'absolute', left: 400, top: 378, width: 320, height: 182,
          backgroundImage: `repeating-conic-gradient(${C.floorC2} 0% 25%, ${C.floorC1} 0% 50%)`,
          backgroundSize: '32px 32px',
        }} />

        {/* Floor transition strips */}
        <Pix x={398} y={48} w={4} h={512} color="#7a6a4a" style={{ zIndex: 1 }} />
        <Pix x={400} y={376} w={320} h={4} color="#8a8880" style={{ zIndex: 1 }} />

        {/* ── NORTH WALL ── */}
        <NorthWall mapW={MAP_W} />

        {/* Wall clock */}
        <WallClock x={340} y={12} />

        {/* ── CEILING PENDANT LIGHTS ── */}
        {[80, 200, 310, 480, 600].map((lx, i) => (
          <PendantLight key={i} x={lx} y={110} cordH={22} />
        ))}

        {/* ── ZONE DIVIDER (A/B) ── */}
        <RoomDivider x={396} y={48} h={320} />

        {/* ── NORTH WALL ITEMS ── */}
        <Whiteboard x={10} y={8} w={90} h={38} />
        <BookShelf x={440} y={52} w={96} shelves={3} />
        <BookShelf x={570} y={52} w={96} shelves={3} />

        {/* ── ZONE A — WORK AREA ── */}

        {/* REX DESK — top left */}
        <Desk x={18} y={80} w={74} agentColor={C.rexBlue} />
        <Chair x={22} y={126} color={C.chairDark} />
        <Plant x={90} y={82} size="sm" variant={0} />
        {/* Blueprint tube */}
        <Pix x={24} y={84} w={4} h={10} color="#4a8fff" style={{ opacity: 0.7 }} />
        <Pix x={26} y={82} w={8} h={4} color="#aacc88" />
        {/* Ruler */}
        <Pix x={56} y={92} w={24} h={2} color={C.chromeSilver} />

        {/* NOVA DESK — top right of Zone A */}
        <Desk x={210} y={80} w={80} agentColor={C.novaViolet} />
        <Chair x={214} y={126} color={C.chairDark} />
        {/* Nova: extra monitor glow */}
        <Pix x={254} y={84} w={32} h={20} color="#1a0a2a" style={{ border: `2px solid ${C.novaViolet}44`, boxShadow: `0 0 8px ${C.novaViolet}33` }} />
        {/* Sticky note wall above Nova */}
        {[
          {x:216,y:60,c:'#ffff88',r:-2},{x:228,y:58,c:'#88ffcc',r:2},
          {x:240,y:62,c:'#ff88cc',r:-1},{x:252,y:59,c:'#88ccff',r:3},
          {x:264,y:61,c:'#ffcc88',r:-2},{x:276,y:60,c:'#ff88ff',r:1},
          {x:222,y:70,c:'#ccff88',r:2},{x:246,y:68,c:'#ffaaaa',r:-3},
          {x:262,y:71,c:'#aaffff',r:1},
        ].map((n, i) => (
          <Pix key={i} x={n.x} y={n.y} w={10} h={10} color={n.c} style={{ transform: `rotate(${n.r}deg)`, opacity: 0.9 }} />
        ))}
        {/* Nova headphones on desk */}
        <Pix x={270} y={88} w={12} h={8} color="#333344" style={{ borderRadius: '50% 50% 0 0', border: '2px solid #555566' }} />

        {/* SAGE DESK — middle left */}
        <Desk x={18} y={220} w={74} agentColor={C.sageGreen} />
        <Chair x={22} y={266} color={C.chairDark} />
        {/* Sage: wide monitor glow */}
        <Pix x={14} y={224} w={60} h={20} color="#0a180a" style={{ border: `1px solid ${C.sageGreen}55`, boxShadow: `0 0 10px ${C.sageGreen}22` }} />
        {/* Sticky notes on monitor */}
        {[{dx:0,c:'#ffff88'},{dx:10,c:'#88ffcc'},{dx:20,c:'#ff88cc'},{dx:30,c:'#ffcc44'}].map((n, i) => (
          <Pix key={i} x={14 + n.dx} y={222} w={8} h={6} color={n.c} style={{ opacity: 0.85 }} />
        ))}
        {/* Code printouts */}
        <Pix x={62} y={228} w={16} h={12} color="#eeeeee" />
        <Pix x={64} y={228} w={12} h={12} color="#f0f0f8" />
        {/* Crumpled paper */}
        <Pix x={30} y={292} w={8} h={8} color="#ddddcc" style={{ borderRadius: '50%', opacity: 0.7 }} />

        {/* BYTE DESK — middle right */}
        <Desk x={210} y={220} w={74} agentColor={C.byteRed} />
        <Chair x={214} y={266} color="#1a0a0a" />
        {/* Red underglow */}
        <div style={{ position: 'absolute', left: 210, top: 250, width: 80, height: 20, background: 'radial-gradient(ellipse,rgba(255,0,0,0.12) 0%,transparent 70%)' }} />
        {/* Locked drawer box */}
        <Pix x={256} y={230} w={20} h={12} color={C.metalDark} />
        <Pix x={256} y={230} w={20} h={2} color={C.metalGrey} />
        <Pix x={264} y={235} w={4} h={4} color="#333344" />
        {/* Blinking warning light */}
        <BlinkingLight x={278} y={228} />
        {/* Security cam on desk */}
        <Pix x={212} y={226} w={8} h={6} color="#1a1a2a" style={{ borderRadius: '50% 50% 0 0' }} />
        <Pix x={214} y={230} w={4} h={6} color={C.metalDark} />

        {/* FLORA DESK — bottom center */}
        <Desk x={110} y={360} w={80} agentColor={C.floraPink} />
        <Chair x={114} y={406} color={C.chairDark} />
        <Plant x={182} y={352} size="med" variant={2} />
        {/* Notepad */}
        <Pix x={152} y={368} w={14} h={16} color="#4a4a6a" />
        <Pix x={153} y={369} w={12} h={14} color="#eeeeee" />
        {[0, 1, 2, 3].map(li => <Pix key={li} x={154} y={371 + li * 3} w={8} h={1} color="#888888" style={{ opacity: 0.5 }} />)}
        {/* Belief poster above Flora */}
        <Pix x={112} y={340} w={40} h={16} color="#2a1a2a" style={{ border: '1px solid #cc44cc' }} />
        <Pix x={114} y={343} w={36} h={2} color={C.floraPink} style={{ opacity: 0.7 }} />
        <Pix x={116} y={347} w={28} h={1} color={C.floraPink} style={{ opacity: 0.5 }} />

        {/* ── LARGE FLOOR PLANTS ── */}
        <Plant x={2} y={450} size="lg" variant={0} />
        <Plant x={340} y={240} size="lg" variant={2} />
        <Plant x={340} y={430} size="med" variant={1} />
        <Plant x={96} y={350} size="sm" variant={0} />

        {/* ── ZONE B — CONFERENCE ROOM ── */}
        {/* Conference carpet */}
        <div style={{
          position: 'absolute', left: 406, top: 54, width: 280, height: 320,
          backgroundColor: C.floorB1,
          backgroundImage: `radial-gradient(circle, ${C.floorB2} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }} />

        <ConferenceTable x={420} y={80} />

        {/* Conference chairs */}
        <Chair x={470} y={68} color="#2a2a4a" hi="#3a3a5a" />
        <Chair x={424} y={155} color="#2a2a4a" hi="#3a3a5a" />
        <Chair x={480} y={158} color="#2a2a4a" hi="#3a3a5a" />
        <Chair x={536} y={80} color="#2a2a4a" hi="#3a3a5a" />
        <Chair x={540} y={155} color="#2a2a4a" hi="#3a3a5a" />

        {/* Conference mode label */}
        {isConferenceMode && (
          <div style={{
            position: 'absolute', left: 450, top: 58,
            fontSize: '8px', fontFamily: 'var(--font-pixel)', color: '#ffd700',
            animation: 'pixel-pulse 1s infinite', whiteSpace: 'nowrap',
          }}>
            ◆ CONFERENCE MODE ◆
          </div>
        )}

        {/* ── ZONE B LOUNGE ── */}
        <Sofa x={424} y={218} w={100} orientation="h" />
        <Sofa x={534} y={218} w={60} orientation="h" />
        <CoffeeTable x={450} y={248} />
        <FloorLamp x={618} y={210} />
        <WallPainting x={420} y={54} w={52} h={26} />
        <Plant x={614} y={300} size="lg" variant={1} />
        <Plant x={425} y={302} size="med" variant={0} />

        {/* ── ZONE C — KITCHEN ── */}
        <KitchenCounter x={404} y={350} />
        <Fridge x={672} y={360} />
        <SnackCabinet x={636} y={360} />
        {/* Kitchen herb pots */}
        {[0, 1, 2].map(i => (
          <Pix key={i} x={424 + i * 28} y={334} w={8} h={12} color={C.potTerra} style={{ borderRadius: '0 0 2px 2px' }}>
            <Pix x={0} y={0} w={8} h={3} color="#3a2010" />
            <Pix x={1} y={-8} w={6} h={8} color={C.plantGreen} style={{ borderRadius: '50% 50% 0 0' }} />
          </Pix>
        ))}

        {/* ── SOUTH AREA ── */}
        <BookShelf x={2} y={460} w={120} shelves={3} />
        <BookShelf x={126} y={460} w={80} shelves={2} />
        <WaterCooler x={310} y={370} />
        <Printer x={220} y={370} />
        <FilingCabinet x={4} y={370} />
        <FilingCabinet x={34} y={370} />
        <FireExtinguisher x={388} y={450} />

        {/* ── AMBIENT DETAILS ── */}
        {/* Ethernet patch panel */}
        <Pix x={300} y={220} w={36} h={12} color={C.metalDark} />
        {[...Array(8)].map((_, i) => (
          <Pix key={i} x={302 + i * 4} y={223} w={3} h={3} color="#1a1a2a" style={{ border: '1px solid #333344' }} />
        ))}
        {/* Power strip */}
        <Pix x={50} y={202} w={40} h={4} color="#1a1a2a" />
        <Pix x={50} y={202} w={40} h={1} color="#2a2a3a" />
        {[0, 1, 2].map(i => <Pix key={i} x={56 + i * 12} y={203} w={4} h={2} color="#333344" />)}
        {/* Exit sign */}
        <Pix x={380} y={50} w={28} h={12} color="#cc1111" />
        <Pix x={381} y={51} w={26} h={10} color="#ee2222" />
        <Pix x={383} y={52} w={6} h={8} color="#ffffff" style={{ opacity: 0.8 }} />
        <Pix x={391} y={54} w={12} h={2} color="#ffffff" style={{ opacity: 0.8 }} />

        {/* ── AGENT SPRITES (Y-sorted for depth) ── */}
        {(Object.values(agents) as Agent[])
          .sort((a, b) => a.position.y - b.position.y)
          .map((agent) => (
            <AgentSprite
              key={agent.id}
              agent={agent}
              onClick={() => handleAgentClick(agent.id as AgentId)}
            />
          ))}

        {/* ── SCREEN FLASH OVERLAY ── */}
        {screenFlash && (
          <div
            className="absolute inset-0 bg-white pointer-events-none"
            style={{ zIndex: 9999, animation: 'screen-flash 0.6s ease-out forwards' }}
          />
        )}

        {/* ── SCANLINE OVERLAY ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)',
        }} />

        {/* ── CRT VIGNETTE ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
          background: 'radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,0.55) 100%)',
        }} />

        {/* ── STATUS BAR ── */}
        <div style={{
          position: 'absolute', bottom: 6, left: 6, zIndex: 110,
          fontSize: '7px', fontFamily: 'var(--font-pixel)', color: 'rgba(255,255,255,0.2)',
        }}>
          OFFICE SPACE v2.0
        </div>
        <div style={{
          position: 'absolute', bottom: 6, right: 6, zIndex: 110,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.7)', border: '1px solid #2a2a4a',
          padding: '3px 8px',
          fontFamily: 'var(--font-terminal)', fontSize: '10px', color: '#666688',
        }}>
          <span>AGENTS: 5</span>
          <span>|</span>
          <span>GEMINI 2.0</span>
          <span>|</span>
          <span style={{ color: '#4aff8f' }}>●</span>
          <span>LIVE</span>
        </div>

      </div>

      {/* ── AGENT CARD MODAL (outside scaled div so it fills viewport) ── */}
      {selectedAgent && (
        <AgentCard agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}
