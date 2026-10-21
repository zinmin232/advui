import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Field } from '../field/Field'
import { Text } from '../typography/Text'
import { DatePicker } from './DatePicker'

describe('DatePicker', () => {
  it('is a labelled button described by its value', () => {
    renderWithProvider(
      <Field label="Due date">
        <DatePicker locale="en-US" defaultValue={new Date(2026, 9, 14)} />
      </Field>,
    )
    const trigger = screen.getByRole('button', { name: 'Due date' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAccessibleDescription('Oct 14, 2026')
  })

  it('shows its placeholder in a text color with body-text contrast', () => {
    renderWithProvider(
      <>
        <DatePicker aria-label="Due date" placeholder="Pick a date" />
        <Text color="mutedForeground">Reference</Text>
      </>,
    )
    // Real text, not an input placeholder, so it must meet 4.5:1 like any text.
    expect(getComputedStyle(screen.getByText('Pick a date')).color).toBe(
      getComputedStyle(screen.getByText('Reference')).color,
    )
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
