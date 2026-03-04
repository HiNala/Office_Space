import { Report } from '@/types'

export function downloadReport(report: Report) {
  const blob = new Blob([report.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Strip emoji and special chars, collapse multiple underscores
  const safeName = report.title
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .slice(0, 80)
  a.download = `${safeName || 'report'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

export function markdownToHtml(md: string): string {
  let html = md

  // Fenced code blocks (``` ... ```)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold + italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Markdown tables
  html = html.replace(
    /(\|.+\|\r?\n)((?:\|[-:| ]+\|\r?\n))((?:\|.+\|\r?\n?)*)/gm,
    (_, header, _sep, body) => {
      const parseRow = (row: string) =>
        row
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim())

      const headerCells = parseRow(header)
      const bodyCells = body
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((row: string) => parseRow(row))

      const thead = `<thead><tr>${headerCells.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`
      const tbody = `<tbody>${bodyCells
        .map((row: string[]) => `<tr>${row.map((c: string) => `<td>${c}</td>`).join('')}</tr>`)
        .join('')}</tbody>`

      return `<table>${thead}${tbody}</table>`
    }
  )

  // Ordered lists — convert consecutive `N. item` lines to <ol>
  html = html.replace(
    /((?:^\d+\. .+$\n?)+)/gm,
    (block) => {
      const items = block
        .trim()
        .split('\n')
        .map((line) => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`)
        .join('')
      return `<ol>${items}</ol>`
    }
  )

  // Unordered lists — convert consecutive `- item` or `* item` lines to <ul>
  html = html.replace(
    /((?:^[*-] .+$\n?)+)/gm,
    (block) => {
      const items = block
        .trim()
        .split('\n')
        .map((line) => `<li>${line.replace(/^[*-]\s*/, '')}</li>`)
        .join('')
      return `<ul>${items}</ul>`
    }
  )

  // Paragraphs — wrap non-tag lines in <p>
  html = html
    .split('\n\n')
    .map((para) => {
      para = para.trim()
      if (!para) return ''
      if (/^<[houptl]/.test(para)) return para
      return `<p>${para.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr />')

  return html
}
