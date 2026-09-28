import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Calendar } from './Calendar'

const march = new Date(2026, 2, 1)
const dayName = (d: number) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(2026, 2, d))

describe('Calendar', () => {
  it('is a grid labelled by its month, with today and the picked day marked', () => {
    renderWithProvider(
      <Calendar locale="en-US" defaultValue={new Date(2026, 2, 12)} today={new Date(2026, 2, 3)} />,
    )
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: dayName(12) })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('gridcell', { name: dayName(3) })).toHaveAttribute(
      'aria-current',
      'date',
    )
    // One Tab stop: the picked day.
    expect(screen.getByRole('gridcell', { name: dayName(12) })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('gridcell', { name: dayName(13) })).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus with arrow keys, across months, and picks with Enter', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Calendar locale="en-US" defaultMonth={march} today={march} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('gridcell', { name: dayName(31) }))
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 31))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument()
    expect(document.activeElement).toHaveAccessibleName(/April 1, 2026/)
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 3, 1))
  })

  it('picks a range in two presses and skips disabled days', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Calendar
        mode="range"
        locale="en-US"
        defaultMonth={march}
        today={march}
        min={new Date(2026, 2, 5)}
        onValueChange={onValueChange}
      />,
    )
    const day4 = screen.getByRole('gridcell', { name: dayName(4) })
    expect(day4).toHaveAttribute('aria-disabled', 'true')
    await user.click(day4)
    expect(onValueChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('gridcell', { name: dayName(10) }))
    await user.click(screen.getByRole('gridcell', { name: dayName(14) }))
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 2, 10),
      end: new Date(2026, 2, 14),
    })
    expect(screen.getByRole('gridcell', { name: dayName(12) })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Previous month' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
