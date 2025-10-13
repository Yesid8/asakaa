/**
 * Export utilities tests
 * Tests for v0.3.0 Export functionality
 */

import { describe, it, expect } from 'vitest'
import { exportBoard, exportToJSON, exportToCSV } from '../export'
import type { Board } from '../../types'

const mockBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  columns: [
    { id: 'col-1', title: 'To Do', position: 1000, cardIds: ['card-1', 'card-2'] },
    { id: 'col-2', title: 'Done', position: 2000, cardIds: ['card-3'] },
  ],
  cards: [
    {
      id: 'card-1',
      title: 'Task 1',
      description: 'Description 1',
      position: 1000,
      columnId: 'col-1',
      priority: 'HIGH',
      labels: ['bug', 'frontend'],
      assignedUserIds: ['user-1'],
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'card-2',
      title: 'Task 2',
      description: 'Description 2',
      position: 2000,
      columnId: 'col-1',
      priority: 'LOW',
    },
    {
      id: 'card-3',
      title: 'Task 3',
      description: 'Description 3',
      position: 1000,
      columnId: 'col-2',
    },
  ],
}

describe('exportToJSON', () => {
  it('exports board to JSON format', () => {
    const result = exportToJSON(mockBoard)

    expect(result).toBeTruthy()
    const parsed = JSON.parse(result)

    expect(parsed.board.id).toBe('board-1')
    expect(parsed.board.title).toBe('Test Board')
    expect(parsed.columns).toHaveLength(2)
    expect(parsed.cards).toHaveLength(3)
  })

  it('includes exportedAt timestamp', () => {
    const result = exportToJSON(mockBoard)
    const parsed = JSON.parse(result)

    expect(parsed.board.exportedAt).toBeDefined()
    expect(new Date(parsed.board.exportedAt).getTime()).toBeGreaterThan(0)
  })

  it('preserves column data', () => {
    const result = exportToJSON(mockBoard)
    const parsed = JSON.parse(result)

    expect(parsed.columns[0].id).toBe('col-1')
    expect(parsed.columns[0].title).toBe('To Do')
    expect(parsed.columns[1].id).toBe('col-2')
    expect(parsed.columns[1].title).toBe('Done')
  })

  it('preserves card data', () => {
    const result = exportToJSON(mockBoard)
    const parsed = JSON.parse(result)

    expect(parsed.cards[0].id).toBe('card-1')
    expect(parsed.cards[0].title).toBe('Task 1')
    expect(parsed.cards[0].priority).toBe('HIGH')
    expect(parsed.cards[0].labels).toEqual(['bug', 'frontend'])
  })

  it('handles board without metadata', () => {
    const boardWithoutMetadata = { ...mockBoard }
    delete boardWithoutMetadata.metadata

    const result = exportToJSON(boardWithoutMetadata)
    expect(result).toBeTruthy()
  })
})

describe('exportToCSV', () => {
  it('exports board to CSV format', () => {
    const result = exportToCSV(mockBoard)

    expect(result).toBeTruthy()
    expect(result.includes('Card ID,Title,Description')).toBe(true)
  })

  it('includes CSV headers', () => {
    const result = exportToCSV(mockBoard)
    const lines = result.split('\n')

    expect(lines[0]).toContain('Card ID')
    expect(lines[0]).toContain('Title')
    expect(lines[0]).toContain('Description')
    expect(lines[0]).toContain('Column')
    expect(lines[0]).toContain('Priority')
  })

  it('exports all cards', () => {
    const result = exportToCSV(mockBoard)
    const lines = result.split('\n')

    // Header + 3 cards
    expect(lines.length).toBe(4)
  })

  it('includes card data in rows', () => {
    const result = exportToCSV(mockBoard)
    const lines = result.split('\n')

    expect(lines[1]).toContain('card-1')
    expect(lines[1]).toContain('Task 1')
    expect(lines[2]).toContain('card-2')
    expect(lines[2]).toContain('Task 2')
  })

  it('escapes special characters', () => {
    const boardWithSpecialChars: Board = {
      ...mockBoard,
      cards: [
        {
          id: 'card-1',
          title: 'Task, with comma',
          description: 'Description "with quotes"',
          position: 1000,
          columnId: 'col-1',
        },
      ],
    }

    const result = exportToCSV(boardWithSpecialChars)

    // CSV should escape fields with commas and quotes
    expect(result.includes('"Task, with comma"')).toBe(true)
    expect(result.includes('""with quotes""')).toBe(true)
  })

  it('handles cards without optional fields', () => {
    const minimalBoard: Board = {
      id: 'board-1',
      columns: [{ id: 'col-1', title: 'To Do', position: 1000, cardIds: ['card-1'] }],
      cards: [
        {
          id: 'card-1',
          title: 'Simple Task',
          position: 1000,
          columnId: 'col-1',
        },
      ],
    }

    const result = exportToCSV(minimalBoard)
    const lines = result.split('\n')

    expect(lines.length).toBe(2) // Header + 1 card
    expect(lines[1]).toContain('card-1')
    expect(lines[1]).toContain('Simple Task')
  })

  it('joins array fields with semicolons', () => {
    const result = exportToCSV(mockBoard)

    expect(result.includes('bug;frontend')).toBe(true)
  })
})

describe('exportBoard', () => {
  it('exports to JSON when format is json', () => {
    const result = exportBoard(mockBoard, 'json')

    expect(result).toBeTruthy()
    const parsed = JSON.parse(result)
    expect(parsed.board.id).toBe('board-1')
  })

  it('exports to CSV when format is csv', () => {
    const result = exportBoard(mockBoard, 'csv')

    expect(result).toBeTruthy()
    expect(result.includes('Card ID,Title')).toBe(true)
  })

  it('throws error for unsupported format', () => {
    expect(() => {
      exportBoard(mockBoard, 'xml' as any)
    }).toThrow('Unsupported export format')
  })

  it('passes options to export functions', () => {
    const options = { includeArchived: true }

    const result = exportBoard(mockBoard, 'json', options)
    const parsed = JSON.parse(result)

    expect(parsed.options).toEqual(options)
  })
})

describe('Edge cases', () => {
  it('handles board with no cards', () => {
    const emptyBoard: Board = {
      id: 'board-1',
      title: 'Empty Board',
      columns: [{ id: 'col-1', title: 'Column', position: 1000, cardIds: [] }],
      cards: [],
    }

    const jsonResult = exportToJSON(emptyBoard)
    expect(JSON.parse(jsonResult).cards).toHaveLength(0)

    const csvResult = exportToCSV(emptyBoard)
    expect(csvResult.split('\n').length).toBe(1) // Only header
  })

  it('handles board with no columns', () => {
    const noColumnsBoard: Board = {
      id: 'board-1',
      title: 'No Columns',
      columns: [],
      cards: [],
    }

    const result = exportToJSON(noColumnsBoard)
    const parsed = JSON.parse(result)

    expect(parsed.columns).toHaveLength(0)
  })

  it('handles cards with undefined fields', () => {
    const minimalCard: Board = {
      id: 'board-1',
      columns: [{ id: 'col-1', title: 'Column', position: 1000, cardIds: ['card-1'] }],
      cards: [
        {
          id: 'card-1',
          title: 'Minimal',
          position: 1000,
          columnId: 'col-1',
        },
      ],
    }

    const csvResult = exportToCSV(minimalCard)
    expect(csvResult).toBeTruthy()
  })
})
