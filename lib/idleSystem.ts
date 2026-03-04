import { AgentId } from '@/types'
import { useAgentStore } from '@/store/useAgentStore'
import { AGENT_IDLE_CHATS, DESK_POSITIONS, COOLER_POSITION, KITCHEN_POSITION, LOUNGE_POSITION, PRINTER_POSITION, SNACK_POSITION } from './agents'
import { moveAgentTo, moveAgentToWork } from './gemini'

const BREAK_DESTINATIONS = [
  { position: COOLER_POSITION,  bubble: '☕ Coffee time!',    duration: 8000  },
  { position: KITCHEN_POSITION, bubble: '🍎 Grabbing a snack', duration: 6000  },
  { position: LOUNGE_POSITION,  bubble: '🛋️ Quick breather',  duration: 10000 },
  { position: PRINTER_POSITION, bubble: '🖨️ Printing report...', duration: 5000 },
  { position: SNACK_POSITION,   bubble: '🍪 Snack attack!',   duration: 5000 },
]

// Personality-specific conversations between agent pairs
const PAIR_CHATS: Record<string, { a: string; b: string }[]> = {
  'rex-sage':  [
    { a: 'Should we refactor the auth layer?', b: 'Only if we add proper tests first.' },
    { a: 'Thinking microservices for this...', b: 'Monolith first. Prove the need.' },
    { a: 'Database migration plan ready.', b: 'Let me review the schema changes.' },
  ],
  'rex-byte':  [
    { a: 'New API endpoint design done.', b: 'I need to pen-test that immediately.' },
    { a: 'Load balancer is configured.', b: 'DDoS protection on that endpoint?' },
  ],
  'nova-flora': [
    { a: 'Found 3 competitor apps doing this!', b: 'How do we differentiate though?' },
    { a: 'The market data is fascinating—', b: 'Translate that to user stories!' },
    { a: 'Oh! New research just dropped!', b: 'Does it change our roadmap?' },
  ],
  'nova-sage':  [
    { a: 'Latest benchmarks look promising!', b: 'Show me the methodology first.' },
    { a: 'Users are requesting dark mode—', b: 'Accessibility contrast ratios matter.' },
  ],
  'byte-flora': [
    { a: 'We need 2FA before launch.', b: 'Will that hurt onboarding conversion?' },
    { a: 'Found a potential data leak.', b: 'Prioritize that above everything.' },
  ],
  'sage-flora': [
    { a: 'The button hierarchy is wrong.', b: 'What does the data say about CTR?' },
    { a: 'Mobile layout needs rework.', b: 'Agreed — 70% of users are mobile.' },
  ],
  'byte-sage':  [
    { a: 'Input validation is missing here.', b: 'Add it to the linting rules.' },
    { a: 'JWT expiry too long.', b: 'Refresh token rotation pattern?' },
  ],
  'rex-flora': [
    { a: 'Infrastructure costs are climbing.', b: 'Can we tie that to revenue metrics?' },
    { a: 'Tech debt sprint this week?', b: 'Let me check the roadmap priorities.' },
  ],
  'rex-nova': [
    { a: 'Need research on edge computing.', b: 'Already on it! Found three papers!' },
  ],
  'nova-byte': [
    { a: 'This exploit is all over HackerNews!', b: 'Already patched. I saw it yesterday.' },
  ],
}

function getPairKey(a: AgentId, b: AgentId): string | null {
  const k1 = `${a}-${b}`
  const k2 = `${b}-${a}`
  if (PAIR_CHATS[k1]) return k1
  if (PAIR_CHATS[k2]) return k2
  return null
}

function returnToDesk(agentId: AgentId) {
  moveAgentTo(agentId, DESK_POSITIONS[agentId])
  // After arriving, start working
  setTimeout(() => {
    moveAgentToWork(agentId)
  }, 1000)
}

let idleInterval: ReturnType<typeof setInterval> | null = null

