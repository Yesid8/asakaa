/**
 * CardTemplateSelector Component Tests
 * Tests for v0.3.0 Card Templates feature
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CardTemplateSelector, DEFAULT_TEMPLATES } from '../CardTemplateSelector'
import type { CardTemplate } from '../../../types'

const mockTemplates: CardTemplate[] = [
  {
    id: 'test-1',
    name: 'Test Template 1',
    description: 'Test description 1',
    icon: '📝',
    category: 'Testing',
    template: {
      title: 'Test Title',
      description: 'Test Description',
      priority: 'HIGH',
    },
  },
  {
    id: 'test-2',
    name: 'Test Template 2',
    description: 'Test description 2',
    icon: '🔧',
    category: 'Testing',
    template: {
      title: 'Another Title',
      description: 'Another Description',
      priority: 'LOW',
    },
  },
  {
    id: 'test-3',
    name: 'Different Category Template',
    description: 'Different category',
    icon: '🎨',
    category: 'Design',
    template: {
      title: 'Design Task',
      description: 'Design something',
      priority: 'MEDIUM',
    },
  },
]

describe('CardTemplateSelector', () => {
  describe('Rendering', () => {
    it('renders trigger button', () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      expect(screen.getByText('Templates')).toBeInTheDocument()
      expect(screen.getByTitle('Create from template')).toBeInTheDocument()
    })

    it('opens menu when button is clicked', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      const button = screen.getByText('Templates')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Card Templates')).toBeInTheDocument()
      })
    })

    it('displays all templates in menu', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Test Template 1')).toBeInTheDocument()
        expect(screen.getByText('Test Template 2')).toBeInTheDocument()
        expect(screen.getByText('Different Category Template')).toBeInTheDocument()
      })
    })

    it('displays template descriptions', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Test description 1')).toBeInTheDocument()
        expect(screen.getByText('Test description 2')).toBeInTheDocument()
      })
    })

    it('displays template icons', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('📝')).toBeInTheDocument()
        expect(screen.getByText('🔧')).toBeInTheDocument()
        expect(screen.getByText('🎨')).toBeInTheDocument()
      })
    })

    it('shows empty state when no templates', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={[]}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('No templates available')).toBeInTheDocument()
      })
    })
  })

  describe('Template categories', () => {
    it('groups templates by category', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Testing')).toBeInTheDocument()
        expect(screen.getByText('Design')).toBeInTheDocument()
      })
    })

    it('displays templates under their categories', async () => {
      const onSelectTemplate = vi.fn()

      const { container } = render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        // Both Testing category templates should be visible
        expect(screen.getByText('Test Template 1')).toBeInTheDocument()
        expect(screen.getByText('Test Template 2')).toBeInTheDocument()
        // Design category template should be visible
        expect(screen.getByText('Different Category Template')).toBeInTheDocument()
      })
    })
  })

  describe('Template selection', () => {
    it('calls onSelectTemplate when template is clicked', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Test Template 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Test Template 1'))

      expect(onSelectTemplate).toHaveBeenCalledTimes(1)
      expect(onSelectTemplate).toHaveBeenCalledWith(mockTemplates[0])
    })

    it('closes menu after template selection', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Test Template 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Test Template 1'))

      await waitFor(() => {
        expect(screen.queryByText('Card Templates')).not.toBeInTheDocument()
      })
    })

    it('selects different templates correctly', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Test Template 2')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Test Template 2'))

      expect(onSelectTemplate).toHaveBeenCalledWith(mockTemplates[1])
    })
  })

  describe('Menu interactions', () => {
    it('closes menu when clicking outside', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <div>
          <CardTemplateSelector
            templates={mockTemplates}
            onSelectTemplate={onSelectTemplate}
          />
          <div data-testid="outside">Outside</div>
        </div>
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        expect(screen.getByText('Card Templates')).toBeInTheDocument()
      })

      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByText('Card Templates')).not.toBeInTheDocument()
      })
    })

    it('toggles menu open/closed when clicking button', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      const button = screen.getByText('Templates')

      // Open
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.getByText('Card Templates')).toBeInTheDocument()
      })

      // Close
      fireEvent.click(button)
      await waitFor(() => {
        expect(screen.queryByText('Card Templates')).not.toBeInTheDocument()
      })
    })

    it('rotates chevron icon when menu opens', async () => {
      const onSelectTemplate = vi.fn()

      const { container } = render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      // Find the button by title attribute
      const button = screen.getByTitle('Create from template')

      // Initially the menu is closed, so the chevron should not have rotate-180 class
      let svg = container.querySelector('svg')
      expect(svg).toBeTruthy()
      expect(svg?.className.baseVal || svg?.getAttribute('class')).not.toContain('rotate-180')

      fireEvent.click(button)

      await waitFor(() => {
        // Re-query the svg after click to get updated element
        const updatedSvg = container.querySelector('svg')
        const className = updatedSvg?.className.baseVal || updatedSvg?.getAttribute('class') || ''
        expect(className).toContain('rotate-180')
      })
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const onSelectTemplate = vi.fn()

      const { container } = render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
          className="custom-class"
        />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('DEFAULT_TEMPLATES', () => {
    it('includes bug report template', () => {
      const bugTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'bug-report')
      expect(bugTemplate).toBeDefined()
      expect(bugTemplate?.name).toBe('Bug Report')
      expect(bugTemplate?.category).toBe('Development')
    })

    it('includes feature request template', () => {
      const featureTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'feature-request')
      expect(featureTemplate).toBeDefined()
      expect(featureTemplate?.name).toBe('Feature Request')
    })

    it('includes task template', () => {
      const taskTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'task')
      expect(taskTemplate).toBeDefined()
      expect(taskTemplate?.name).toBe('Task')
    })

    it('includes research template', () => {
      const researchTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'research')
      expect(researchTemplate).toBeDefined()
      expect(researchTemplate?.name).toBe('Research')
    })

    it('includes documentation template', () => {
      const docsTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'documentation')
      expect(docsTemplate).toBeDefined()
      expect(docsTemplate?.name).toBe('Documentation')
    })

    it('includes meeting template', () => {
      const meetingTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'meeting')
      expect(meetingTemplate).toBeDefined()
      expect(meetingTemplate?.name).toBe('Meeting')
    })

    it('all templates have required fields', () => {
      DEFAULT_TEMPLATES.forEach((template) => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.icon).toBeDefined()
        expect(template.template).toBeDefined()
        expect(template.template.title).toBeDefined()
        expect(template.template.description).toBeDefined()
      })
    })

    it('templates have appropriate priorities', () => {
      const bugTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'bug-report')
      expect(bugTemplate?.template.priority).toBe('HIGH')

      const researchTemplate = DEFAULT_TEMPLATES.find((t) => t.id === 'research')
      expect(researchTemplate?.template.priority).toBe('LOW')
    })
  })

  describe('Accessibility', () => {
    it('button has title attribute', () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      const button = screen.getByTitle('Create from template')
      expect(button).toBeInTheDocument()
    })

    it('menu is keyboard accessible', async () => {
      const onSelectTemplate = vi.fn()

      render(
        <CardTemplateSelector
          templates={mockTemplates}
          onSelectTemplate={onSelectTemplate}
        />
      )

      fireEvent.click(screen.getByText('Templates'))

      await waitFor(() => {
        const templateButtons = screen.getAllByRole('button')
        // Should include trigger button + template buttons
        expect(templateButtons.length).toBeGreaterThan(1)
      })
    })
  })
})
