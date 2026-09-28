import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { DateRangePicker } from './DateRangePicker'

describe('DateRangePicker', () => {
  it('picks a start and an end, then closes', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <DateRangePicker
        aria-label="Stay"
        locale="en-US"
        defaultValue={{ start: new Date(2026, 11, 1), end: null }}
        onValueChange={onValueChange}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Stay' })
    expect(trigger).toHaveAccessibleDescription('Dec 1, 2026 –')
    await user.click(trigger)
    await user.click(await screen.findByRole('gridcell', { name: /December 5, 2026/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({
      start: new Date(2026, 11, 1),
      end: new Date(2026, 11, 5),
    })
    expect(trigger).toHaveAccessibleDescription(/Dec 1\s*–\s*5, 2026/)
  })
})
