/**
 * ASAKAA Board - Premium Demo
 * Showcasing beautiful Kanban board with realistic project data
 */

import { useState } from 'react'
import {
  KanbanBoard,
  useKanbanState,
  useAI,
  useMultiSelect,
  GeneratePlanModal,
  AIUsageDashboard,
  CommandPalette,
  CardDetailModal,
  BulkOperationsToolbar,
  type User,
  type GeneratedPlan,
  type Card,
  type Comment,
  type Activity,
  type Insight,
} from '@asakaa/board'
import '@asakaa/board/styles.css'

// Sample users for assignment
const sampleUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    initials: 'AC',
    color: '#3B82F6',
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    initials: 'SJ',
    color: '#8B5CF6',
  },
  {
    id: 'user-3',
    name: 'Mike Rodriguez',
    initials: 'MR',
    color: '#EF4444',
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    initials: 'ED',
    color: '#10B981',
  },
  {
    id: 'user-5',
    name: 'James Wilson',
    initials: 'JW',
    color: '#F59E0B',
  },
]

// Sample comments for demo cards
const sampleComments: Comment[] = [
  {
    id: 'comment-1',
    cardId: 'card-5',
    authorId: 'user-1',
    content: 'Started working on the virtualization implementation. Using @tanstack/react-virtual for this.',
    createdAt: '2025-10-25T10:30:00Z',
  },
  {
    id: 'comment-2',
    cardId: 'card-5',
    authorId: 'user-2',
    content: 'Great! I can help with testing once you have the first implementation ready.',
    createdAt: '2025-10-25T14:20:00Z',
  },
  {
    id: 'comment-3',
    cardId: 'card-3',
    authorId: 'user-1',
    content: 'We should use Socket.io for the WebSocket implementation. It has good fallback support.',
    createdAt: '2025-10-20T09:15:00Z',
  },
]

// Sample activities for demo cards
const sampleActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'CARD_CREATED',
    cardId: 'card-5',
    userId: 'user-1',
    timestamp: '2025-10-20T08:00:00Z',
  },
  {
    id: 'activity-2',
    type: 'USER_ASSIGNED',
    cardId: 'card-5',
    userId: 'user-1',
    timestamp: '2025-10-22T10:00:00Z',
    newValue: 'user-1',
  },
  {
    id: 'activity-3',
    type: 'PRIORITY_CHANGED',
    cardId: 'card-5',
    userId: 'user-1',
    timestamp: '2025-10-23T14:30:00Z',
    previousValue: 'HIGH',
    newValue: 'URGENT',
  },
  {
    id: 'activity-4',
    type: 'CARD_MOVED',
    cardId: 'card-5',
    userId: 'user-2',
    timestamp: '2025-10-24T09:00:00Z',
    previousValue: 'col-todo',
    newValue: 'col-progress',
  },
  {
    id: 'activity-5',
    type: 'COMMENT_ADDED',
    cardId: 'card-5',
    userId: 'user-1',
    timestamp: '2025-10-25T10:30:00Z',
  },
]

// Sample AI insights
const sampleInsights: Insight[] = [
  {
    id: 'insight-1',
    type: 'RISK_DELAY',
    severity: 'HIGH',
    title: 'Potential Delay Risk',
    description: 'Card has dependencies that may cause delays. Consider addressing blocking issues first.',
    confidence: 0.85,
    suggestedAction: 'Review and resolve card-3 before continuing with this task',
    relatedCardIds: ['card-3'],
    timestamp: '2025-10-25T08:00:00Z',
  },
  {
    id: 'insight-2',
    type: 'OPPORTUNITY',
    severity: 'MEDIUM',
    title: 'Optimization Opportunity',
    description: 'This task could be split into smaller subtasks for better parallelization.',
    confidence: 0.72,
    suggestedAction: 'Consider breaking down into: 1) Virtual scroll setup, 2) Performance testing, 3) Edge cases',
    timestamp: '2025-10-25T08:00:00Z',
  },
]

