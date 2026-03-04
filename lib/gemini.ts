import { GoogleGenerativeAI } from '@google/generative-ai'
import { AgentId } from '@/types'
import { AGENT_DEFAULTS, DESK_POSITIONS, CONFERENCE_POSITIONS, AGENT_IDLE_CHATS } from '@/lib/agents'
import { useAgentStore } from '@/store/useAgentStore'

function getModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================
// SUPER POWER PROMPTS
// =============================================

const SUPER_POWER_PROMPTS: Record<AgentId, string> = {
  rex: `BLUEPRINT MODE ACTIVATED. Generate a complete system architecture for the given topic/context. Include:
- System diagram (text-based ASCII art)
- Complete tech stack recommendation with justifications
- Database schema design
- API endpoints overview  
- Infrastructure and deployment recommendations
- Estimated build timeline and team size
Be comprehensive, specific, and format with clear ## sections.`,

  nova: `DEEP SCAN ACTIVATED. Conduct a comprehensive research scan on the given topic. Generate:
- 5 key findings from different angles
- Competitive landscape overview with named competitors
- Latest trends and relevant data points
- Risk factors and emerging opportunities
- Synthesized intelligence brief with actionable insights
Be thorough, cite your reasoning, and surface non-obvious insights.`,

  sage: `X-RAY VISION ACTIVATED. Generate a prioritized list of exactly 10 critical improvements for the given topic:
For each item provide:
- Priority level: Critical / High / Medium / Low
- What the issue is (specific)
- Why it matters (user/business impact)
- Recommended fix with implementation detail
- Estimated effort (hours/days)
Be brutally honest, constructive, and reference design principles.`,

  byte: `THREAT MATRIX ACTIVATED. Run a full security audit on the given topic. Generate a CVE-style vulnerability report:
- List all potential vulnerabilities found
- Severity rating for each: CRITICAL / HIGH / MEDIUM / LOW
- Attack vector description (how an attacker would exploit it)
- Impact assessment (what data/systems are at risk)
- Recommended mitigation steps
- Overall risk score out of 10
Think like an attacker. Miss nothing.`,

  flora: `VISION BOARD ACTIVATED. Generate a complete 90-day product roadmap for the given context:
- Week 1-2: Foundation & quick wins
- Week 3-4: Core feature delivery
- Month 2: Growth and iteration
- Month 3: Scale and optimize
For each phase include:
- KPIs and success metrics
- Risk assessment and mitigation
- Resource requirements
- Key dependencies and blockers
Be strategic, user-focused, and ruthlessly prioritized.`,
}

// =============================================
// SUPER POWERS
// =============================================

export async function activateSuperPower(agentId: AgentId, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()
  const agentDef = AGENT_DEFAULTS[agentId]

  store.updateAgent(agentId, { superPowerActive: true })
  store.triggerScreenFlash()

  store.addFeedItem({
    agentId,
    type: 'superpower',
    message: `⚡ ${agentDef.name} activating ${agentDef.superPowerName}...`,
  })
  store.setAgentChatBubble(agentId, `⚡ ${agentDef.superPowerName}!`, 8000)

  if (!apiKey) {
    store.addFeedItem({
      agentId,
      type: 'error',
      message: `Enter your Gemini API key to activate ${agentDef.superPowerName}.`,
    })
    store.updateAgent(agentId, { superPowerActive: false })
    return
  }

  try {
    const model = getModel(apiKey)
    const mission = store.currentMission || 'the OFFICE SPACE application itself — a multi-agent AI office simulator'
    const prompt = `${agentDef.systemPrompt}\n\n${SUPER_POWER_PROMPTS[agentId]}\n\nContext/Topic: ${mission}`

    store.updateAgent(agentId, { state: 'working' })

    let fullResponse = ''
    const result = await model.generateContentStream(prompt)
    for await (const chunk of result.stream) {
      fullResponse += chunk.text()
    }

    store.addReport({
      title: `⚡ ${agentDef.name}: ${agentDef.superPowerName}`,
      content: fullResponse,
      agentIds: [agentId],
      type: 'superpower',
    })

    const latestReports = useAgentStore.getState().reports
    if (latestReports.length > 0) {
      store.setActiveReport(latestReports[0].id)
    }

    store.addFeedItem({
      agentId,
      type: 'result',
      message: `✅ ${agentDef.superPowerName} complete — report ready`,
    })
    store.setAgentChatBubble(agentId, 'Done! Check the report →', 5000)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    store.addFeedItem({
      agentId,
      type: 'error',
      message: `⚠ ${agentDef.superPowerName} failed: ${msg}`,
    })
  } finally {
    store.updateAgent(agentId, { state: 'idle', superPowerActive: false })
  }
}

