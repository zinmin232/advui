import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Input } from '../input/Input'
import { FormField } from './FormField'

describe('FormField', () => {
  it('labels the control and describes it with help text', () => {
    renderWithProvider(
      <FormField label="Username" description="3–20 letters.">
        <Input />
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: 'Username' })
    expect(input).toHaveAccessibleDescription('3–20 letters.')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('marks the control invalid and required, error first', () => {
    renderWithProvider(
      <FormField label="Email" description="Work email." error="Enter an email." required>
        <Input id="email" />
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: /Email/ })
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input).toHaveAccessibleDescription('Enter an email. Work email.')
  })

  it('disables the control', () => {
    renderWithProvider(
      <FormField label="Notes" disabled>
        <Input />
      </FormField>,
    )
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled()
  })
})
