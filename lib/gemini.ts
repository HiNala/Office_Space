import { GoogleGenerativeAI, type ModelParams } from '@google/generative-ai'
import { AgentId, GeminiMessage } from '@/types'
import { useAgentStore } from '@/store/useAgentStore'
import { AGENT_DEFAULTS, DESK_POSITIONS, CONFERENCE_POSITIONS, COOLER_POSITION } from './agents'
import type { GitHubFile } from './github'

function getClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================
// AGENT MOVEMENT HELPERS
// =============================================

export function moveAgentTo(agentId: AgentId, position: { x: number; y: number }) {
  const store = useAgentStore.getState()
  store.updateAgent(agentId, {
    position,
    state: 'walking',
    direction: position.x > store.agents[agentId].position.x ? 'right' : 'left',
  })
  setTimeout(() => {
    useAgentStore.getState().setAgentState(agentId, 'idle')
  }, 900)
}

export function moveAgentToWork(agentId: AgentId) {
  const store = useAgentStore.getState()
  store.updateAgent(agentId, {
    position: DESK_POSITIONS[agentId],
    state: 'working',
  })
  return Promise.resolve()
}

export function moveAgentToConference(agentId: AgentId) {
  moveAgentTo(agentId, CONFERENCE_POSITIONS[agentId])
  setTimeout(() => {
    useAgentStore.getState().setAgentState(agentId, 'conference')
  }, 1000)
}

export function returnAllAgentsToDesks() {
  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  agentIds.forEach((id) => {
    setTimeout(() => moveAgentToWork(id), Math.random() * 500)
  })
}

export function sendAgentToBreak(agentId: AgentId) {
  moveAgentTo(agentId, COOLER_POSITION)
  setTimeout(() => {
    useAgentStore.getState().setAgentState(agentId, 'break')
  }, 900)
  setTimeout(() => moveAgentToWork(agentId), 5000)
}

// =============================================
// CORE AGENT CALLER
// =============================================

export async function callAgent(
  agentId: AgentId,
  userMessage: string,
  apiKey: string,
  options?: {
    useSearch?: boolean
    additionalContext?: string
    onChunk?: (text: string) => void
  }
): Promise<string> {
  const store = useAgentStore.getState()
  const agent = store.agents[agentId]
  const agentDef = AGENT_DEFAULTS[agentId]

  if (!agent.isActive) return ''

  const client = getClient(apiKey)

  store.setAgentState(agentId, 'thinking')
  store.addFeedItem({
    agentId,
    type: 'reasoning',
    message: `${agentDef.name} is thinking...`,
    detail: userMessage.slice(0, 100),
  })

  try {
    const modelConfig: ModelParams = {
      model: 'gemini-2.0-flash',
      systemInstruction: agent.systemPrompt,
    }

    // Enable web search grounding for NOVA or when explicitly requested
    if (options?.useSearch || agentId === 'nova') {
      ;(modelConfig as unknown as Record<string, unknown>).tools = [{ googleSearch: {} }]
    }

    const model = client.getGenerativeModel(modelConfig)

    const history: GeminiMessage[] = [...agent.conversationHistory]

    const fullMessage = options?.additionalContext
      ? `${options.additionalContext}\n\n${userMessage}`
      : userMessage

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: msg.parts,
      })),
    })

    const result = await chat.sendMessageStream(fullMessage)

    let fullResponse = ''
    const searchQueries: string[] = []

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      fullResponse += chunkText

      // Extract web search queries from grounding metadata
      const metadata = (chunk as unknown as { candidates?: { groundingMetadata?: { webSearchQueries?: string[] } }[] })
        .candidates?.[0]?.groundingMetadata
      if (metadata?.webSearchQueries) {
        for (const query of metadata.webSearchQueries) {
          if (!searchQueries.includes(query)) {
            searchQueries.push(query)
            store.addFeedItem({
              agentId,
              type: 'search',
              message: `${agentDef.name} searched: "${query}"`,
            })
          }
        }
      }

      if (options?.onChunk) options.onChunk(chunkText)
    }

    // Update conversation history (keep last 20 messages / 10 exchanges)
    const newHistory: GeminiMessage[] = [
      ...history,
      { role: 'user', parts: [{ text: fullMessage }] },
      { role: 'model', parts: [{ text: fullResponse }] },
    ]
    const trimmedHistory = newHistory.slice(-20)

    store.updateAgent(agentId, {
      conversationHistory: trimmedHistory,
      state: 'working',
    })

    // Add to live feed
    store.addFeedItem({
      agentId,
      type: 'chat',
      message: `${agentDef.name}: ${fullResponse.slice(0, 120)}${fullResponse.length > 120 ? '...' : ''}`,
      detail: fullResponse,
    })

    // Chat bubble with truncated response
    const bubbleText = fullResponse.replace(/^[A-Z]+:\s*/, '').slice(0, 60) + (fullResponse.length > 60 ? '...' : '')
    store.setAgentChatBubble(agentId, bubbleText, 5000)

    return fullResponse
  } catch (error: unknown) {
    store.setAgentState(agentId, 'idle')
    const msg = error instanceof Error ? error.message : 'Unknown error'
    store.addFeedItem({
      agentId,
      type: 'error',
      message: `${agentDef.name} error: ${msg}`,
    })
    return ''
  }
}

