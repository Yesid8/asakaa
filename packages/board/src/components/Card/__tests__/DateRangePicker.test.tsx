import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DateRangePicker } from '../DateRangePicker'

describe('DateRangePicker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders calendar icon when no dates are set', () => {
      render(<DateRangePicker onChange={vi.fn()} />)
      expect(screen.getByTitle('Set date range')).toBeInTheDocument()
    })

    it('renders formatted dates when both dates are set', () => {
      render(
        <DateRangePicker
          startDate="2025-10-01"
          endDate="2025-10-15"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Oct 1/)).toBeInTheDocument()
      expect(screen.getByText(/Oct 15/)).toBeInTheDocument()
    })

    it('renders only start date when end date is not set', () => {
      render(
        <DateRangePicker
          startDate="2025-10-01"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Oct 1/)).toBeInTheDocument()
    })

    it('renders only end date when start date is not set', () => {
      render(
        <DateRangePicker
          endDate="2025-10-15"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Oct 15/)).toBeInTheDocument()
    })
  })

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(<DateRangePicker onChange={vi.fn()} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Date Range')).toBeInTheDocument()
        expect(screen.getByText('Start Date')).toBeInTheDocument()
        expect(screen.getByText('End Date')).toBeInTheDocument()
      })
    })

    it('closes menu when clicking outside', async () => {
      render(
        <div>
          <DateRangePicker onChange={vi.fn()} />
          <div data-testid="outside">Outside</div>
        </div>
      )

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Date Range')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      fireEvent.mouseDown(outside)

      await waitFor(() => {
        expect(screen.queryByText('Date Range')).not.toBeInTheDocument()
      })
    })

    it('displays input fields in menu', async () => {
      render(<DateRangePicker onChange={vi.fn()} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        expect(inputs).toHaveLength(2)
        expect(inputs[0]).toHaveAttribute('type', 'date')
        expect(inputs[1]).toHaveAttribute('type', 'date')
      })
    })
  })

  describe('Date Selection', () => {
    it('calls onChange when start date is selected', async () => {
      const onChange = vi.fn()
      render(<DateRangePicker onChange={onChange} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Start Date')).toBeInTheDocument()
      })

      const startInput = screen.getAllByRole('textbox')[0]!
      fireEvent.change(startInput, { target: { value: '2025-10-01' } })

      expect(onChange).toHaveBeenCalledWith({
        startDate: '2025-10-01',
        endDate: undefined,
      })
    })

    it('calls onChange when end date is selected', async () => {
      const onChange = vi.fn()
      render(<DateRangePicker onChange={onChange} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('End Date')).toBeInTheDocument()
      })

      const endInput = screen.getAllByRole('textbox')[1]!
      fireEvent.change(endInput, { target: { value: '2025-10-15' } })

      expect(onChange).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: '2025-10-15',
      })
    })

    it('calls onChange with both dates', async () => {
      const onChange = vi.fn()
      render(<DateRangePicker onChange={onChange} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Start Date')).toBeInTheDocument()
      })

      const [startInput, endInput] = screen.getAllByRole('textbox')

      fireEvent.change(startInput!, { target: { value: '2025-10-01' } })
      fireEvent.change(endInput!, { target: { value: '2025-10-15' } })

      expect(onChange).toHaveBeenCalledTimes(2)
      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2025-10-01',
        endDate: '2025-10-15',
      })
    })
  })

  describe('Clear Functionality', () => {
    it('shows clear button when dates are set', async () => {
      render(
        <DateRangePicker
          startDate="2025-10-01"
          endDate="2025-10-15"
          onChange={vi.fn()}
        />
      )

      const button = screen.getByText(/Oct 1/)
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument()
      })
    })

    it('calls onChange with undefined dates when clear is clicked', async () => {
      const onChange = vi.fn()
      render(
        <DateRangePicker
          startDate="2025-10-01"
          endDate="2025-10-15"
          onChange={onChange}
        />
      )

      const button = screen.getByText(/Oct 1/)
      fireEvent.click(button)

      await waitFor(() => {
        const clearButton = screen.getByText('Clear')
        fireEvent.click(clearButton)
      })

      expect(onChange).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
      })
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly for different months', () => {
      const { rerender } = render(
        <DateRangePicker
          startDate="2025-01-15"
          endDate="2025-01-20"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Jan 15/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 20/)).toBeInTheDocument()

      rerender(
        <DateRangePicker
          startDate="2025-12-01"
          endDate="2025-12-31"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Dec 1/)).toBeInTheDocument()
      expect(screen.getByText(/Dec 31/)).toBeInTheDocument()
    })

    it('handles Date objects', () => {
      render(
        <DateRangePicker
          startDate={new Date('2025-10-01')}
          endDate={new Date('2025-10-15')}
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Oct 1/)).toBeInTheDocument()
      expect(screen.getByText(/Oct 15/)).toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <DateRangePicker onChange={vi.fn()} className="custom-class" />
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button type', () => {
      render(<DateRangePicker onChange={vi.fn()} />)
      const button = screen.getByTitle('Set date range')
      expect(button.tagName).toBe('BUTTON')
    })

    it('has hover state on button', () => {
      render(<DateRangePicker onChange={vi.fn()} />)
      const button = screen.getByTitle('Set date range')
      expect(button).toHaveClass('hover:bg-white/10')
    })

    it('date inputs have proper labels', async () => {
      render(<DateRangePicker onChange={vi.fn()} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Start Date')).toBeInTheDocument()
        expect(screen.getByText('End Date')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles invalid date strings gracefully', () => {
      render(
        <DateRangePicker
          startDate="invalid-date"
          endDate="also-invalid"
          onChange={vi.fn()}
        />
      )

      // Should not crash and might show icon if dates can't be parsed
      expect(screen.getByTitle('Set date range')).toBeInTheDocument()
    })

    it('handles start date after end date', async () => {
      const onChange = vi.fn()
      render(<DateRangePicker onChange={onChange} />)

      const button = screen.getByTitle('Set date range')
      fireEvent.click(button)

      await waitFor(() => {
        const [startInput, endInput] = screen.getAllByRole('textbox')
        fireEvent.change(startInput!, { target: { value: '2025-10-20' } })
        fireEvent.change(endInput!, { target: { value: '2025-10-10' } })
      })

      // Component should still accept the dates
      expect(onChange).toHaveBeenCalled()
    })

    it('handles very long date ranges', () => {
      render(
        <DateRangePicker
          startDate="2020-01-01"
          endDate="2030-12-31"
          onChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Jan 1/)).toBeInTheDocument()
      expect(screen.getByText(/Dec 31/)).toBeInTheDocument()
    })

    it('handles rapid menu open/close', async () => {
      render(<DateRangePicker onChange={vi.fn()} />)

      const button = screen.getByTitle('Set date range')

      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      // Should handle rapid clicks gracefully
      await waitFor(() => {
        expect(screen.getByText('Date Range')).toBeInTheDocument()
      })
    })
  })
})
