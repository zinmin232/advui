import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { TimePicker } from './TimePicker'

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
})
