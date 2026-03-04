export interface GitHubFile {
  path: string
  name: string
  type: 'file' | 'dir'
  download_url: string | null
  size: number
}

export async function fetchRepoTree(repoUrl: string): Promise<GitHubFile[]> {
  const match = repoUrl.match(/(?:github\.com\/)?([^/]+)\/([^/\s]+)/)
  if (!match) throw new Error('Invalid GitHub URL')

  const [, owner, repo] = match
  const cleanRepo = repo.replace(/\.git$/, '')

  const response = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/HEAD?recursive=1`)

  if (!response.ok) {
    if (response.status === 403) throw new Error('Rate limit exceeded. Try again in a moment.')
    if (response.status === 404) throw new Error('Repository not found. Make sure it\'s public.')
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()

  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cpp', '.c', '.cs', '.rb', '.php', '.swift', '.kt', '.vue', '.svelte', '.html', '.css', '.scss', '.json', '.yaml', '.yml', '.toml', '.env.example', '.md']

  const files: GitHubFile[] = data.tree
    .filter((item: any) => {
      if (item.type !== 'blob') return false
      if (item.path.includes('node_modules/')) return false
      if (item.path.includes('.git/')) return false
      if (item.path.includes('dist/')) return false
      if (item.path.includes('.next/')) return false
      return codeExtensions.some(ext => item.path.endsWith(ext))
    })
    .slice(0, 80)
    .map((item: any) => ({
      path: item.path,
      name: item.path.split('/').pop() || item.path,
      type: 'file' as const,
      download_url: `https://raw.githubusercontent.com/${owner}/${cleanRepo}/HEAD/${item.path}`,
      size: item.size || 0,
    }))

  return files
}

export async function fetchFileContent(downloadUrl: string): Promise<string> {
  const response = await fetch(downloadUrl)
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`)
  const text = await response.text()
  return text.slice(0, 8000) + (text.length > 8000 ? '\n... [truncated]' : '')
}

export async function fetchKeyFiles(files: GitHubFile[]): Promise<Record<string, string>> {
  const priority = ['package.json', 'README.md', 'tsconfig.json', '.env.example', 'schema', 'prisma', 'database', 'auth', 'api', 'middleware', 'layout', 'page', 'component']

  const prioritized = [...files].sort((a, b) => {
    const aScore = priority.findIndex(p => a.path.toLowerCase().includes(p))
    const bScore = priority.findIndex(p => b.path.toLowerCase().includes(p))
    return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore)
  }).slice(0, 15)

  const contents: Record<string, string> = {}

  await Promise.all(
    prioritized
      .filter(f => f.download_url)
      .map(async (file) => {
        try {
          contents[file.path] = await fetchFileContent(file.download_url!)
        } catch {
          // Skip files that fail to load
        }
      })
  )

  return contents
}