export function startIdleSystem() {
  if (idleInterval) return

  // Set all agents to working initially
  setTimeout(() => {
    const store = useAgentStore.getState()
    const ids: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
    ids.forEach(id => {
      if (store.agents[id].isActive && store.agents[id].state === 'idle') {
        store.updateAgent(id, { state: 'working' })
      }
    })
  }, 2000)

  idleInterval = setInterval(() => {
    const store = useAgentStore.getState()
    if (store.isRunning || store.isConferenceMode) return

    const agents = Object.values(store.agents)
    const activeAgents = agents.filter((a) => a.isActive && a.state !== 'conference')
    if (activeAgents.length === 0) return

    // Ensure idle agents at their desks go to working state
    activeAgents.forEach(a => {
      const desk = DESK_POSITIONS[a.id as AgentId]
      const atDesk = Math.abs(a.position.x - desk.x) < 4 && Math.abs(a.position.y - desk.y) < 4
      if (a.state === 'idle' && atDesk) {
        store.updateAgent(a.id as AgentId, { state: 'working' })
      }
    })

    const roll = Math.random()

    if (roll < 0.12) {
      // ── BREAK: agent visits a random destination ──
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      if (agent.state === 'working' || agent.state === 'idle') {
        const dest = BREAK_DESTINATIONS[Math.floor(Math.random() * BREAK_DESTINATIONS.length)]
        store.updateAgent(agent.id as AgentId, { state: 'break' as any })
        moveAgentTo(agent.id as AgentId, dest.position)
        store.setAgentChatBubble(agent.id as AgentId, dest.bubble, dest.duration)
        setTimeout(() => returnToDesk(agent.id as AgentId), dest.duration + 2000)
      }

    } else if (roll < 0.28) {
      // ── IDLE THOUGHT: working agent mumbles something ──
      const workingAgents = activeAgents.filter(a => a.state === 'working')
      if (workingAgents.length > 0) {
        const agent = workingAgents[Math.floor(Math.random() * workingAgents.length)]
        const chats = AGENT_IDLE_CHATS[agent.id as AgentId]
        if (chats?.length) {
          const chat = chats[Math.floor(Math.random() * chats.length)]
          store.setAgentChatBubble(agent.id as AgentId, chat, 4000)
        }
      }

    } else if (roll < 0.42) {
      // ── PAIR CHAT: two agents walk to each other and have a conversation ──
      if (activeAgents.length >= 2) {
        const a1 = activeAgents[Math.floor(Math.random() * activeAgents.length)]
        const remaining = activeAgents.filter((a) => a.id !== a1.id)
        const a2 = remaining[Math.floor(Math.random() * remaining.length)]
        const id1 = a1.id as AgentId
        const id2 = a2.id as AgentId

        // Meet in the middle
        const midX = (a1.position.x + a2.position.x) / 2
        const midY = (a1.position.y + a2.position.y) / 2
        moveAgentTo(id1, { x: midX - 4, y: midY })
        moveAgentTo(id2, { x: midX + 4, y: midY })

        // Look for personality-specific dialogue
        const pairKey = getPairKey(id1, id2)
        if (pairKey) {
          const convos = PAIR_CHATS[pairKey]
          const convo = convos[Math.floor(Math.random() * convos.length)]
          const isReversed = pairKey.startsWith(id2)

          setTimeout(() => {
            store.setAgentChatBubble(isReversed ? id2 : id1, convo.a, 3500)
          }, 1200)
          setTimeout(() => {
            store.setAgentChatBubble(isReversed ? id1 : id2, convo.b, 3500)
          }, 3000)
        } else {
          // Fallback generic chat
          const chats1 = AGENT_IDLE_CHATS[id1]
          const chats2 = AGENT_IDLE_CHATS[id2]
          setTimeout(() => {
            if (chats1?.length) store.setAgentChatBubble(id1, chats1[Math.floor(Math.random() * chats1.length)], 3000)
          }, 1200)
          setTimeout(() => {
            if (chats2?.length) store.setAgentChatBubble(id2, chats2[Math.floor(Math.random() * chats2.length)], 3000)
          }, 3000)
        }

        // Return both to desks after chat
        setTimeout(() => {
          returnToDesk(id1)
          returnToDesk(id2)
        }, 5500)
      }

    } else if (roll < 0.50) {
      // ── DESK VISIT: one agent walks to another's desk ──
      if (activeAgents.length >= 2) {
        const visitor = activeAgents[Math.floor(Math.random() * activeAgents.length)]
        const hosts = activeAgents.filter(a => a.id !== visitor.id)
        const host = hosts[Math.floor(Math.random() * hosts.length)]
        const hostDesk = DESK_POSITIONS[host.id as AgentId]

        // Walk to their desk (slightly offset)
        moveAgentTo(visitor.id as AgentId, { x: hostDesk.x + 6, y: hostDesk.y + 2 })

        setTimeout(() => {
          store.setAgentChatBubble(visitor.id as AgentId, `Hey ${host.name}, got a sec?`, 3000)
        }, 1200)

        setTimeout(() => {
          store.setAgentChatBubble(host.id as AgentId, 'Sure, what\'s up?', 3000)
        }, 3000)

        setTimeout(() => returnToDesk(visitor.id as AgentId), 6000)
      }
    }
    // else: ~50% of ticks → nothing happens, agents keep working
  }, 6000)
}

export function stopIdleSystem() {
  if (idleInterval) {
    clearInterval(idleInterval)
    idleInterval = null
  }
}
