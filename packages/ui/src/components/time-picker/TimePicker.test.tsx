import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { TimePicker, clampTime } from './TimePicker'

describe('TimePicker', () => {
  it('shows a 12-hour value in named selects', () => {
    renderWithProvider(<TimePicker aria-label="Pickup" defaultValue="14:45" hourCycle={12} />)
    expect(screen.getByRole('group', { name: 'Pickup' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveTextContent('2')
    expect(screen.getByRole('combobox', { name: 'Minute' })).toHaveTextContent('45')
    expect(screen.getByRole('combobox', { name: 'AM or PM' })).toHaveTextContent('PM')
  })

  it('reports a 24-hour value only once hour and minute are picked', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TimePicker aria-label="Start" minuteStep={30} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Hour' }))
    await user.click(await screen.findByRole('option', { name: '09' }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('combobox', { name: 'Minute' }))
    await user.click(await screen.findByRole('option', { name: '30' }))
    expect(onValueChange).toHaveBeenCalledWith('09:30')
    // Opens two Selects, which is slow when the whole suite runs in parallel.
  }, 15_000)

  it('disables options outside min and max, and moves a time into them', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TimePicker
        aria-label="Pickup"
        hourCycle={12}
        minuteStep={15}
        min="09:30"
        max="17:00"
        defaultValue="10:15"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('combobox', { name: 'Hour' }))
    expect(await screen.findByRole('option', { name: '8' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('option', { name: '9' })).not.toHaveAttribute('aria-disabled', 'true')
    // 9:15 is before 9:30: the minute moves to the first one allowed.
    await user.click(screen.getByRole('option', { name: '9' }))
    expect(onValueChange).toHaveBeenLastCalledWith('09:30')
    expect(screen.getByRole('combobox', { name: 'Minute' })).toHaveTextContent('30')
    await user.click(screen.getByRole('combobox', { name: 'Minute' }))
    expect(await screen.findByRole('option', { name: '15' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await user.keyboard('{Escape}')
    // 9:30 PM is after 5 PM: the time moves to the last one allowed.
    await user.click(screen.getByRole('combobox', { name: 'AM or PM' }))
    await user.click(await screen.findByRole('option', { name: 'PM' }))
    expect(onValueChange).toHaveBeenLastCalledWith('17:00')
    expect(screen.getByRole('combobox', { name: 'Hour' })).toHaveTextContent('5')
  }, 20_000)

  it('clamps times to the minute steps within min and max', () => {
    expect(clampTime('08:00', { min: '09:32', minuteStep: 5 })).toBe('09:35')
    expect(clampTime('23:50', { max: '17:00', minuteStep: 15 })).toBe('17:00')
    expect(clampTime('12:00', { min: '09:00', max: '17:00' })).toBe('12:00')
    expect(clampTime('12:00', { min: '10:01', max: '10:04', minuteStep: 5 })).toBeNull()
  })
})
