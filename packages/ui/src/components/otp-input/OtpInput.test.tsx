import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { OtpInput } from './OtpInput'

describe('OtpInput', () => {
  it('is one labelled text box that keeps digits only and reports completion', async () => {
    const onComplete = vi.fn()
    const { user } = renderWithProvider(
      <OtpInput aria-label="Code" length={4} onComplete={onComplete} />,
    )
    const field = screen.getByRole('textbox', { name: 'Code' })
    expect(field).toHaveAttribute('autocomplete', 'one-time-code')
    expect(field).toHaveAttribute('inputmode', 'numeric')
    await user.type(field, '1a2-34')
    expect(field).toHaveValue('1234')
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('fills every slot from a paste and never exceeds the length', async () => {
    const { user } = renderWithProvider(<OtpInput aria-label="Code" length={6} />)
    const field = screen.getByRole('textbox')
    await user.click(field)
    await user.paste('123 456 789')
    expect(field).toHaveValue('123456')
  })

  it('marks an invalid code for assistive technology', () => {
    renderWithProvider(<OtpInput aria-label="Code" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
