import { AgentId } from '@/types'
import { useAgentStore } from '@/store/useAgentStore'
import { AGENT_IDLE_CHATS, DESK_POSITIONS } from './agents'
import { sendAgentToBreak, moveAgentTo } from './gemini'

let idleInterval: ReturnType<typeof setInterval> | null = null

export function startIdleSystem() {
  if (idleInterval) return // Already running — singleton guard

  idleInterval = setInterval(() => {
    const store = useAgentStore.getState()
    if (store.isRunning) return // Don't interrupt active missions

    const agents = Object.values(store.agents)
    const activeAgents = agents.filter((a) => a.isActive && a.state !== 'conference')

    if (activeAgents.length === 0) return

    const roll = Math.random()

    if (roll < 0.15) {
      // Random agent takes a coffee break
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      if (agent.state !== 'break') {
        sendAgentToBreak(agent.id as AgentId)
        store.setAgentChatBubble(agent.id as AgentId, '☕ brb', 3000)
      }
    } else if (roll < 0.35) {
      // Random agent shows an idle thought bubble
      const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)]
      const chats = AGENT_IDLE_CHATS[agent.id as AgentId]
      if (chats?.length) {
        const chat = chats[Math.floor(Math.random() * chats.length)]
        store.setAgentChatBubble(agent.id as AgentId, chat, 3500)
      }
    } else if (roll < 0.45) {
      // Two agents "chat" — walk toward each other, exchange bubbles, return to desks
      if (activeAgents.length >= 2) {
        const a1 = activeAgents[Math.floor(Math.random() * activeAgents.length)]
        const remaining = activeAgents.filter((a) => a.id !== a1.id)
        const a2 = remaining[Math.floor(Math.random() * remaining.length)]

        const midX = (a1.position.x + a2.position.x) / 2
        const midY = (a1.position.y + a2.position.y) / 2

        moveAgentTo(a1.id as AgentId, { x: midX - 5, y: midY })
        moveAgentTo(a2.id as AgentId, { x: midX + 5, y: midY })

        const chats1 = AGENT_IDLE_CHATS[a1.id as AgentId]
        const chats2 = AGENT_IDLE_CHATS[a2.id as AgentId]

        setTimeout(() => {
          if (chats1?.length) {
            store.setAgentChatBubble(
              a1.id as AgentId,
              chats1[Math.floor(Math.random() * chats1.length)],
              3000
            )
          }
        }, 1000)

        setTimeout(() => {
          if (chats2?.length) {
            store.setAgentChatBubble(
              a2.id as AgentId,
              chats2[Math.floor(Math.random() * chats2.length)],
              3000
            )
          }
          // Return both to their desks
          moveAgentTo(a1.id as AgentId, DESK_POSITIONS[a1.id as AgentId])
          moveAgentTo(a2.id as AgentId, DESK_POSITIONS[a2.id as AgentId])
        }, 4000)
      }
    }
  }, 8000) // Poll every 8 seconds
}

export function stopIdleSystem() {
  if (idleInterval) {
    clearInterval(idleInterval)
    idleInterval = null
  }
}
