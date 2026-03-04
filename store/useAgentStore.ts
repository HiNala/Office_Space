import { create } from 'zustand'
import { Agent, AgentId, FeedItem, Report, Position } from '@/types'
import { AGENT_DEFAULTS, DESK_POSITIONS } from '@/lib/agents'

function createInitialAgent(id: AgentId): Agent {
  return {
    ...AGENT_DEFAULTS[id],
    state: 'idle',
    direction: 'idle',
    position: { ...DESK_POSITIONS[id] },
    targetPosition: { ...DESK_POSITIONS[id] },
    chatBubble: null,
    chatBubbleTimeout: null,
    superPowerActive: false,
    conversationHistory: [],
  }
}

interface AgentStore {
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void

  agents: Record<AgentId, Agent>
  updateAgent: (id: AgentId, update: Partial<Agent>) => void
  setAgentSystemPrompt: (id: AgentId, prompt: string) => void
  setAgentChatBubble: (id: AgentId, message: string | null, duration?: number) => void
  setAgentPosition: (id: AgentId, position: Position) => void
  setAgentState: (id: AgentId, state: Agent['state']) => void

  isConferenceMode: boolean
  setConferenceMode: (active: boolean) => void

  feedItems: FeedItem[]
  addFeedItem: (item: Partial<FeedItem> & Pick<FeedItem, 'agentId' | 'type' | 'message'>) => void
  updateFeedItem: (id: string, updates: Partial<FeedItem>) => void
  updateFeedItemByType: (type: FeedItem['type'], message: string) => void
  clearFeed: () => void
  toggleFeedItemExpanded: (id: string) => void

  reports: Report[]
  addReport: (report: Omit<Report, 'id' | 'createdAt'>) => void
  activeReportId: string | null
  setActiveReport: (id: string | null) => void

  githubUrl: string
  setGithubUrl: (url: string) => void

  currentMission: string
  setCurrentMission: (mission: string) => void
  isRunning: boolean
  setIsRunning: (running: boolean) => void

  screenFlash: boolean
  triggerScreenFlash: () => void
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),

  agents: {
    rex: createInitialAgent('rex'),
    nova: createInitialAgent('nova'),
    sage: createInitialAgent('sage'),
    byte: createInitialAgent('byte'),
    flora: createInitialAgent('flora'),
  },

  updateAgent: (id, update) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], ...update },
      },
    })),

  setAgentSystemPrompt: (id, prompt) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], systemPrompt: prompt },
      },
    })),

  setAgentChatBubble: (id, message, duration = 4000) => {
    const { agents, updateAgent } = get()
    const agent = agents[id]

    if (agent.chatBubbleTimeout) {
      clearTimeout(agent.chatBubbleTimeout)
    }

    if (!message) {
      updateAgent(id, { chatBubble: null, chatBubbleTimeout: null })
      return
    }

    const timeout = setTimeout(() => {
      updateAgent(id, { chatBubble: null, chatBubbleTimeout: null })
    }, duration)

    updateAgent(id, { chatBubble: message, chatBubbleTimeout: timeout })
  },

  setAgentPosition: (id, position) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], position },
      },
    })),

  setAgentState: (id, agentState) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], state: agentState },
      },
    })),

  isConferenceMode: false,
  setConferenceMode: (active) => set({ isConferenceMode: active }),

  feedItems: [],
  addFeedItem: (item) =>
    set((state) => {
      const newItem: FeedItem = {
        id: item.id || Math.random().toString(36).slice(2),
        timestamp: new Date(),
        isExpanded: false,
        isStreaming: false,
        ...item,
      } as FeedItem
      if (item.id && state.feedItems.find(f => f.id === item.id)) {
        return state
      }
      return {
        feedItems: [...state.feedItems, newItem].slice(-200),
      }
    }),
  updateFeedItem: (id, updates) =>
    set((state) => ({
      feedItems: state.feedItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  updateFeedItemByType: (type, message) =>
    set((state) => {
      const item = state.feedItems.find(f => f.type === type && f.agentId === 'nova')
      if (!item) return state
      return {
        feedItems: state.feedItems.map((f) =>
          f.id === item.id ? { ...f, message } : f
        ),
      }
    }),
  clearFeed: () => set({ feedItems: [] }),
  toggleFeedItemExpanded: (id) =>
    set((state) => ({
      feedItems: state.feedItems.map((item) =>
        item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
      ),
    })),

  reports: [],
  addReport: (report) =>
    set((state) => ({
      reports: [
        {
          ...report,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date(),
        },
        ...state.reports,
      ],
    })),
  activeReportId: null,
  setActiveReport: (id) => set({ activeReportId: id }),

  githubUrl: '',
  setGithubUrl: (url) => set({ githubUrl: url }),

  currentMission: '',
  setCurrentMission: (mission) => set({ currentMission: mission }),
  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),

  screenFlash: false,
  triggerScreenFlash: () => {
    set({ screenFlash: true })
    setTimeout(() => set({ screenFlash: false }), 600)
  },
}))
