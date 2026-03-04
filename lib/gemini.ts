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

const SUPER_POWER_PROMPTS: Record<AgentId, string> = {
  rex: `BLUEPRINT MODE ACTIVATED. Generate a complete system architecture for a modern web application. Include:
- Recommended tech stack with justification
- Database schema design
- API structure and key endpoints
- Infrastructure and deployment strategy
- Scalability considerations
Format as a structured technical document with clear ## sections.`,

  nova: `DEEP SCAN ACTIVATED. Perform a deep research synthesis on the latest AI/LLM landscape as of early 2026. Cover:
- Top model capabilities and benchmarks
- Industry adoption trends
- Open source vs proprietary landscape
- Key safety and alignment developments
- What's coming next in 90 days
Format as an intelligence brief with sources cited.`,

  sage: `X-RAY VISION ACTIVATED. Perform a comprehensive UX and code quality review of a typical SaaS dashboard. Generate a prioritized list of exactly 10 critical improvements:
- Each item: severity (Critical/High/Medium/Low), effort estimate, specific fix
- Cover: accessibility, performance, component architecture, UX flows, error states
Format as a numbered review document.`,

  byte: `THREAT MATRIX ACTIVATED. Perform a full security audit of a typical modern web application. Generate a CVE-style report covering:
- Authentication and session management vulnerabilities
- Injection attack surfaces (SQL, XSS, CSRF)
- API security gaps
- Data exposure risks
- Infrastructure security posture
Rate each: CRITICAL / HIGH / MEDIUM / LOW with remediation steps.`,

  flora: `VISION BOARD ACTIVATED. Generate a complete 90-day product roadmap for launching a new B2B SaaS product. Include:
- Month 1: Foundation (must-have features, tech, team)
- Month 2: Traction (beta users, feedback loops, iteration)
- Month 3: Scale (growth levers, pricing, go-to-market)
- KPIs and success metrics per phase
- Top 3 risks with mitigation plans
Format as an executive product roadmap.`,
}

export async function activateSuperPower(agentId: AgentId, apiKey: string): Promise<void> {
  const store = useAgentStore.getState()
  const agentDef = AGENT_DEFAULTS[agentId]

  store.updateAgent(agentId, { state: 'working', superPowerActive: true })
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
      message: 'No API key — enter your Gemini key in the top bar.',
    })
    store.updateAgent(agentId, { state: 'idle', superPowerActive: false })
    return
  }

  try {
    const model = getModel(apiKey)
    const prompt = `${agentDef.systemPrompt}\n\n${SUPER_POWER_PROMPTS[agentId]}`

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
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: `🎯 Mission: "${mission}"`,
  })

  const agentIds: AgentId[] = ['rex', 'nova', 'sage', 'byte', 'flora']
  const activeAgents = agentIds.filter((id) => store.agents[id].isActive)

  // Brief all active agents
  activeAgents.forEach((id) => {
    store.updateAgent(id, { state: 'thinking' })
    store.setAgentChatBubble(id, 'Reading the brief...', 3000)
  })

  await sleep(1500)

  // Each agent responds from their specialty
  const responses: Partial<Record<AgentId, string>> = {}

  for (const agentId of activeAgents) {
    const agentDef = AGENT_DEFAULTS[agentId]
    const agent = useAgentStore.getState().agents[agentId]

    store.updateAgent(agentId, { state: 'working' })
    store.setAgentChatBubble(agentId, 'On it...', 8000)

    store.addFeedItem({
      agentId,
      type: 'reasoning',
      message: `Analyzing from ${agentDef.role} perspective...`,
    })

    try {
      const model = getModel(apiKey)
      const prompt = `${agentDef.systemPrompt}

Mission from the team: "${mission}"

Respond to this mission in 3-5 sentences from your specific role and expertise. Start with your name prefix (${agentDef.name}:). Be specific about what you'll contribute and any concerns from your domain. End with one concrete action you're taking right now.`

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

      // Show truncated first sentence as chat bubble
      const firstSentence = response.replace(/^[A-Z]+:\s*/, '').split('.')[0] + '.'
      store.setAgentChatBubble(agentId, firstSentence.slice(0, 80), 7000)

      store.addFeedItem({
        agentId,
        type: 'chat',
        message: response,
      })

      await sleep(300)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed'
      store.addFeedItem({ agentId, type: 'error', message: `Error: ${msg}` })
    }
  }

  // All agents walk to conference room
  await sleep(800)
  store.setConferenceMode(true)
  store.addFeedItem({
    agentId: 'system',
    type: 'action',
    message: '🏢 Team assembling in conference room...',
  })

  activeAgents.forEach((id) => {
    store.updateAgent(id, {
      state: 'conference',
      position: CONFERENCE_POSITIONS[id],
    })
  })

  await sleep(2000)

  // Generate collaborative cross-agent synthesis
  store.addFeedItem({
    agentId: 'system',
    type: 'reasoning',
    message: '🧠 Synthesizing team intelligence...',
  })

  try {
    const model = getModel(apiKey)

    const teamContext = activeAgents
      .filter((id) => responses[id])
      .map((id) => `${AGENT_DEFAULTS[id].name} (${AGENT_DEFAULTS[id].role}):\n${responses[id]}`)
      .join('\n\n---\n\n')

    const reportPrompt = `You are the synthesis AI for an elite 5-person AI agent team called OFFICE SPACE. The team has analyzed the following mission and each provided their expert perspective.

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

Use ## for section headers. Be thorough, specific, and actionable. This is a deliverable the team will act on.`

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
    if (latestReports.length > 0) {
      store.setActiveReport(latestReports[0].id)
    }

    store.addFeedItem({
      agentId: 'system',
      type: 'report',
      message: '📄 Mission report ready — open in right panel',
    })

    activeAgents.forEach((id) => {
      const randomChat = AGENT_IDLE_CHATS[id][Math.floor(Math.random() * AGENT_IDLE_CHATS[id].length)]
      store.setAgentChatBubble(id, randomChat, 5000)
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    store.addFeedItem({
      agentId: 'system',
      type: 'error',
      message: `Report synthesis failed: ${msg}`,
    })
  }

  // Return agents to desks
  await sleep(2500)
  store.setConferenceMode(false)

  activeAgents.forEach((id) => {
    store.updateAgent(id, {
      state: 'idle',
      position: { ...DESK_POSITIONS[id] },
    })
  })

  store.setIsRunning(false)
}

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

  // Move everyone to conference room immediately
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

    store.addFeedItem({ agentId: 'nova', type: 'result', message: `✅ Repo data fetched successfully` })
  } catch (err) {
    store.addFeedItem({ agentId: 'nova', type: 'error', message: `GitHub fetch failed — analyzing URL only` })
    repoInfo = `Repository URL: ${repoUrl}`
  }

  // Each agent reviews from their perspective
  const responses: Partial<Record<AgentId, string>> = {}
  const reviewPrompts: Partial<Record<AgentId, string>> = {
    rex: 'Focus on: architecture quality, tech stack choices, database design if visible, scalability concerns, infrastructure decisions.',
    nova: 'Focus on: documentation quality, README completeness, community health, similar projects, competitive landscape.',
    sage: 'Focus on: code organization, component structure, UX considerations visible in the code, accessibility, maintainability.',
    byte: 'Focus on: security vulnerabilities, dependency risks, authentication patterns, data exposure, common attack vectors.',
    flora: 'Focus on: product positioning, feature completeness, user-facing quality, roadmap suggestions, go-to-market readiness.',
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

YOUR FOCUS: ${reviewPrompts[agentId] || 'General review'}

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

  // Compile GitHub review report
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
