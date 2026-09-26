import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders a multi-line field that accepts newlines', async () => {
    const { user } = renderWithProvider(<Textarea aria-label="Bio" />)
    const field = screen.getByRole('textbox', { name: 'Bio' })
    expect(field.tagName).toBe('TEXTAREA')
    await user.type(field, 'line 1{enter}line 2')
    expect(field).toHaveValue('line 1\nline 2')
  })

  it('supports the invalid state', () => {
    renderWithProvider(<Textarea aria-label="Bio" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
