import { AgentId } from '@/types'
import { AGENT_DEFAULTS } from '@/lib/agents'
import { useAgentStore } from '@/store/useAgentStore'

// Stub implementation — full agent logic wired in Build Doc 2
export async function activateSuperPower(agentId: AgentId, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()
  const agent = AGENT_DEFAULTS[agentId]

  store.addFeedItem({
    agentId,
    type: 'superpower',
    message: `⚡ ${agent.name} activating ${agent.superPowerName}...`,
  })

  store.updateAgent(agentId, { superPowerActive: true })
  store.triggerScreenFlash()

  await new Promise((resolve) => setTimeout(resolve, 3000))

  store.updateAgent(agentId, { superPowerActive: false })
  store.addFeedItem({
    agentId,
    type: 'superpower',
    message: `✅ ${agent.superPowerName} complete. Connect your Gemini API key to activate.`,
  })
}

export async function runMission(mission: string, apiKey: string): Promise<void> {
  // Implemented in Build Doc 2
  const store = useAgentStore.getState()
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: `Mission received: "${mission}" — Connect Gemini API key to run agents.`,
  })
}