// =============================================
// SUPER POWERS
// =============================================

const SUPER_POWER_PROMPTS: Record<AgentId, string> = {
  rex: `BLUEPRINT MODE ACTIVATED. Generate a complete, detailed system architecture for the current mission context. Include:
- Tech stack with specific versions and justifications
- Database schema (3-5 key tables with fields)
- API architecture (key REST/GraphQL endpoints)
- Infrastructure diagram (ASCII text-based)
- Scalability bottlenecks to watch for
- Build vs buy decisions
- Estimated costs at 10k/100k/1M users
Format as structured Markdown with ## section headers.`,

  nova: `DEEP SCAN ACTIVATED. Perform a deep research synthesis on the current mission context. Find and report:
- Latest benchmarks and performance data
- Key players and competitive landscape  
- Recent breakthroughs (last 3 months)
- Contrarian takes worth considering
- 5 surprising facts most people don't know
Synthesize into a tight intelligence brief with clear source reasoning.`,

  sage: `X-RAY VISION ACTIVATED. Generate a prioritized list of exactly 10 improvements for the current context. Format each as:
[CRITICAL/HIGH/MEDIUM/LOW] Issue: [specific description]
â†’ Fix: [exact solution with implementation detail]
â†’ Effort: [hours estimate]
â†’ Impact: [user/business impact]

Cover: accessibility (WCAG), performance, UX heuristics (Nielsen's 10), code quality, security, mobile.`,

  byte: `THREAT MATRIX ACTIVATED. Generate a complete security threat assessment. Format each threat as:
THREAT-[N]: [Name]
Severity: CRITICAL/HIGH/MEDIUM/LOW
Vector: [attack vector description]
Description: [what an attacker could do step-by-step]
Mitigation: [specific code/config fix]

Cover: auth bypass, SQL/NoSQL injection, XSS, CSRF, IDOR, rate limiting, data exposure, supply chain.`,

  flora: `VISION BOARD ACTIVATED. Generate a complete 90-day product roadmap:

## Month 1: Foundation (Days 1-30)
- Week 1-2: [specific milestones]
- Week 3-4: [specific milestones]
KPIs: [3 measurable metrics]

## Month 2: Growth (Days 31-60)
[same structure]

## Month 3: Scale (Days 61-90)
[same structure]

## Risk Register
[top 3 risks with probability, impact, and mitigation]

## Success Metrics
[north star metric + 3 supporting metrics with targets]`,
}

export async function activateSuperPower(agentId: AgentId, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()
  const agentDef = AGENT_DEFAULTS[agentId]

  if (!apiKey) {
    store.addFeedItem({
      agentId,
      type: 'error',
      message: `Enter your Gemini API key to activate ${agentDef.superPowerName}.`,
    })
    return
  }

  store.triggerScreenFlash()
  store.updateAgent(agentId, { superPowerActive: true, state: 'working' })

  store.addFeedItem({
    agentId,
    type: 'superpower',
    message: `âš¡ ${agentDef.name} activated ${agentDef.superPowerName}!`,
  })

  const response = await callAgent(agentId, SUPER_POWER_PROMPTS[agentId], apiKey)

  const store2 = useAgentStore.getState()
  store2.addReport({
    title: `âš¡ ${agentDef.superPowerName} â€” ${agentDef.name}`,
    content: response,
    agentIds: [agentId],
    type: 'superpower',
  })

  const reports = useAgentStore.getState().reports
  if (reports.length > 0) store2.setActiveReport(reports[0].id)

  store2.updateAgent(agentId, { superPowerActive: false, state: 'idle' })
  store2.addFeedItem({
    agentId,
    type: 'report',
    message: `âš¡ ${agentDef.superPowerName} report ready! Click to open.`,
  })
}

// =============================================
// MISSION ORCHESTRATOR
// =============================================

