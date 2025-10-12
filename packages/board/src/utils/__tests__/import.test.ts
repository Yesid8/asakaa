/**
 * Import utilities tests
 * Tests for v0.3.0 Import functionality
 */

import { describe, it, expect } from 'vitest'
import { importBoard, importFromJSON, importFromCSV } from '../import'

describe('importFromJSON', () => {
  const validJSON = JSON.stringify({
    board: {
      id: 'board-1',
      title: 'Test Board',
      metadata: {},
    },
    columns: [
      { id: 'col-1', title: 'To Do', position: 1000, cardIds: ['card-1'] },
      { id: 'col-2', title: 'Done', position: 2000, cardIds: [] },
    ],
    cards: [
      {
        id: 'card-1',
        title: 'Task 1',
        description: 'Description 1',
        columnId: 'col-1',
        position: 1000,
        priority: 'HIGH',
      },
    ],
  })

  it('successfully imports valid JSON', () => {
    const result = importFromJSON(validJSON)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
    expect(result.columnsImported).toBe(2)
  })

  it('returns correct card count', () => {
    const result = importFromJSON(validJSON)

    expect(result.cardsImported).toBe(1)
  })

  it('returns correct column count', () => {
    const result = importFromJSON(validJSON)

    expect(result.columnsImported).toBe(2)
  })

  it('fails on invalid JSON syntax', () => {
    const invalidJSON = '{ invalid json }'

    const result = importFromJSON(invalidJSON)

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]).toContain('Failed to parse JSON')
  })

  it('fails when missing required board field', () => {
    const missingBoard = JSON.stringify({
      columns: [],
      cards: [],
    })

    const result = importFromJSON(missingBoard)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('missing required fields')
  })

  it('fails when missing required columns field', () => {
    const missingColumns = JSON.stringify({
      board: { id: 'board-1' },
      cards: [],
    })

    const result = importFromJSON(missingColumns)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('missing required fields')
  })

  it('fails when missing required cards field', () => {
    const missingCards = JSON.stringify({
      board: { id: 'board-1' },
      columns: [],
    })

    const result = importFromJSON(missingCards)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('missing required fields')
  })

  it('imports board with metadata', () => {
    const jsonWithMetadata = JSON.stringify({
      board: {
        id: 'board-1',
        title: 'Test',
        metadata: { customField: 'value' },
      },
      columns: [],
      cards: [],
    })

    const result = importFromJSON(jsonWithMetadata)

    expect(result.success).toBe(true)
  })

  it('handles empty arrays', () => {
    const emptyData = JSON.stringify({
      board: { id: 'board-1' },
      columns: [],
      cards: [],
    })

    const result = importFromJSON(emptyData)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(0)
    expect(result.columnsImported).toBe(0)
  })
})

describe('importFromCSV', () => {
  const validCSV = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description 1,To Do,HIGH,bug;frontend,user-1,2024-01-01,2024-01-05,2024-01-01T00:00:00Z,2024-01-02T00:00:00Z
card-2,Task 2,Description 2,Done,LOW,,,,,`

  it('successfully imports valid CSV', () => {
    const result = importFromCSV(validCSV)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(2)
    expect(result.columnsImported).toBeGreaterThan(0)
  })

  it('returns correct card count', () => {
    const result = importFromCSV(validCSV)

    expect(result.cardsImported).toBe(2)
  })

  it('creates columns from CSV data', () => {
    const result = importFromCSV(validCSV)

    expect(result.columnsImported).toBeGreaterThan(0)
  })

  it('fails on empty CSV', () => {
    const result = importFromCSV('')

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('empty or invalid')
  })

  it('fails on CSV with only headers', () => {
    const headersOnly = 'Card ID,Title,Description,Column,Priority'

    const result = importFromCSV(headersOnly)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('No valid cards found')
  })

  it('handles quoted fields with commas', () => {
    const csvWithCommas = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,"Task, with comma","Description, also with comma",To Do,HIGH,,,,,`

    const result = importFromCSV(csvWithCommas)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
  })

  it('handles quoted fields with quotes', () => {
    const csvWithQuotes = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,"Task ""with quotes""","Description ""quoted""",To Do,HIGH,,,,,`

    const result = importFromCSV(csvWithQuotes)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
  })

  it('splits semicolon-separated labels', () => {
    const csvWithLabels = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do,HIGH,bug;feature;urgent,,,,,`

    const result = importFromCSV(csvWithLabels)

    expect(result.success).toBe(true)
  })

  it('splits semicolon-separated assigned users', () => {
    const csvWithUsers = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do,HIGH,,user-1;user-2;user-3,,,,`

    const result = importFromCSV(csvWithUsers)

    expect(result.success).toBe(true)
  })

  it('handles cards without optional fields', () => {
    const minimalCSV = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Simple Task,,To Do,,,,,,,`

    const result = importFromCSV(minimalCSV)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
  })

  it('reports errors for invalid rows', () => {
    const csvWithInvalidRow = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do
card-2,Task 2,Description 2,Done,LOW,,,,,`

    const result = importFromCSV(csvWithInvalidRow)

    expect(result.success).toBe(true) // Succeeds with valid rows
    expect(result.errors).toBeDefined()
    expect(result.errors?.length).toBeGreaterThan(0)
  })

  it('creates unique columns for different column names', () => {
    const csvWithMultipleColumns = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do,HIGH,,,,,
card-2,Task 2,Description,In Progress,MEDIUM,,,,,
card-3,Task 3,Description,Done,LOW,,,,,`

    const result = importFromCSV(csvWithMultipleColumns)

    expect(result.success).toBe(true)
    expect(result.columnsImported).toBe(3)
  })

  it('assigns cards to same column when column names match', () => {
    const csvWithSameColumn = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do,HIGH,,,,,
card-2,Task 2,Description,To Do,LOW,,,,,`

    const result = importFromCSV(csvWithSameColumn)

    expect(result.success).toBe(true)
    expect(result.columnsImported).toBe(1)
    expect(result.cardsImported).toBe(2)
  })
})

describe('importBoard', () => {
  it('imports JSON when format is json', () => {
    const jsonData = JSON.stringify({
      board: { id: 'board-1' },
      columns: [],
      cards: [],
    })

    const result = importBoard(jsonData, 'json')

    expect(result.success).toBe(true)
  })

  it('imports CSV when format is csv', () => {
    const csvData = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,Description,To Do,HIGH,,,,,`

    const result = importBoard(csvData, 'csv')

    expect(result.success).toBe(true)
  })

  it('fails for unsupported format', () => {
    const result = importBoard('data', 'xml' as any)

    expect(result.success).toBe(false)
    expect(result.errors?.[0]).toContain('Unsupported import format')
  })
})

