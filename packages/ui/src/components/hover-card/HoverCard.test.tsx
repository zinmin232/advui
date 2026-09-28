import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Text } from '../typography/Text'
import { HoverCard, type HoverCardProps } from './HoverCard'

function Example(props: Partial<HoverCardProps>) {
  return (
    <>
      <HoverCard openDelay={0} closeDelay={0} {...props}>
        <HoverCard.Trigger>
          <a href="/ada">@ada</a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <Text>Ada Lovelace — first programmer.</Text>
        </HoverCard.Content>
      </HoverCard>
      <button type="button">Elsewhere</button>
    </>
  )
}

describe('HoverCard', () => {
  it('renders only the trigger until hovered, and keeps it a plain link', () => {
    renderWithProvider(<Example />)
    const link = screen.getByRole('link', { name: '@ada' })
    expect(link).toHaveAttribute('href', '/ada')
    expect(link).not.toHaveAttribute('aria-expanded')
    expect(screen.queryByText(/first programmer/)).toBeNull()
  })

  it('opens on hover and closes when the pointer leaves', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onOpenChange={onOpenChange} />)
    await user.hover(screen.getByRole('link', { name: '@ada' }))
    expect(await screen.findByText(/first programmer/)).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    // Screen readers hear the card as the link's description.
    expect(screen.getByRole('link', { name: '@ada' })).toHaveAccessibleDescription(
      /first programmer/,
    )

    await user.unhover(screen.getByRole('link', { name: '@ada' }))
    await user.hover(screen.getByRole('button', { name: 'Elsewhere' }))
    await waitFor(() => expect(screen.queryByText(/first programmer/)).toBeNull())
  })

  it('opens on keyboard focus without moving focus, and closes with Escape', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.tab()
    const link = screen.getByRole('link', { name: '@ada' })
    expect(link).toHaveFocus()
    expect(await screen.findByText(/first programmer/)).toBeInTheDocument()
    expect(link).toHaveFocus()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText(/first programmer/)).toBeNull())
  })

  it('does not toggle when the trigger is clicked', async () => {
    const onOpenChange = vi.fn()
    renderWithProvider(<Example open={false} onOpenChange={onOpenChange} />)
    screen.getByRole('link', { name: '@ada' }).click()
    expect(onOpenChange).not.toHaveBeenCalledWith(true)
  })

  it('supports a controlled open state', () => {
    renderWithProvider(<Example open />)
    expect(screen.getByText(/first programmer/)).toBeInTheDocument()
  })
})
