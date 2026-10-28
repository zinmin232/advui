import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Field } from '../field/Field'
import { DateTimePicker } from './DateTimePicker'

describe('DateTimePicker', () => {
  it('is a group named by its Field, with a date field and time selects', () => {
    renderWithProvider(
      <Field label="Starts" description="In your time zone.">
        <DateTimePicker locale="en-US" defaultValue={new Date(2026, 9, 14, 9, 30)} />
      </Field>,
    )
    expect(screen.getByRole('group', { name: 'Starts' })).toBeInTheDocument()
    // The Field's label targets the date field, which keeps its own name and
    // reads the help text after the day.
    const date = screen.getByRole('button', { name: 'Starts Date' })
    expect(date).toHaveAccessibleDescription('Oct 14, 2026 In your time zone.')
    expect(screen.getByRole('group', { name: 'Time' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveTextContent('09')
    expect(screen.getByRole('combobox', { name: 'Minute' })).toHaveTextContent('30')
  })

  it('passes invalid and disabled to every part', () => {
    renderWithProvider(<DateTimePicker aria-label="Starts" invalid disabled hourCycle={12} />)
    const date = screen.getByRole('button', { name: 'Date' })
    expect(date).toHaveAttribute('aria-invalid', 'true')
    expect(date).toBeDisabled()
    for (const name of ['Hour', 'Minute', 'AM or PM']) {
      const select = screen.getByRole('combobox', { name })
      expect(select).toHaveAttribute('aria-invalid', 'true')
      expect(select).toHaveAttribute('aria-disabled', 'true')
    }
  })

  it('reports a date only once a day and a time are both picked', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <DateTimePicker
        aria-label="Starts"
        locale="en-US"
        today={new Date(2026, 9, 1)}
        minuteStep={30}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Date' }))
    await user.click(await screen.findByRole('gridcell', { name: /October 20, 2026/ }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('combobox', { name: 'Hour' }))
    await user.click(await screen.findByRole('option', { name: '09' }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('combobox', { name: 'Minute' }))
    await user.click(await screen.findByRole('option', { name: '30' }))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20, 9, 30))
    // Opens a calendar and two Selects, which is slow when the suite runs in parallel.
  }, 15_000)

  it('keeps the time when the day changes', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <DateTimePicker
        aria-label="Starts"
        locale="en-US"
        defaultValue={new Date(2026, 9, 14, 14, 45)}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Date' }))
    await user.click(await screen.findByRole('gridcell', { name: /October 20, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20, 14, 45))
    expect(screen.getByRole('button', { name: 'Date' })).toHaveAccessibleDescription(
      'Oct 20, 2026',
    )
  })

  it('takes a controlled value set from outside', async () => {
    function Controlled() {
      const [value, setValue] = useState<Date | null>(new Date(2026, 9, 14, 9, 30))
      return (
        <>
          <DateTimePicker aria-label="Starts" locale="en-US" value={value} onValueChange={setValue} />
          <Button onPress={() => setValue(new Date(2026, 9, 21, 17, 15))}>Next week</Button>
          <Button onPress={() => setValue(null)}>Clear</Button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByRole('button', { name: 'Date' })).toHaveAccessibleDescription(
      'Oct 21, 2026',
    )
    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveTextContent('17')
    expect(screen.getByRole('combobox', { name: 'Minute' })).toHaveTextContent('15')
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByRole('button', { name: 'Date' })).toHaveTextContent('Pick a date')
    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveTextContent('--')
  })
})
