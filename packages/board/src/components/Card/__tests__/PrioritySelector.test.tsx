import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PrioritySelector } from '../PrioritySelector'

describe('PrioritySelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders Urgent button', () => {
      render(<PrioritySelector priority="URGENT" onChange={vi.fn()} />)
      expect(screen.getByTitle('Urgent')).toBeInTheDocument()
    })

    it('renders High button', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      expect(screen.getByTitle('High')).toBeInTheDocument()
    })

    it('renders Normal button', () => {
      render(<PrioritySelector priority="MEDIUM" onChange={vi.fn()} />)
      expect(screen.getByTitle('Normal')).toBeInTheDocument()
    })

    it('renders Low button', () => {
      render(<PrioritySelector priority="LOW" onChange={vi.fn()} />)
      expect(screen.getByTitle('Low')).toBeInTheDocument()
    })

    it('renders NONE priority button', () => {
      render(<PrioritySelector priority="NONE" onChange={vi.fn()} />)
      expect(screen.getByTitle('Set priority')).toBeInTheDocument()
    })

    it('renders default button when priority is undefined', () => {
      render(<PrioritySelector onChange={vi.fn()} />)
      expect(screen.getByTitle('Set priority')).toBeInTheDocument()
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)

      const button = screen.getByTitle('High')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Urgent')).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Normal')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
        expect(screen.getByText('Clear')).toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <PrioritySelector priority="HIGH" onChange={vi.fn()} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTitle('High')
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

      const button = screen.getByTitle('High')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Normal')).toBeInTheDocument()
      })

      const mediumOption = screen.getByText('Normal')
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

      const button = screen.getByTitle('High')
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

      const button = screen.getByTitle('Normal')
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

      const button = screen.getByTitle('High')
      fireEvent.click(button)

      await waitFor(() => {
        const mediumOption = screen.getByText('Normal')
        fireEvent.click(mediumOption)
      })

      expect(onChange).toHaveBeenCalledWith('MEDIUM')
    })

    it('calls onChange with LOW', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High')
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

      const button = screen.getByTitle('High')
      fireEvent.click(button)

      await waitFor(() => {
        const noneOption = screen.getByText('Clear')
        fireEvent.click(noneOption)
      })

      expect(onChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('Styling', () => {
    it('applies correct color for Urgent', () => {
      render(<PrioritySelector priority="URGENT" onChange={vi.fn()} />)
      const button = screen.getByTitle('Urgent')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#E74C3C')
    })

    it('applies correct color for High', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      const button = screen.getByTitle('High')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#E67E22')
    })

    it('applies correct color for Normal', () => {
      render(<PrioritySelector priority="MEDIUM" onChange={vi.fn()} />)
      const button = screen.getByTitle('Normal')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#F1C40F')
    })

    it('applies correct color for Low', () => {
      render(<PrioritySelector priority="LOW" onChange={vi.fn()} />)
      const button = screen.getByTitle('Low')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#2ECC71')
    })

    it('applies correct color for NONE priority', () => {
      render(<PrioritySelector priority="NONE" onChange={vi.fn()} />)
      const button = screen.getByTitle('Set priority')
      const svg = button.querySelector('svg')
      expect(svg?.getAttribute('fill')).toBe('#BDC3C7')
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
      const button = screen.getByTitle('High')
      expect(button).toHaveClass('hover:bg-white/15')
    })

    it('button is keyboard accessible', () => {
      render(<PrioritySelector priority="HIGH" onChange={vi.fn()} />)
      const button = screen.getByTitle('High')
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid clicks', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Normal')).toBeInTheDocument()
      })

      // Should still work correctly
      expect(onChange).not.toHaveBeenCalled()
    })

    it('handles selecting same priority', async () => {
      const onChange = vi.fn()
      render(<PrioritySelector priority="HIGH" onChange={onChange} />)

      const button = screen.getByTitle('High')
      fireEvent.click(button)

      await waitFor(() => {
        const highOption = screen.getByText('High')
        fireEvent.click(highOption)
      })

      expect(onChange).toHaveBeenCalledWith('HIGH')
    })
  })
})
