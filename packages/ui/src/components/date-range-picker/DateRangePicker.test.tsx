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

  it('shows plain spaces where ICU puts thin or narrow no-break ones', () => {
    // Node's ICU spaces the dash with U+2009 and Chrome's does not, so the
    // server's text would not match the browser's at hydration.
    const formatRange = vi
      .spyOn(Intl.DateTimeFormat.prototype, 'formatRange')
      .mockReturnValue('Dec 1\u2009–\u20095, 2026')
    // `format` is a getter on the prototype (it returns a bound function),
    // though TypeScript types it as a method.
    const format = vi
      .spyOn(Intl.DateTimeFormat.prototype as { format: unknown }, 'format', 'get')
      .mockReturnValue(() => 'Dec\u202f1, 2026')
    try {
      renderWithProvider(
        <>
          <DateRangePicker
            aria-label="Stay"
            locale="en-US"
            value={{ start: new Date(2026, 11, 1), end: new Date(2026, 11, 5) }}
          />
          <DateRangePicker
            aria-label="Trip"
            locale="en-US"
            value={{ start: new Date(2026, 11, 1), end: null }}
          />
        </>,
      )
      expect(screen.getByRole('button', { name: 'Stay' })).toHaveAccessibleDescription(
        'Dec 1 – 5, 2026',
      )
      expect(screen.getByRole('button', { name: 'Trip' })).toHaveAccessibleDescription(
        'Dec 1, 2026 –',
      )
    } finally {
      formatRange.mockRestore()
      format.mockRestore()
    }
  })
})