// Realistic demo data - Software development project
const demoBoard = {
  id: 'demo-board-1',
  title: 'ASAKAA Platform Development',
  columns: [
    {
      id: 'col-backlog',
      title: 'Backlog',
      position: 1000,
      cardIds: ['card-1', 'card-2'],
      wipLimit: undefined,
    },
    {
      id: 'col-todo',
      title: 'To Do',
      position: 2000,
      cardIds: ['card-3', 'card-4'],
      wipLimit: 5,
      wipLimitType: 'soft',
    },
    {
      id: 'col-progress',
      title: 'In Progress',
      position: 3000,
      cardIds: ['card-5', 'card-6'],
      wipLimit: 3,
      wipLimitType: 'hard',
    },
    {
      id: 'col-review',
      title: 'In Review',
      position: 4000,
      cardIds: ['card-7', 'card-8'],
      wipLimit: 3,
      wipLimitType: 'soft',
    },
    {
      id: 'col-done',
      title: 'Done',
      position: 5000,
      cardIds: ['card-9', 'card-10'],
      wipLimit: undefined,
    },
  ],
  cards: [
    {
      id: 'card-1',
      title: 'AI-powered task suggestions',
      description: 'Implement ML model to suggest task priorities and assignments based on project history',
      position: 1000,
      columnId: 'col-backlog',
      priority: 'MEDIUM' as const,
      labels: ['ai', 'feature', 'ml'],
      estimatedHours: 16,
    },
    {
      id: 'card-2',
      title: 'Advanced analytics dashboard',
      description: 'Create comprehensive analytics with velocity charts, burn-down, and cycle time metrics',
      position: 2000,
      columnId: 'col-backlog',
      priority: 'LOW' as const,
      labels: ['analytics', 'feature', 'ui'],
      estimatedHours: 24,
    },
    {
      id: 'card-3',
      title: 'Real-time collaboration',
      description: 'Add WebSocket support for live cursor tracking and simultaneous editing',
      position: 1000,
      columnId: 'col-todo',
      priority: 'HIGH' as const,
      labels: ['realtime', 'backend', 'websocket'],
      dueDate: '2025-11-15',
      estimatedHours: 20,
    },
    {
      id: 'card-4',
      title: 'Mobile responsive design',
      description: 'Optimize board layout and interactions for mobile devices and tablets',
      position: 2000,
      columnId: 'col-todo',
      priority: 'HIGH' as const,
      labels: ['mobile', 'ui', 'responsive'],
      dueDate: '2025-11-20',
      estimatedHours: 12,
    },
    {
      id: 'card-5',
      title: 'Implement drag & drop optimization',
      description: 'Enhance drag performance for boards with 1000+ cards using virtualization',
      position: 1000,
      columnId: 'col-progress',
      priority: 'URGENT' as const,
      labels: ['performance', 'dnd', 'optimization'],
      startDate: '2025-10-25',
      endDate: '2025-10-30',
      estimatedHours: 8,
      assignedUserIds: ['user-1', 'user-2'],
      dependencies: ['card-3'],
    },
    {
      id: 'card-6',
      title: 'Custom field types',
      description: 'Allow users to add custom fields to cards (text, number, date, select)',
      position: 2000,
      columnId: 'col-progress',
      priority: 'MEDIUM' as const,
      labels: ['feature', 'customization'],
      startDate: '2025-10-28',
      endDate: '2025-11-10',
      estimatedHours: 16,
      assignedUserIds: ['user-3'],
    },
    {
      id: 'card-7',
      title: 'Keyboard shortcuts',
      description: 'Implement comprehensive keyboard navigation (j/k, /, Cmd+K)',
      position: 1000,
      columnId: 'col-review',
      priority: 'MEDIUM' as const,
      labels: ['ux', 'accessibility', 'feature'],
      estimatedHours: 6,
    },
    {
      id: 'card-8',
      title: 'Export to PDF/CSV',
      description: 'Add export functionality for board data in multiple formats',
      position: 2000,
      columnId: 'col-review',
      priority: 'LOW' as const,
      labels: ['export', 'feature'],
      estimatedHours: 8,
    },
    {
      id: 'card-9',
      title: 'Setup CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing, type checking, and publishing',
      position: 1000,
      columnId: 'col-done',
      priority: 'HIGH' as const,
      labels: ['devops', 'infrastructure'],
      completedAt: '2025-10-05',
    },
    {
      id: 'card-10',
      title: 'Premium glassmorphism UI',
      description: 'Design and implement beautiful dark theme with glass effects and animations',
      position: 2000,
      columnId: 'col-done',
      priority: 'HIGH' as const,
      labels: ['design', 'ui', 'premium'],
      completedAt: '2025-10-10',
    },
  ],
}