export async function runMission(mission: string, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()
  store.setIsRunning(true)
  store.setCurrentMission(mission)
  store.clearFeed()

  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: `ðŸŽ¯ New mission: "${mission}"`,
  })

  if (!apiKey) {
    store.addFeedItem({
      agentId: 'system',
      type: 'error',
      message: 'âš  Enter your Gemini API key in the top bar.',
    })
    store.setIsRunning(false)
    return
  }

  // All agents move to their desks and start working
  await Promise.all([
    moveAgentToWork('rex'),
    moveAgentToWork('nova'),
    moveAgentToWork('sage'),
    moveAgentToWork('byte'),
    moveAgentToWork('flora'),
  ])

  const teamContext = `The team has received a new mission: "${mission}"

Your job: contribute your specialty perspective. Reference teammates by name. Keep responses focused (150-200 words). End with a specific question or insight for another team member.`

  // Phase 1: Architecture + Strategy in parallel
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ“‹ Phase 1: Architecture & strategy assessment...',
  })

  const [rexResponse, floraResponse] = await Promise.all([
    callAgent('rex', `Analyze this mission from an architecture perspective: ${mission}`, apiKey, {
      additionalContext: teamContext,
    }),
    callAgent('flora', `Analyze this mission from a product strategy perspective: ${mission}`, apiKey, {
      additionalContext: teamContext,
    }),
  ])

  await sleep(1000)

  // Phase 2: Research + Security in parallel
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ” Phase 2: Research & security analysis...',
  })

  const [novaResponse, byteResponse] = await Promise.all([
    callAgent('nova', `Research the latest information relevant to: ${mission}. Share key findings.`, apiKey, {
      useSearch: true,
      additionalContext: `REX said: ${rexResponse.slice(0, 200)}\nFLORA said: ${floraResponse.slice(0, 200)}`,
    }),
    callAgent('byte', `Identify security risks and considerations for: ${mission}`, apiKey, {
      additionalContext: `REX said: ${rexResponse.slice(0, 200)}\nFLORA said: ${floraResponse.slice(0, 200)}`,
    }),
  ])

  await sleep(1000)

  // Phase 3: SAGE synthesizes + adds UX critique
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸŽ¨ Phase 3: UX synthesis...',
  })

  moveAgentTo('sage', { x: 35, y: 48 })

  const sageResponse = await callAgent(
    'sage',
    `Synthesize the team's analysis and add your UX perspective for: ${mission}

Team findings:
- REX: ${rexResponse.slice(0, 150)}
- FLORA: ${floraResponse.slice(0, 150)}
- NOVA: ${novaResponse.slice(0, 150)}
- BYTE: ${byteResponse.slice(0, 150)}

Provide your UX assessment and final synthesis.`,
    apiKey
  )

  await sleep(800)

  // Phase 4: All agents walk to conference room + Flora generates report
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ¢ Team assembling for report generation...',
  })

  store.setConferenceMode(true)
  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  agentIds.forEach((id, i) => {
    setTimeout(() => moveAgentToConference(id), i * 200)
  })

  await sleep(1500)

  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ“ Generating mission report...',
  })

  moveAgentTo('flora', { x: 80, y: 22 }) // Flora walks to printer

  const reportContent = await callAgent(
    'flora',
    `Generate a comprehensive mission report for: "${mission}"

Based on team analysis:
- ARCHITECTURE (REX): ${rexResponse}
- STRATEGY (FLORA): ${floraResponse}
- RESEARCH (NOVA): ${novaResponse}
- SECURITY (BYTE): ${byteResponse}
- UX/SYNTHESIS (SAGE): ${sageResponse}

Format as structured Markdown:
# Mission Report: [title]
## Executive Summary
## Key Findings (by specialty)
## Recommendations (prioritized list)
## Risk Assessment
## Next Steps

Be comprehensive and actionable.`,
    apiKey
  )

  store.addReport({
    title: `Mission Report: ${mission.slice(0, 50)}${mission.length > 50 ? '...' : ''}`,
    content: reportContent,
    agentIds: ['rex', 'nova', 'sage', 'byte', 'flora'],
    type: 'mission_result',
  })

  const missionReports = useAgentStore.getState().reports
  const newMissionReport = missionReports[0]
  if (newMissionReport) store.setActiveReport(newMissionReport.id)

  store.addFeedItem({
    agentId: 'system',
    type: 'report',
    message: 'ðŸ“„ Mission report ready â€” click to open.',
    reportId: newMissionReport?.id,
  })

  // Return agents to desks
  await sleep(1000)
  store.setConferenceMode(false)
  returnAllAgentsToDesks()
}

// =============================================
// GITHUB REVIEW MODE
// =============================================

