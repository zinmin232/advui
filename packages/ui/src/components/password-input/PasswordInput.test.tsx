import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('hides the password until the toggle is pressed', async () => {
    const onVisibleChange = vi.fn()
    const { user } = renderWithProvider(
      <PasswordInput aria-label="Password" onVisibleChange={onVisibleChange} />,
    )
    const input = screen.getByLabelText('Password')
    const toggle = screen.getByRole('button', { name: 'Show password' })
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveAttribute('aria-controls', input.id)

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it('disables the toggle with the field', () => {
    renderWithProvider(<PasswordInput aria-label="Password" disabled />)
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })
})
