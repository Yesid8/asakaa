import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PrioritySelector } from '../PrioritySelector'

describe('PrioritySelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders URGENT priority button', () => {
      render(<PrioritySelector priority="URGENT" onChange={vi.fn()} />)
      expect(screen.getByTitle('Urgent Priority')).toBeInTheDocument()
    })

    it('renders HIGH priority button', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      expect(screen.getByTitle('High Priority')).toBeInTheDocument()
    })

    it('renders MEDIUM priority button', () => {
      render(<PrioritySelector priority="MEDIUM" onChange={vi.fn()} />)
      expect(screen.getByTitle('Medium Priority')).toBeInTheDocument()
    })

    it('renders LOW priority button', () => {
      render(<PrioritySelector priority="LOW" onChange={vi.fn()} />)
      expect(screen.getByTitle('Low Priority')).toBeInTheDocument()
    })

    it('renders NONE priority button', () => {
      render(<PrioritySelector priority="NONE" onChange={vi.fn()} />)
      expect(screen.getByTitle('No Priority')).toBeInTheDocument()
    })

    it('renders default button when priority is undefined', () => {
      render(<PrioritySelector onChange={vi.fn()} />)
      expect(screen.getByTitle('Set priority')).toBeInTheDocument()
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Medium')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
        expect(screen.getByText('None')).toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <PrioritySelector priority="HIGH" onChange={vi.fn()} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByText('Urgent')).not.toBeInTheDocument()
      })
    })

    it('closes menu when selecting a priority', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Medium')).toBeInTheDocument()
      })

      const mediumOption = screen.getByText('Medium')
      fireEvent.click(mediumOption)

      expect(onChange).toHaveBeenCalledWith('MEDIUM')

      await waitFor(() => {
        expect(screen.queryByText('Urgent')).not.toBeInTheDocument()
      })
    })
  })

  describe('onChange Callback', () => {
    it('calls onChange with URGENT', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument()
      })

      const urgentOption = screen.getByText('Urgent')
      fireEvent.click(urgentOption)

      expect(onChange).toHaveBeenCalledWith('URGENT')
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('calls onChange with HIGH', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="MEDIUM" onChange={onChange} />)

      const button = screen.getByTitle('Medium Priority')
      fireEvent.click(button)

      await waitFor(() => {
        const highOption = screen.getByText('High')
        fireEvent.click(highOption)
      })

      expect(onChange).toHaveBeenCalledWith('HIGH')
    })

    it('calls onChange with MEDIUM', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        const mediumOption = screen.getByText('Medium')
        fireEvent.click(mediumOption)
      })

      expect(onChange).toHaveBeenCalledWith('MEDIUM')
    })

    it('calls onChange with LOW', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        const lowOption = screen.getByText('Low')
        fireEvent.click(lowOption)
      })

      expect(onChange).toHaveBeenCalledWith('LOW')
    })

    it('calls onChange with NONE', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        const noneOption = screen.getByText('None')
        fireEvent.click(noneOption)
      })

      expect(onChange).toHaveBeenCalledWith('NONE')
    })
  })

  describe('Styling', () => {
    it('applies correct color for URGENT priority', () => {
      render(<PrioritySelector priority="URGENT" onChange={vi.fn()} />)
      const button = screen.getByTitle('Urgent Priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#EF4444')
    })

    it('applies correct color for HIGH priority', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      const button = screen.getByTitle('High Priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#F59E0B')
    })

    it('applies correct color for MEDIUM priority', () => {
      render(<PrioritySelector priority="MEDIUM" onChange={vi.fn()} />)
      const button = screen.getByTitle('Medium Priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#3B82F6')
    })

    it('applies correct color for LOW priority', () => {
      render(<PrioritySelector priority="LOW" onChange={vi.fn()} />)
      const button = screen.getByTitle('Low Priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#10B981')
    })

    it('applies correct color for NONE priority', () => {
      render(<PrioritySelector priority="NONE" onChange={vi.fn()} />)
      const button = screen.getByTitle('No Priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#6B7280')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <PrioritySelector priority="HIGH" onChange={vi.fn()} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has hover state', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      const button = screen.getByTitle('High Priority')
      expect(button).toHaveClass('hover:bg-white/10')
    })

    it('button is keyboard accessible', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      const button = screen.getByTitle('High Priority')
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid clicks', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Medium')).toBeInTheDocument()
      })

      // Should still work correctly
      expect(onChange).not.toHaveBeenCalled()
    })

    it('handles selecting same priority', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High Priority')
      fireEvent.click(button)

      await waitFor(() => {
        const highOption = screen.getByText('High')
        fireEvent.click(highOption)
      })

      expect(onChange).toHaveBeenCalledWith('HIGH')
    })
  })
})
