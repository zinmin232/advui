import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Input } from './Input'

describe('Input', () => {
  it('accepts typing and reports changes', async () => {
    const onChangeText = vi.fn()
    const { user } = renderWithProvider(
      <Input aria-label="Email" placeholder="you@example.com" onChangeText={onChangeText} />,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('placeholder', 'you@example.com')
    await user.type(input, 'hi')
    expect(input).toHaveValue('hi')
    expect(onChangeText).toHaveBeenLastCalledWith('hi')
  })

  it('marks invalid fields for assistive technology', () => {
    renderWithProvider(<Input aria-label="Email" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('cannot be edited when disabled', async () => {
    const { user } = renderWithProvider(<Input aria-label="Email" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await user.type(input, 'x')
    expect(input).toHaveValue('')
  })
})