// =============================================
// MISSION RUNNER
// =============================================

export async function runMission(mission: string, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()

  if (!apiKey) {
    store.addFeedItem({
      agentId: 'system',
      type: 'error',
      message: '⚠ No API key configured. Enter your Gemini key in the top bar.',
    })
    store.setIsRunning(false)
    return
  }

  store.clearFeed()
  store.addFeedItem({ agentId: 'system', type: 'action', message: `🎯 Mission: "${mission}"` })

  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  const activeAgents = agentIds.filter((id) => store.agents[id].isActive)

  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'thinking' })
    store.setAgentChatBubble(id, 'Reading the brief...', 3000)
  })

  await sleep(1500)

  const responses: Partial<Record<AgentId, string>> = {}

  for (const agentId of activeAgents) {
    const agentDef = AGENT_DEFAULTS[agentId]
    const agent = useAgentStore.getState().agents[agentId]

    store.updateAgent(agentId, { state: 'working' })
    store.setAgentChatBubble(agentId, 'On it...', 8000)
    store.addFeedItem({ agentId, type: 'reasoning', message: `Analyzing from ${agentDef.role} perspective...` })

    try {
      const model = getModel(apiKey)
      const prompt = `${agentDef.systemPrompt}

Mission from the team: "${mission}"

Respond in 3-5 sentences from your specific role and expertise. Start with "${agentDef.name}:". Be specific about what you will contribute and any concerns from your domain. End with one concrete action you are taking right now.`

      let response = ''
      const result = await model.generateContentStream(prompt)
      for await (const chunk of result.stream) {
        response += chunk.text()
      }

      responses[agentId] = response

      store.updateAgent(agentId, {
        state: 'chatting',
        conversationHistory: [
          ...agent.conversationHistory,
          { role: 'user', parts: [{ text: mission }] },
          { role: 'model', parts: [{ text: response }] },
        ],
      })

      const firstSentence = response.replace(/^[A-Z]+:\s*/, '').split('.')[0] + '.'
      store.setAgentChatBubble(agentId, firstSentence.slice(0, 80), 7000)
      store.addFeedItem({ agentId, type: 'chat', message: response })
      await sleep(300)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      store.addFeedItem({ agentId, type: 'error', message: `Error: ${msg}` })
    }
  }

  // Agents walk to conference room
  await sleep(800)
  store.setConferenceMode(true)
  store.addFeedItem({ agentId: 'system', type: 'action', message: '🏢 Team assembling in conference room...' })

  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'conference', position: CONFERENCE_POSITIONS[id] })
  })

  await sleep(2000)

  // Synthesize team report
  store.addFeedItem({ agentId: 'system', type: 'reasoning', message: '🧠 Synthesizing team intelligence...' })

  try {
    const model = getModel(apiKey)
    const teamContext = activeAgents
      .filter((id) => responses[id])
      .map((id) => `${AGENT_DEFAULTS[id].name} (${AGENT_DEFAULTS[id].role}):\n${responses[id]}`)
      .join('\n\n---\n\n')

    const reportPrompt = `You are the synthesis AI for an elite 5-person AI agent team called OFFICE SPACE. The team has analyzed the following mission.

MISSION: "${mission}"

TEAM ANALYSIS:
${teamContext}

Generate a comprehensive, well-structured mission report that:
1. Opens with an executive summary (2-3 sentences)
2. Has a section for each team member's key contributions and findings
3. Identifies cross-functional synergies and conflicts
4. Provides a prioritized action plan (numbered, with owner)
5. Lists top 3 risks with mitigation
6. Closes with success metrics

Use ## for section headers. Be thorough, specific, and actionable.`

    let reportContent = ''
    const reportResult = await model.generateContentStream(reportPrompt)
    for await (const chunk of reportResult.stream) {
      reportContent += chunk.text()
    }

    store.addReport({
      title: `Mission: ${mission.slice(0, 60)}${mission.length > 60 ? '...' : ''}`,
      content: reportContent,
      agentIds: activeAgents,
      type: 'mission_result',
    })

    const latestReports = useAgentStore.getState().reports
    if (latestReports.length > 0) store.setActiveReport(latestReports[0].id)

    store.addFeedItem({ agentId: 'system', type: 'report', message: '📄 Mission report ready — open in right panel' })

    activeAgents.forEach((id) => {
      const randomChat = AGENT_IDLE_CHATS[id][Math.floor(Math.random() * AGENT_IDLE_CHATS[id].length)]
      store.setAgentChatBubble(id, randomChat, 5000)
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    store.addFeedItem({ agentId: 'system', type: 'error', message: `Report synthesis failed: ${msg}` })
  }

  await sleep(2500)
  store.setConferenceMode(false)
  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'idle', position: { ...DESK_POSITIONS[id] } })
  })
  store.setIsRunning(false)
}