export async function runGithubReview(
  repoUrl: string,
  reviewType: string,
  apiKey: string
): Promise<void> {
  const store = useAgentStore.getState()
  store.setIsRunning(true)
  store.clearFeed()

  if (!apiKey) {
    store.addFeedItem({
      agentId: 'system',
      type: 'error',
      message: 'âš  Enter your Gemini API key in the top bar.',
    })
    store.setIsRunning(false)
    return
  }

  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: `ðŸ™ Loading repository: ${repoUrl}`,
  })

  // All agents walk to conference room
  store.setConferenceMode(true)
  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  agentIds.forEach((id, i) => {
    setTimeout(() => moveAgentToConference(id), i * 300)
  })

  // Fetch repo data via GitHub API
  let fileTree: GitHubFile[] = []
  let fileContents: Record<string, string> = {}

  try {
    const { fetchRepoTree, fetchSelectedFiles } = await import('./github')

    store.addFeedItem({
      agentId: 'nova',
      type: 'action',
      message: 'NOVA: Scanning repository structure...',
    })

    fileTree = await fetchRepoTree(repoUrl)

    store.addFeedItem({
      agentId: 'nova',
      type: 'result',
      message: `NOVA: Found ${fileTree.length} files. Fetching key files...`,
    })

    fileContents = await fetchSelectedFiles(fileTree)

    store.addFeedItem({
      agentId: 'nova',
      type: 'result',
      message: `NOVA: Loaded ${Object.keys(fileContents).length} files for analysis.`,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    store.addFeedItem({
      agentId: 'system',
      type: 'error',
      message: `Repository load failed: ${msg}`,
    })
    store.setIsRunning(false)
    store.setConferenceMode(false)
    return
  }

  const fileList = fileTree.map((f) => f.path).join('\n')
  const codeContext = Object.entries(fileContents)
    .map(([path, content]) => `=== ${path} ===\n${content}`)
    .join('\n\n')

  const repoContext = `Repository: ${repoUrl}
Review type: ${reviewType}

FILE STRUCTURE:
${fileList}

KEY FILE CONTENTS:
${codeContext}`

  await sleep(2000) // Let agents walk to conference room

  // Phase 1: Parallel specialist reviews
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ” Team reviewing the codebase...',
  })

  const [rexReview, sageReview, byteReview] = await Promise.all([
    callAgent('rex', `Review this repository's architecture and backend design for: ${reviewType}`, apiKey, {
      additionalContext: repoContext,
    }),
    callAgent('sage', `Review this repository's code quality, UX patterns, and frontend architecture for: ${reviewType}`, apiKey, {
      additionalContext: repoContext,
    }),
    callAgent('byte', `Review this repository for security vulnerabilities for: ${reviewType}`, apiKey, {
      additionalContext: repoContext,
    }),
  ])

  await sleep(800)

  // Phase 2: NOVA researches best practices with web search
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸŒ NOVA researching best practices...',
  })

  store.setAgentChatBubble('nova', 'Checking latest docs!', 3000)

  const novaResearch = await callAgent(
    'nova',
    `Research the latest best practices for the tech stack in this repository (${reviewType}). Find recent updates, known issues, and recommended patterns.`,
    apiKey,
    { useSearch: true }
  )

  await sleep(800)

  // Phase 3: FLORA generates final report
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: 'ðŸ“ FLORA synthesizing the final report...',
  })

  const fullReport = await callAgent(
    'flora',
    `Generate a comprehensive code review report for: ${repoUrl}
Review focus: ${reviewType}

TEAM ANALYSIS:
=== REX (Architecture) ===
${rexReview}

=== SAGE (Code Quality & UX) ===
${sageReview}

=== BYTE (Security) ===
${byteReview}

=== NOVA (Research & Best Practices) ===
${novaResearch}

Generate a structured report:
# Code Review: ${repoUrl.split('/').slice(-2).join('/')}
**Review Type:** ${reviewType}
**Date:** ${new Date().toLocaleDateString()}
**Reviewed by:** REX, NOVA, SAGE, BYTE, FLORA

## Executive Summary

## Architecture Analysis (REX)

## Code Quality & UX (SAGE)
### Critical Issues
### Recommendations

## Security Assessment (BYTE)
### Vulnerabilities Found
### Risk Level: [CRITICAL/HIGH/MEDIUM/LOW]

## Research & Best Practices (NOVA)

## Prioritized Action Plan
| Priority | Issue | Owner | Effort | Impact |
|----------|-------|-------|--------|--------|

## Overall Score
Architecture: X/10 | Code Quality: X/10 | Security: X/10 | Performance: X/10
**Overall: X/10**
`,
    apiKey
  )

  store.addReport({
    title: `Code Review: ${repoUrl.split('/').slice(-2).join('/')} â€” ${reviewType}`,
    content: fullReport,
    agentIds: ['rex', 'nova', 'sage', 'byte', 'flora'],
    type: 'github_review',
  })

  const reports = useAgentStore.getState().reports
  if (reports.length > 0) store.setActiveReport(reports[0].id)

  store.addFeedItem({
    agentId: 'system',
    type: 'report',
    message: 'ðŸ“„ Code review report ready! Click to open.',
  })

  await sleep(1500)
  store.setConferenceMode(false)
  returnAllAgentsToDesks()
  store.setIsRunning(false)
}
