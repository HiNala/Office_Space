import { AgentId } from '@/types'
import { DESK_POSITIONS, COOLER_POSITION, SNACK_POSITION, AGENT_IDLE_CHATS } from '@/lib/agents'
import { useAgentStore } from '@/store/useAgentStore'

const WANDER_SPOTS = [
  COOLER_POSITION,
  SNACK_POSITION,
  { x: 50, y: 55 }, // center office
  { x: 35, y: 45 }, // near conference table
  { x: 60, y: 45 },
]

// Stagger each agent's wander interval so they don't all move simultaneously
const AGENT_INTERVALS: Record<AgentId, number> = {
  rex: 14000,
  nova: 11000,
  sage: 17000,
  byte: 13000,
  flora: 15000,
}

export function startIdleMovement(): () => void {
  const timers: ReturnType<typeof setInterval>[] = []
  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']

  agentIds.forEach((agentId, i) => {
    // Stagger initial start
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        const store = useAgentStore.getState()
        const agent = store.agents[agentId]

        // Don't wander during active missions or conference mode
        if (
          !agent.isActive ||
          store.isRunning ||
          store.isConferenceMode ||
          agent.state === 'working' ||
          agent.state === 'conference'
        ) return

        // ~35% chance to actually wander each tick
        if (Math.random() > 0.35) return

        const spot = WANDER_SPOTS[Math.floor(Math.random() * WANDER_SPOTS.length)]
        const idleChat = AGENT_IDLE_CHATS[agentId][Math.floor(Math.random() * AGENT_IDLE_CHATS[agentId].length)]

        store.updateAgent(agentId, { state: 'walking', position: spot })
        store.setAgentChatBubble(agentId, idleChat, 4000)

        // Return to desk after 5–9 seconds
        const returnDelay = 5000 + Math.random() * 4000
        setTimeout(() => {
          const current = useAgentStore.getState()
          const currentAgent = current.agents[agentId]
          if (
            currentAgent.state === 'walking' &&
            !current.isRunning &&
            !current.isConferenceMode
          ) {
            current.updateAgent(agentId, {
              state: 'idle',
              position: { ...DESK_POSITIONS[agentId] },
            })
          }
        }, returnDelay)
      }, AGENT_INTERVALS[agentId])

      timers.push(interval)
    }, i * 2500 + Math.random() * 2000)

    // Also store the start delay so we can clear it
    timers.push(startDelay as unknown as ReturnType<typeof setInterval>)
  })

  return () => timers.forEach((t) => clearInterval(t))
}

// Randomly trigger an agent to show a thinking bubble at their desk
export function startIdleChatBubbles(): () => void {
  const interval = setInterval(() => {
    const store = useAgentStore.getState()
    if (store.isRunning || store.isConferenceMode) return

    const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
    const idleAgents = agentIds.filter(
      (id) => store.agents[id].isActive && store.agents[id].state === 'idle'
    )

    if (idleAgents.length === 0) return

    const agentId = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    const chat = AGENT_IDLE_CHATS[agentId][Math.floor(Math.random() * AGENT_IDLE_CHATS[agentId].length)]

    store.setAgentChatBubble(agentId, chat, 3500)
  }, 7000)

  return () => clearInterval(interval)
}