// =============================================
// GITHUB REVIEW
// =============================================

export async function runGithubReview(repoUrl: string, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()

  if (!apiKey) {
    store.addFeedItem({ agentId: 'system', type: 'error', message: '⚠ No API key configured.' })
    store.setIsRunning(false)
    return
  }

  store.clearFeed()
  store.addFeedItem({ agentId: 'system', type: 'action', message: `🔍 GitHub Review: ${repoUrl}` })

  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  const activeAgents = agentIds.filter((id) => store.agents[id].isActive)

  store.setConferenceMode(true)
  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'conference', position: CONFERENCE_POSITIONS[id] })
    store.setAgentChatBubble(id, 'Reviewing repo...', 6000)
  })

  await sleep(1500)

  // Fetch GitHub repo info
  let repoInfo = ''
  try {
    const repoPath = repoUrl.replace('https://github.com/', '').replace(/\/$/, '')
    const [owner, repo] = repoPath.split('/')

    store.addFeedItem({ agentId: 'nova', type: 'search', message: `🔍 Fetching repo: ${owner}/${repo}` })

    const [repoRes, readmeRes, languagesRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`),
    ])

    if (repoRes.ok) {
      const repoData = await repoRes.json()
      repoInfo += `Repository: ${repoData.full_name}\n`
      repoInfo += `Description: ${repoData.description || 'No description'}\n`
      repoInfo += `Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}\n`
      repoInfo += `Primary language: ${repoData.language}\n`
      repoInfo += `Open issues: ${repoData.open_issues_count}\n`
      repoInfo += `Last updated: ${repoData.updated_at}\n`
    }

    if (languagesRes.ok) {
      const langs = await languagesRes.json()
      repoInfo += `Languages: ${Object.keys(langs).join(', ')}\n`
    }

    if (readmeRes.ok) {
      const readmeData = await readmeRes.json()
      const readmeText = atob(readmeData.content.replace(/\n/g, ''))
      repoInfo += `\nREADME (excerpt):\n${readmeText.slice(0, 2000)}`
    }

    store.addFeedItem({ agentId: 'nova', type: 'result', message: '✅ Repo data fetched successfully' })
  } catch {
    store.addFeedItem({ agentId: 'nova', type: 'error', message: 'GitHub fetch failed — analyzing URL only' })
    repoInfo = `Repository URL: ${repoUrl}`
  }

  // Each agent reviews from their perspective
  const responses: Partial<Record<AgentId, string>> = {}
  const reviewFocus: Partial<Record<AgentId, string>> = {
    rex: 'architecture quality, tech stack choices, database design, scalability concerns, infrastructure decisions',
    nova: 'documentation quality, README completeness, community health, similar projects, competitive landscape',
    sage: 'code organization, component structure, UX in the code, accessibility, maintainability',
    byte: 'security vulnerabilities, dependency risks, authentication patterns, data exposure, attack vectors',
    flora: 'product positioning, feature completeness, user-facing quality, roadmap suggestions, go-to-market readiness',
  }

  for (const agentId of activeAgents) {
    const agentDef = AGENT_DEFAULTS[agentId]
    store.updateAgent(agentId, { state: 'working' })
    store.setAgentChatBubble(agentId, 'Reviewing...', 8000)
    store.addFeedItem({ agentId, type: 'reasoning', message: `Reviewing from ${agentDef.role} lens...` })

    try {
      const model = getModel(apiKey)
      const prompt = `${agentDef.systemPrompt}

You are reviewing a GitHub repository for the team.

REPOSITORY INFO:
${repoInfo}

YOUR FOCUS: ${reviewFocus[agentId] || 'General review'}

Provide your expert review in 4-6 sentences. Start with "${agentDef.name}:". Be specific and reference actual details from the repo info. End with your top recommendation.`

      let response = ''
      const result = await model.generateContentStream(prompt)
      for await (const chunk of result.stream) response += chunk.text()

      responses[agentId] = response
      const bubble = response.replace(/^[A-Z]+:\s*/, '').split('.')[0] + '.'
      store.setAgentChatBubble(agentId, bubble.slice(0, 80), 7000)
      store.addFeedItem({ agentId, type: 'chat', message: response })
      await sleep(300)
    } catch (err) {
      store.addFeedItem({ agentId, type: 'error', message: `Review failed: ${err instanceof Error ? err.message : 'Error'}` })
    }
  }

  // Compile report
  try {
    const model = getModel(apiKey)
    const teamReviews = activeAgents
      .filter((id) => responses[id])
      .map((id) => `${AGENT_DEFAULTS[id].name}:\n${responses[id]}`)
      .join('\n\n')

    const reportPrompt = `Generate a comprehensive GitHub repository review report.

REPOSITORY: ${repoUrl}
REPO INFO: ${repoInfo.slice(0, 500)}

TEAM REVIEWS:
${teamReviews}

Create a structured review report with:
## Executive Summary
## Architecture & Tech Stack (REX)
## Research & Context (NOVA)
## Code Quality & UX (SAGE)
## Security Assessment (BYTE)
## Product Evaluation (FLORA)
## Priority Action Items (numbered, with assigned agent)
## Overall Score: X/10

Be specific, actionable, and reference real details from the repo.`

    let reportContent = ''
    const reportResult = await model.generateContentStream(reportPrompt)
    for await (const chunk of reportResult.stream) reportContent += chunk.text()

    store.addReport({
      title: `GitHub Review: ${repoUrl.split('/').slice(-2).join('/')}`,
      content: reportContent,
      agentIds: activeAgents,
      type: 'github_review',
    })

    const latestReports = useAgentStore.getState().reports
    if (latestReports.length > 0) store.setActiveReport(latestReports[0].id)

    store.addFeedItem({ agentId: 'system', type: 'report', message: '📄 GitHub review report ready' })
  } catch (err) {
    store.addFeedItem({ agentId: 'system', type: 'error', message: `Report failed: ${err instanceof Error ? err.message : 'Error'}` })
  }

  await sleep(2000)
  store.setConferenceMode(false)
  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'idle', position: { ...DESK_POSITIONS[id] } })
  })
  store.setIsRunning(false)
}
