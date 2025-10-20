/**
 * Tests for useBoardState hook
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useBoardState } from '../useBoardState'
import type { BoardData, ColumnData, CardData } from '@asakaa/core'

describe('useBoardState', () => {
  let boardData: BoardData
  let columnData: Omit<ColumnData, 'createdAt' | 'updatedAt'>
  let cardData: Omit<CardData, 'createdAt' | 'updatedAt'>

  beforeEach(() => {
    boardData = {
      id: 'board-1',
      title: 'Test Board',
      description: 'Test Description',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    columnData = {
      id: 'col-1',
      title: 'To Do',
      position: 0,
      boardId: 'board-1'
    }

    cardData = {
      id: 'card-1',
      title: 'Test Card',
      description: 'Test card description',
      columnId: 'col-1',
      position: 0,
      boardId: 'board-1'
    }
  })

  describe('Board Operations', () => {
    it('should set and get board', () => {
      const board = useBoardState()

      board.setBoard(boardData)
      const retrieved = board.getBoard()

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe('board-1')
      expect(retrieved?.title).toBe('Test Board')
    })

    it('should update board', () => {
      const board = useBoardState({ initialBoard: boardData })

      board.updateBoard({ title: 'Updated Board' })
      const retrieved = board.getBoard()

      expect(retrieved?.title).toBe('Updated Board')
    })
  })

  describe('Column Operations', () => {
    it('should add column', () => {
      const board = useBoardState({ initialBoard: boardData })

      const column = board.addColumn(columnData)

      expect(column.id).toBe('col-1')
      expect(column.title).toBe('To Do')
      expect(board.getAllColumns()).toHaveLength(1)
    })

    it('should update column', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)

      board.updateColumn('col-1', { title: 'In Progress' })
      const column = board.getColumn('col-1')

      expect(column?.title).toBe('In Progress')
    })

    it('should delete column', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)

      board.deleteColumn('col-1')

      expect(board.getColumn('col-1')).toBeUndefined()
      expect(board.getAllColumns()).toHaveLength(0)
    })

    it('should get all columns', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn({ ...columnData, id: 'col-1' })
      board.addColumn({ ...columnData, id: 'col-2', position: 1 })

      const columns = board.getAllColumns()

      expect(columns).toHaveLength(2)
    })
  })

  describe('Card Operations', () => {
    it('should add card', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)

      const card = board.addCard(cardData)

      expect(card.id).toBe('card-1')
      expect(card.title).toBe('Test Card')
      expect(board.getAllCards()).toHaveLength(1)
    })

    it('should update card', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard(cardData)

      board.updateCard('card-1', { title: 'Updated Card' })
      const card = board.getCard('card-1')

      expect(card?.title).toBe('Updated Card')
    })

    it('should delete card', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard(cardData)

      board.deleteCard('card-1')

      expect(board.getCard('card-1')).toBeUndefined()
      expect(board.getAllCards()).toHaveLength(0)
    })

    it('should move card between columns', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn({ ...columnData, id: 'col-1' })
      board.addColumn({ ...columnData, id: 'col-2', position: 1 })
      board.addCard(cardData)

      board.moveCard('card-1', 'col-2', 0)
      const card = board.getCard('card-1')

      expect(card?.columnId).toBe('col-2')
    })

    it('should get cards by column', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard({ ...cardData, id: 'card-1' })
      board.addCard({ ...cardData, id: 'card-2', position: 1 })

      const cards = board.getCardsByColumn('col-1')

      expect(cards).toHaveLength(2)
    })
  })

  describe('Dependency Operations', () => {
    it('should add dependency', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard({ ...cardData, id: 'card-1' })
      board.addCard({ ...cardData, id: 'card-2', position: 1 })

      board.addDependency('card-2', {
        taskId: 'card-1',
        type: 'finish-to-start'
      })

      const dependencies = board.getDependencies('card-2')
      expect(dependencies).toHaveLength(1)
    })

    it('should remove dependency', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard({ ...cardData, id: 'card-1' })
      board.addCard({ ...cardData, id: 'card-2', position: 1 })

      board.addDependency('card-2', {
        taskId: 'card-1',
        type: 'finish-to-start'
      })

      board.removeDependency('card-2', 'card-1')

      const dependencies = board.getDependencies('card-2')
      expect(dependencies).toHaveLength(0)
    })
  })

  describe('Advanced Operations', () => {
    it('should calculate critical path', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)

      // Create chain of dependencies
      board.addCard({ ...cardData, id: 'card-1', duration: 5 })
      board.addCard({ ...cardData, id: 'card-2', duration: 3, position: 1 })
      board.addCard({ ...cardData, id: 'card-3', duration: 2, position: 2 })

      board.addDependency('card-2', { taskId: 'card-1', type: 'finish-to-start' })
      board.addDependency('card-3', { taskId: 'card-2', type: 'finish-to-start' })

      const criticalPath = board.getCriticalPath()

      expect(criticalPath.length).toBeGreaterThan(0)
    })

    it('should validate dependencies', () => {
      const board = useBoardState({ initialBoard: boardData })
      board.addColumn(columnData)
      board.addCard({ ...cardData, id: 'card-1' })
      board.addCard({ ...cardData, id: 'card-2', position: 1 })

      board.addDependency('card-2', { taskId: 'card-1', type: 'finish-to-start' })

      expect(() => board.validateDependencies()).not.toThrow()
    })
  })
})