export default function App() {
  // AI Modal States
  const [isGeneratePlanModalOpen, setIsGeneratePlanModalOpen] = useState(false)
  const [isAIUsageDashboardOpen, setIsAIUsageDashboardOpen] = useState(false)

  // Card Detail Modal State
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [isCardDetailModalOpen, setIsCardDetailModalOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [activities, setActivities] = useState<Activity[]>(sampleActivities)

  const { board, callbacks, helpers } = useKanbanState({
    initialBoard: demoBoard,
    onPersist: (updatedBoard) => {
      // Persist to localStorage with auto-save
      localStorage.setItem('asakaa-demo-board', JSON.stringify(updatedBoard))
      console.log('Board state auto-saved', {
        totalCards: updatedBoard.cards.length,
        columns: updatedBoard.columns.length,
        timestamp: new Date().toISOString(),
      })
    },
  })

  // Multi-select functionality
  const {
    selectedCardIds,
    getSelectedCards,
    clearSelection,
  } = useMultiSelect()

  // AI Hook - Use real API or mock
  const {
    onGeneratePlan,
    onSuggestAssignee,
    onPredictRisks,
    onGenerateSubtasks,
    onEstimateEffort,
    isLoading: isAILoading,
  } = useAI({
    // For demo: use mock mode if no API key is set
    // apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    // provider: 'anthropic',
  })

  // Handler to add new column
  const handleAddColumn = () => {
    const newPosition = Math.max(...board.columns.map((c) => c.position), 0) + 1000
    helpers.addColumn({
      title: 'New Column',
      position: newPosition,
    })
  }

  // Handler to add new card to a column
  const handleAddCard = (columnId: string) => {
    const columnCards = board.cards.filter((c) => c.columnId === columnId)
    const maxPosition = columnCards.length > 0
      ? Math.max(...columnCards.map((c) => c.position))
      : 0

    const newCard = {
      id: `card-${Date.now()}`,
      title: 'New Task',
      description: 'Click to edit description',
      position: maxPosition + 1000,
      columnId,
      priority: 'MEDIUM' as const,
      labels: [],
    }

    callbacks.onCardCreate?.(newCard)
  }

  // Handler for card click - open detail modal
  const handleCardClick = (card: Card) => {
    setSelectedCard(card)
    setIsCardDetailModalOpen(true)
  }

  // Handler for card update from modal
  const handleCardUpdateFromModal = (cardId: string, updates: Partial<Card>) => {
    callbacks.onCardUpdate?.(cardId, updates)
    // Update selected card to reflect changes
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard({ ...selectedCard, ...updates })
    }
  }

  // Handler for card delete from modal
  const handleCardDelete = (cardId: string) => {
    callbacks.onCardDelete?.(cardId)
    setIsCardDetailModalOpen(false)
    setSelectedCard(null)
  }

  // Handler for adding comment
  const handleAddComment = (cardId: string, content: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      cardId,
      authorId: 'user-1', // Current user
      content,
      createdAt: new Date().toISOString(),
    }
    setComments([...comments, newComment])

    // Add activity
    const newActivity: Activity = {
      id: `activity-${Date.now()}`,
      type: 'COMMENT_ADDED',
      cardId,
      userId: 'user-1',
      timestamp: new Date().toISOString(),
    }
    setActivities([...activities, newActivity])
  }

  // Handler for deleting comment
  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId))
  }

  // Handler for AI-generated plan
  const handlePlanGenerated = (plan: GeneratedPlan) => {
    console.log('AI Plan Generated:', plan)

    // Clear current board
    helpers.clearBoard()

    // Add columns from generated plan
    plan.columns.forEach((col) => {
      helpers.addColumn({
        title: col.title,
        position: col.position,
        wipLimit: col.wipLimit,
      })
    })

    // Add cards from generated plan
    plan.cards.forEach((card) => {
      callbacks.onCardCreate?.({
        ...card,
        id: `card-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      })
    })

    console.log('AI-generated plan applied to board!')
  }

  // Handler for WIP limit exceeded
  const handleWipLimitExceeded = (column: any, card: Card) => {
    alert(
      `❌ Cannot move "${card.title}" to "${column.title}".\n\nThis column has a HARD WIP limit of ${column.wipLimit} cards and is already full.`
    )
  }

  // Handlers for bulk operations
  const handleBulkUpdate = (cardIds: string[], updates: Partial<Card>) => {
    cardIds.forEach((cardId) => {
      callbacks.onCardUpdate?.(cardId, updates)
    })
    clearSelection()
  }

  const handleBulkDelete = (cardIds: string[]) => {
    cardIds.forEach((cardId) => {
      callbacks.onCardDelete?.(cardId)
    })
    clearSelection()
  }

  const handleBulkMove = (cardIds: string[], targetColumnId: string) => {
    const targetColumnCards = board.cards.filter((c) => c.columnId === targetColumnId)
    const maxPosition =
      targetColumnCards.length > 0
        ? Math.max(...targetColumnCards.map((c) => c.position))
        : 0

    cardIds.forEach((cardId, index) => {
      callbacks.onCardMove?.(cardId, targetColumnId, maxPosition + (index + 1) * 1000)
    })
    clearSelection()
  }

  // Calculate stats for header
  const totalCards = board.cards.length
  const inProgressCards = board.cards.filter(
    (c) => c.columnId === 'col-progress'
  ).length
  const completedCards = board.cards.filter((c) => c.columnId === 'col-done')
    .length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#141414]">
      {/* Premium Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  ASAKAA Board
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Premium Kanban • AI-Native • React Library
                </p>
              </div>
            </div>

            {/* AI Actions & Stats */}
            <div className="flex items-center gap-4">
              {/* AI Buttons */}
              <button
                onClick={() => setIsGeneratePlanModalOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: '#ffffff',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Generate with AI
              </button>

              <button
                onClick={() => setIsAIUsageDashboardOpen(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/10 border border-white/20 text-white/90"
              >
                AI Usage
              </button>

              <div className="w-px h-10 bg-white/10" />

              {/* Stats */}
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {totalCards}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Total Tasks
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {inProgressCards}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  In Progress
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {completedCards}
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Completed
                </div>
              </div>
            </div>
          </div>

          {/* Project Title */}
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">
              {board.title}
            </h2>
            <div className="text-xs text-gray-500">
              Try dragging cards between columns
            </div>
          </div>
        </div>
      </header>

      {/* Board Container */}
      <div className="asakaa-board">
        <KanbanBoard
          board={board}
          callbacks={{
            ...callbacks,
            onWipLimitExceeded: handleWipLimitExceeded,
          }}
          onCardClick={handleCardClick}
          availableUsers={sampleUsers}
          config={{
            showCardCount: true,
            showWipLimits: true,
            enableVirtualization: false,
          }}
        />

        {/* Add Group Button - Inside scrollable area */}
        <div style={{ paddingTop: '16px' }}>
          <button
            onClick={handleAddColumn}
            className="flex items-center gap-2 px-2 py-1 text-sm font-medium transition-all rounded-md"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60a5fa',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'
              e.currentTarget.style.color = '#93c5fd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#60a5fa'
            }}
          >
            <span className="text-base font-bold">+</span>
            <span>Add Group</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[#0a0a0a]/60 border-t border-white/5 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Built with{' '}
            <span className="text-blue-400 font-semibold">@asakaa/board</span>{' '}
            • Open source React library
          </div>
          <div className="flex items-center gap-4">
            <span>All changes auto-save to localStorage</span>
            <a
              href="https://github.com/asakaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* AI Modals */}
      <GeneratePlanModal
        isOpen={isGeneratePlanModalOpen}
        onClose={() => setIsGeneratePlanModalOpen(false)}
        onPlanGenerated={handlePlanGenerated}
        onGeneratePlan={onGeneratePlan}
        isLoading={isAILoading}
      />

      <AIUsageDashboard
        isOpen={isAIUsageDashboardOpen}
        onClose={() => setIsAIUsageDashboardOpen(false)}
        planTier="hobby"
      />

      {/* Command Palette */}
      <CommandPalette
        board={board}
        availableUsers={sampleUsers}
        onCreateCard={(columnId, title) => {
          const columnCards = board.cards.filter((c) => c.columnId === columnId)
          const maxPosition =
            columnCards.length > 0
              ? Math.max(...columnCards.map((c) => c.position))
              : 0

          callbacks.onCardCreate?.({
            title,
            description: '',
            position: maxPosition + 1000,
            columnId,
            priority: 'MEDIUM',
            labels: [],
          })
        }}
        onNavigateToCard={(cardId) => {
          const card = board.cards.find((c) => c.id === cardId)
          if (card) {
            handleCardClick(card)
          }
        }}
        onSearch={(query) => {
          console.log('Search:', query)
          // TODO: Implement search filter
        }}
        onGeneratePlan={() => setIsGeneratePlanModalOpen(true)}
        onPredictRisks={() => {
          console.log('Predict risks')
          // TODO: Implement risk prediction modal
        }}
        onOpenAIUsage={() => setIsAIUsageDashboardOpen(true)}
      />

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={isCardDetailModalOpen}
        onClose={() => {
          setIsCardDetailModalOpen(false)
          setSelectedCard(null)
        }}
        onUpdate={handleCardUpdateFromModal}
        onDelete={handleCardDelete}
        availableUsers={sampleUsers}
        comments={selectedCard ? comments.filter((c) => c.cardId === selectedCard.id) : []}
        activities={selectedCard ? activities.filter((a) => a.cardId === selectedCard.id) : []}
        aiInsights={selectedCard?.id === 'card-5' ? sampleInsights : []}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onSuggestAssignee={onSuggestAssignee}
        onGenerateSubtasks={onGenerateSubtasks}
        onEstimateEffort={onEstimateEffort}
      />

      {/* Bulk Operations Toolbar */}
      {selectedCardIds.length > 0 && (
        <BulkOperationsToolbar
          selectedCards={getSelectedCards()}
          availableUsers={sampleUsers}
          onClearSelection={clearSelection}
          callbacks={{
            onBulkUpdate: handleBulkUpdate,
            onBulkDelete: handleBulkDelete,
            onBulkMove: handleBulkMove,
          }}
          columns={board.columns.map((col) => ({ id: col.id, title: col.title }))}
          availableLabels={[
            'feature',
            'bug',
            'enhancement',
            'ai',
            'ui',
            'backend',
            'performance',
            'documentation',
          ]}
        />
      )}
    </div>
  )
}
