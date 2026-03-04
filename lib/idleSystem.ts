import { AgentId } from '@/types'
import { useAgentStore } from '@/store/useAgentStore'
import { AGENT_IDLE_CHATS, DESK_POSITIONS } from './agents'

let idleInterval: ReturnType<typeof setInterval> | null = null

function moveAgentTo(id: AgentId, pos: { x: number; y: number }) {
  const store = useAgentStore.getState()
  store.setAgentState(id, 'walking')
  store.setAgentPosition(id, pos)
  setTimeout(() => {
    store.setAgentState(id, 'idle')
  }, 1200)
}

function sendAgentToBreak(id: AgentId) {
  const store = useAgentStore.getState()
  const breakSpots = [
    { x: 44, y: 62 }, // water cooler
    { x: 80, y: 75 }, // snack bar
  ]
  const spot = breakSpots[Math.floor(Math.random() * breakSpots.length)]
  store.setAgentState(id, 'break')
  store.setAgentPosition(id, spot)
  
  // Return to desk after break
  setTimeout(() => {
    store.setAgentPosition(id, DESK_POSITIONS[id])
    store.setAgentState(id, 'idle')
  }, 6000)
}

export function startIdleSystem() {
  if (idleInterval) return

  idleInterval = setInterval(() => {
    const store = useAgentStore.getState()
    if (store.isRunning) return

    const agents = Object.values(store.agents)
    const activeAgents = agents.filter(a => a.isActive)

    if (activeAgents.length === 0) return

    const roll = Math.random()

    if (roll < 0.15) {
      // Random agent takes a break
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      if (agent.state !== 'break') {
        sendAgentToBreak(agent.id as AgentId)
        store.setAgentChatBubble(agent.id as AgentId, 'brb, coffee', 3000)
      }
    } else if (roll < 0.35) {
      // Random agent shows idle chat bubble
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      const chats = AGENT_IDLE_CHATS[agent.id as AgentId]
      const chat = chats[Math.floor(Math.random() * chats.length)]
      store.setAgentChatBubble(agent.id as AgentId, chat, 3500)
    } else if (roll < 0.45) {
      // Two agents "chat" with each other
      if (activeAgents.length >= 2) {
        const a1 = activeAgents[Math.floor(Math.random() * activeAgents.length)]
        const remaining = activeAgents.filter(a => a.id !== a1.id)
        const a2 = remaining[Math.floor(Math.random() * remaining.length)]

        const midX = (a1.position.x + a2.position.x) / 2
        const midY = (a1.position.y + a2.position.y) / 2

        moveAgentTo(a1.id as AgentId, { x: midX - 5, y: midY })
        moveAgentTo(a2.id as AgentId, { x: midX + 5, y: midY })

        const chats1 = AGENT_IDLE_CHATS[a1.id as AgentId]
        const chats2 = AGENT_IDLE_CHATS[a2.id as AgentId]

        setTimeout(() => {
          store.setAgentChatBubble(a1.id as AgentId, chats1[Math.floor(Math.random() * chats1.length)], 3000)
        }, 1000)

        setTimeout(() => {
          store.setAgentChatBubble(a2.id as AgentId, chats2[Math.floor(Math.random() * chats2.length)], 3000)
          moveAgentTo(a1.id as AgentId, DESK_POSITIONS[a1.id as AgentId])
          moveAgentTo(a2.id as AgentId, DESK_POSITIONS[a2.id as AgentId])
        }, 4000)
      }
    }
  }, 8000)
}

export function stopIdleSystem() {
  if (idleInterval) {
    clearInterval(idleInterval)
    idleInterval = null
  }
}
