import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Input } from '../input/Input'
import { Label } from './Label'

describe('Label', () => {
  it('labels the linked control and focuses it on click', async () => {
    const { user } = renderWithProvider(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    )
    const input = screen.getByLabelText('Email')
    expect(input.tagName).toBe('INPUT')
    await user.click(screen.getByText('Email'))
    expect(input).toHaveFocus()
  })

  it('shows a decorative required marker', () => {
    renderWithProvider(
      <>
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input id="name" required />
      </>,
    )
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('textbox')).toBeRequired()
  })
})
