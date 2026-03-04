import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GitHubFile {
  path: string
  name: string
  type: 'file' | 'dir'
  download_url: string | null
  size: number
}

// Parse various GitHub URL formats
export function parseGithubUrl(input: string): { owner: string; repo: string; subpath?: string } | null {
  // Handle: https://github.com/owner/repo
  // Handle: https://github.com/owner/repo/tree/main/src/components
  // Handle: owner/repo
  // Handle: github.com/owner/repo
  const clean = input.trim().replace(/\.git$/, '')
  const match = clean.match(/(?:github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/tree\/[^/]+\/(.*?))?$/)
  if (!match) return null
  return {
    owner: match[1],
    repo: match[2],
    subpath: match[3],
  }
}

// Fetch the full file tree from GitHub
export async function fetchRepoTree(repoUrl: string): Promise<GitHubFile[]> {
  const parsed = parseGithubUrl(repoUrl)
  if (!parsed) throw new Error('Invalid GitHub URL. Format: https://github.com/owner/repo')

  const { owner, repo } = parsed

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: { 'Accept': 'application/vnd.github.v3+json' } }
  )

  if (!response.ok) {
    if (response.status === 403) throw new Error('GitHub rate limit hit. Wait 60 seconds and try again.')
    if (response.status === 404) throw new Error(`Repository "${owner}/${repo}" not found. Is it public?`)
    throw new Error(`GitHub API error ${response.status}`)
  }

  const data = await response.json()

  const CODE_EXTENSIONS = [
    '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte',
    '.py', '.go', '.rs', '.rb', '.php', '.java', '.kt', '.swift', '.cs',
    '.css', '.scss', '.sass', '.less',
    '.html', '.htm',
    '.json', '.yaml', '.yml', '.toml', '.env.example',
    '.md', '.mdx', '.txt',
    '.sql', '.prisma', '.graphql',
    'Dockerfile', '.dockerignore', '.gitignore',
  ]

  const SKIP_DIRS = ['node_modules', 'dist', 'build', '.next', '.git', '.vercel', 'coverage', '__pycache__', '.cache', 'vendor']

  return data.tree
    .filter((item: any) => {
      if (item.type !== 'blob') return false
      if (SKIP_DIRS.some(d => item.path.includes(`${d}/`))) return false
      const hasCodeExt = CODE_EXTENSIONS.some(ext =>
        ext.startsWith('.') ? item.path.endsWith(ext) : item.path.endsWith(`/${ext}`) || item.path === ext
      )
      return hasCodeExt
    })
    .map((item: any) => ({
      path: item.path,
      name: item.path.split('/').pop() || item.path,
      type: 'file' as const,
      download_url: `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${item.path}`,
      size: item.size || 0,
    }))
}

// AI-powered file prioritization based on natural language request
export async function selectFilesForReview(
  files: GitHubFile[],
  reviewRequest: string,
  apiKey: string
): Promise<{ selected: GitHubFile[]; strategy: string; focusAreas: string[] }> {
  const client = new GoogleGenerativeAI(apiKey)
  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const fileList = files.map(f => `${f.path} (${f.size} bytes)`).join('\n')

  const prompt = `You are a senior engineering lead. A developer wants a code review with this request:

"${reviewRequest}"

Here is the complete file tree of the repository:
${fileList}

Based on the review request, select the most relevant files to analyze. Return ONLY valid JSON (no markdown, no explanation):
{
  "strategy": "One sentence describing your file selection approach",
  "focusAreas": ["area1", "area2", "area3"],
  "selectedPaths": ["path/to/file1.tsx", "path/to/file2.ts", ...]
}

Rules:
- Select 10-20 files maximum
- Prioritize files most relevant to the review type
- For frontend/design reviews: focus on components, styles, pages
- For security reviews: focus on auth, API routes, middleware, env files
- For architecture reviews: focus on config, schema, API structure
- For UX reviews: focus on components, pages, CSS/Tailwind files
- Always include package.json and README.md if present
- Do not include test files unless the review is specifically about tests`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    const selectedFiles = files.filter(f => parsed.selectedPaths.includes(f.path))

    return {
      selected: selectedFiles.length > 0 ? selectedFiles : files.slice(0, 15),
      strategy: parsed.strategy || 'General file selection',
      focusAreas: parsed.focusAreas || [reviewRequest],
    }
  } catch {
    // Fallback: heuristic selection
    return {
      selected: heuristicFileSelect(files, reviewRequest),
      strategy: 'Heuristic selection based on review type',
      focusAreas: [reviewRequest],
    }
  }
}

function heuristicFileSelect(files: GitHubFile[], request: string): GitHubFile[] {
  const req = request.toLowerCase()
  const priority: string[] = []

  if (req.includes('frontend') || req.includes('design') || req.includes('ui') || req.includes('ux')) {
    priority.push('component', 'page', 'layout', 'style', 'css', 'scss', 'tailwind', 'globals', 'app')
  }
  if (req.includes('security') || req.includes('auth') || req.includes('vulnerability')) {
    priority.push('auth', 'middleware', 'route', 'api', 'env', 'session', 'token', 'prisma')
  }
  if (req.includes('architecture') || req.includes('backend') || req.includes('api')) {
    priority.push('api', 'route', 'schema', 'config', 'lib', 'util', 'server', 'db')
  }
  if (req.includes('performance') || req.includes('speed') || req.includes('optimize')) {
    priority.push('page', 'layout', 'component', 'next.config', 'webpack', 'bundle')
  }

  // Always include these
  const alwaysInclude = ['package.json', 'README.md', 'tsconfig.json', 'next.config']

  const scored = files.map(f => {
    let score = 0
    const pathLower = f.path.toLowerCase()

    if (alwaysInclude.some(a => pathLower.includes(a.toLowerCase()))) score += 100
    for (const p of priority) {
      if (pathLower.includes(p)) score += 10
    }
    // Penalize deep nesting
    const depth = f.path.split('/').length
    score -= depth * 0.5

    return { file: f, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map(s => s.file)
}

// Fetch file contents with concurrency limit
export async function fetchSelectedFiles(
  files: GitHubFile[],
  onProgress?: (path: string, index: number, total: number) => void
): Promise<Record<string, string>> {
  const contents: Record<string, string> = {}
  const CONCURRENCY = 4
  const MAX_FILE_CHARS = 6000

  // Process in batches
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async (file, batchIndex) => {
        if (!file.download_url) return
        try {
          const res = await fetch(file.download_url)
          if (!res.ok) return
          const text = await res.text()
          contents[file.path] = text.length > MAX_FILE_CHARS
            ? text.slice(0, MAX_FILE_CHARS) + `\n\n... [file truncated at ${MAX_FILE_CHARS} chars]`
            : text
          if (onProgress) {
            onProgress(file.path, i + batchIndex + 1, files.length)
          }
        } catch {
          // Skip files that error
        }
      })
    )
    // Small delay between batches to avoid rate limiting
    if (i + CONCURRENCY < files.length) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return contents
}
