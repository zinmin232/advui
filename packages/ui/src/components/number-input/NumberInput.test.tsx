import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('steps with the buttons and stops at the limits', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <NumberInput aria-label="Guests" defaultValue={9} max={10} onValueChange={onValueChange} />,
    )
    const field = screen.getByRole('spinbutton', { name: 'Guests' })
    expect(field).toHaveAttribute('aria-valuenow', '9')
    await user.click(screen.getByRole('button', { name: 'Increase' }))
    expect(field).toHaveValue('10')
    expect(onValueChange).toHaveBeenLastCalledWith(10)
    expect(screen.getByRole('button', { name: 'Increase' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('steps with arrow keys without float noise', async () => {
    const { user } = renderWithProvider(
      <NumberInput aria-label="Weight" defaultValue={0.1} step={0.2} />,
    )
    const field = screen.getByRole('spinbutton')
    await user.click(field)
    await user.keyboard('{ArrowUp}')
    expect(field).toHaveValue('0.3')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(field).toHaveValue('-0.1')
  })

  it('clamps typed values on blur and treats empty as null', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <NumberInput aria-label="Age" min={0} max={120} onValueChange={onValueChange} />,
    )
    const field = screen.getByRole('spinbutton')
    await user.type(field, '150')
    await user.tab()
    expect(field).toHaveValue('120')
    await user.clear(field)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })
})
