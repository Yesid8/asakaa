/**
 * Export utility functions
 * @module utils/export
 */

import type { Board, ExportOptions, ExportFormat } from '../types'

/**
 * Export board to JSON format
 */
export function exportToJSON(board: Board, _options?: ExportOptions): string {
  const data = {
    board: {
      id: board.id,
      title: board.title,
      metadata: board.metadata,
      exportedAt: new Date().toISOString(),
    },
    columns: board.columns,
    cards: board.cards,
    options: _options,
  }

  return JSON.stringify(data, null, 2)
}

/**
 * Export board to CSV format
 */
export function exportToCSV(board: Board, _options?: ExportOptions): string {
  const headers = [
    'Card ID',
    'Title',
    'Description',
    'Column',
    'Priority',
    'Labels',
    'Assigned Users',
    'Start Date',
    'End Date',
    'Created At',
    'Updated At',
  ]

  const rows = board.cards.map((card) => {
    const column = board.columns.find((col) => col.id === card.columnId)

    return [
      card.id,
      escapeCSV(card.title),
      escapeCSV(card.description || ''),
      escapeCSV(column?.title || ''),
      card.priority || '',
      (card.labels || []).join(';'),
      (card.assignedUserIds || []).join(';'),
      card.startDate || '',
      card.endDate || '',
      card.createdAt || '',
      card.updatedAt || '',
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Export board to Markdown format
 */
export function exportToMarkdown(board: Board, _options?: ExportOptions): string {
  let md = `# ${board.title || 'Kanban Board'}\n\n`
  md += `*Exported on ${new Date().toLocaleString()}*\n\n`
  md += `---\n\n`

  board.columns.forEach((column) => {
    const columnCards = board.cards.filter((card) => card.columnId === column.id)

    md += `## ${column.title}\n\n`

    if (columnCards.length === 0) {
      md += `*No cards in this column*\n\n`
    } else {
      columnCards.forEach((card) => {
        md += `### ${card.title}\n\n`

        if (card.description) {
          md += `${card.description}\n\n`
        }

        const metadata: string[] = []
        if (card.priority) metadata.push(`**Priority:** ${card.priority}`)
        if (card.labels && card.labels.length > 0) {
          metadata.push(`**Labels:** ${card.labels.join(', ')}`)
        }
        if (card.assignedUserIds && card.assignedUserIds.length > 0) {
          metadata.push(`**Assigned:** ${card.assignedUserIds.length} user(s)`)
        }
        if (card.startDate || card.endDate) {
          const dates = []
          if (card.startDate) dates.push(`Start: ${card.startDate}`)
          if (card.endDate) dates.push(`End: ${card.endDate}`)
          metadata.push(`**Dates:** ${dates.join(' → ')}`)
        }

        if (metadata.length > 0) {
          md += metadata.join(' • ') + '\n\n'
        }

        md += `---\n\n`
      })
    }
  })

  return md
}

/**
 * Escape CSV field
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Main export function
 */
export function exportBoard(
  board: Board,
  format: ExportFormat,
  options?: ExportOptions
): string {
  switch (format) {
    case 'json':
      return exportToJSON(board, options)
    case 'csv':
      return exportToCSV(board, options)
    case 'markdown':
      return exportToMarkdown(board, options)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Download exported data as file
 */
export function downloadExport(
  content: string,
  format: ExportFormat,
  filename?: string
): void {
  const defaultFilename = `board-export-${new Date().getTime()}`
  const extensions: Record<ExportFormat, string> = {
    json: 'json',
    csv: 'csv',
    markdown: 'md',
  }

  const finalFilename = filename || `${defaultFilename}.${extensions[format]}`

  const mimeTypes: Record<ExportFormat, string> = {
    json: 'application/json',
    csv: 'text/csv',
    markdown: 'text/markdown',
  }

  const blob = new Blob([content], { type: mimeTypes[format] })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
