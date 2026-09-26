import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('shows on keyboard focus and hides on Escape', async () => {
    const { user } = renderWithProvider(
      <Tooltip content="Saves your draft" delay={0}>
        <Button>Save</Button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('Saves your draft')
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAccessibleDescription(
      'Saves your draft',
    )

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('keeps the trigger accessible name intact', () => {
    renderWithProvider(
      <Tooltip content="More info">
        <Button>Help</Button>
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
  })

  it('renders only the trigger when disabled', () => {
    renderWithProvider(
      <Tooltip content="Hidden" disabled>
        <Button>Plain</Button>
      </Tooltip>,
    )
    expect(screen.getByRole('button', { name: 'Plain' })).toBeInTheDocument()
  })
})
