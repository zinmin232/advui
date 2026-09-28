import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { FormField } from '../form-field/FormField'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('is a labelled button described by its value', () => {
    renderWithProvider(
      <FormField label="Due date">
        <DatePicker locale="en-US" defaultValue={new Date(2026, 9, 14)} />
      </FormField>,
    )
    const trigger = screen.getByRole('button', { name: 'Due date' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAccessibleDescription('Oct 14, 2026')
  })

  it('opens a calendar, picks a day and closes', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <DatePicker
        aria-label="Due date"
        locale="en-US"
        defaultValue={new Date(2026, 9, 14)}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(await screen.findByRole('gridcell', { name: /October 20, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20))
    expect(screen.getByRole('button', { name: 'Due date' })).toHaveAccessibleDescription(
      'Oct 20, 2026',
    )
  })
})
