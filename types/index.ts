export type AgentId = 'rex' | 'nova' | 'sage' | 'byte' | 'flora'

export type AgentState = 'idle' | 'working' | 'walking' | 'thinking' | 'chatting' | 'break' | 'conference'

export type Direction = 'left' | 'right' | 'up' | 'down' | 'idle'

export interface Position {
  x: number
  y: number
}

export interface Agent {
  id: AgentId
  name: string
  role: string
  personality: string
  color: string
  systemPrompt: string
  state: AgentState
  direction: Direction
  position: Position
  targetPosition: Position
  chatBubble: string | null
  chatBubbleTimeout: ReturnType<typeof setTimeout> | null
  isActive: boolean
  superPowerName: string
  superPowerActive: boolean
  conversationHistory: GeminiMessage[]
}

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface FeedItem {
  id: string
  timestamp: Date
  agentId: AgentId | 'system'
  type: 'search' | 'reasoning' | 'chat' | 'action' | 'result' | 'report' | 'superpower' | 'error'
  message: string
  detail?: string
  searchUrl?: string
  reportId?: string
  isExpanded?: boolean
}

export interface Report {
  id: string
  title: string
  content: string
  createdAt: Date
  agentIds: AgentId[]
  type: 'github_review' | 'mission_result' | 'superpower'
}

export interface OfficeZone {
  id: string
  name: string
  position: Position
  width: number
  height: number
  type: 'desk' | 'conference' | 'cooler' | 'printer' | 'snack'
  assignedAgent?: AgentId
}