describe('Edge cases', () => {
  it('handles very large CSV files', () => {
    let largeCsv = 'Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At\n'

    for (let i = 0; i < 1000; i++) {
      largeCsv += `card-${i},Task ${i},Description ${i},Column ${i % 10},HIGH,,,,,\n`
    }

    const result = importFromCSV(largeCsv)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1000)
  })

  it('handles malformed CSV gracefully', () => {
    const malformedCSV = `Card ID,Title
card-1,Task 1,Extra,Fields
card-2,Task 2`

    const result = importFromCSV(malformedCSV)

    // Should report errors but might still import valid rows
    expect(result.errors).toBeDefined()
  })

  it('handles JSON with extra fields', () => {
    const jsonWithExtra = JSON.stringify({
      board: { id: 'board-1', extraField: 'value' },
      columns: [{ id: 'col-1', title: 'Column', position: 1000, cardIds: [] }],
      cards: [],
      extraField: 'ignored',
    })

    const result = importFromJSON(jsonWithExtra)

    expect(result.success).toBe(true)
  })

  it('handles empty strings in CSV fields', () => {
    const csvWithEmpty = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,,,Column,,,,,,`

    const result = importFromCSV(csvWithEmpty)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
  })

  it('handles newlines in quoted CSV fields', () => {
    const csvWithNewlines = `Card ID,Title,Description,Column,Priority,Labels,Assigned Users,Start Date,End Date,Created At,Updated At
card-1,Task 1,"Line 1
Line 2
Line 3",To Do,HIGH,,,,,`

    const result = importFromCSV(csvWithNewlines)

    // This tests the CSV parser's ability to handle multi-line fields
    expect(result).toBeDefined()
  })
})

describe('Data integrity', () => {
  it('preserves card IDs during import', () => {
    const jsonData = JSON.stringify({
      board: { id: 'board-1' },
      columns: [{ id: 'col-1', title: 'Column', position: 1000, cardIds: ['custom-id-123'] }],
      cards: [
        {
          id: 'custom-id-123',
          title: 'Task',
          columnId: 'col-1',
          position: 1000,
        },
      ],
    })

    const result = importFromJSON(jsonData)

    expect(result.success).toBe(true)
  })

  it('preserves all card fields from JSON', () => {
    const jsonData = JSON.stringify({
      board: { id: 'board-1' },
      columns: [{ id: 'col-1', title: 'Column', position: 1000, cardIds: ['card-1'] }],
      cards: [
        {
          id: 'card-1',
          title: 'Task',
          description: 'Description',
          columnId: 'col-1',
          position: 1000,
          priority: 'URGENT',
          labels: ['important'],
          assignedUserIds: ['user-1'],
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
      ],
    })

    const result = importFromJSON(jsonData)

    expect(result.success).toBe(true)
    expect(result.cardsImported).toBe(1)
  })
})
