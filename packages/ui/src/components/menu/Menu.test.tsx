import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Menu } from './Menu'

function Example({
  onValueChange,
  onArchive = () => {},
}: {
  onValueChange?: (value: string) => void
  onArchive?: () => void
}) {
  return (
    <Menu aria-label="Mailboxes" defaultValue="inbox" onValueChange={onValueChange}>
      <Menu.Group label="Mail">
        <Menu.Item value="inbox" trailing={12}>
          Inbox
        </Menu.Item>
        <Menu.Item value="sent">Sent</Menu.Item>
        <Menu.Item value="spam" disabled>
          Spam
        </Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Item onSelect={onArchive}>Archive all</Menu.Item>
    </Menu>
  )
}

describe('Menu', () => {
  it('renders a named menu of items with the selected one marked current', () => {
    renderWithProvider(<Example />)
    expect(screen.getByRole('menu', { name: 'Mailboxes' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Mail' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Inbox/ })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('menuitem', { name: 'Sent' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('menuitem', { name: 'Spam' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('selects an item on click and calls onSelect', async () => {
    const onValueChange = vi.fn()
    const onArchive = vi.fn()
    const { user } = renderWithProvider(
      <Example onValueChange={onValueChange} onArchive={onArchive} />,
    )
    await user.click(screen.getByRole('menuitem', { name: 'Sent' }))
    expect(onValueChange).toHaveBeenCalledWith('sent')
    expect(screen.getByRole('menuitem', { name: 'Sent' })).toHaveAttribute('aria-current', 'true')

    await user.click(screen.getByRole('menuitem', { name: 'Archive all' }))
    expect(onArchive).toHaveBeenCalledTimes(1)
    // Actions without a value leave the selection alone.
    expect(screen.getByRole('menuitem', { name: 'Sent' })).toHaveAttribute('aria-current', 'true')
  })

  it('ignores disabled items', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    await user.click(screen.getByRole('menuitem', { name: 'Spam' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('is one Tab stop that lands on the selected item; arrows move and skip disabled items', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    await user.tab()
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Inbox/ })).toHaveFocus())

    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Sent' })).toHaveFocus())
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archive all' })).toHaveFocus())
    await user.keyboard('{Home}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Inbox/ })).toHaveFocus())
    await user.keyboard('{End}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archive all' })).toHaveFocus())

    await user.keyboard('{ArrowUp}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Sent' })).toHaveFocus())
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('sent')
    await user.keyboard('{ArrowUp}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Inbox/ })).toHaveFocus())
    await user.keyboard(' ')
    expect(onValueChange).toHaveBeenLastCalledWith('inbox')
  })

  it('hands focus given to the menu itself (e.g. by a dialog) on to the selected item', async () => {
    renderWithProvider(<Example />)
    act(() => screen.getByRole('menu', { name: 'Mailboxes' }).focus())
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Inbox/ })).toHaveFocus())
  })

  it('supports a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = useState('sent')
      return (
        <>
          <Menu aria-label="Mailboxes" value={value} onValueChange={setValue}>
            <Menu.Item value="inbox">Inbox</Menu.Item>
            <Menu.Item value="sent">Sent</Menu.Item>
          </Menu>
          <output>{value}</output>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    expect(screen.getByRole('menuitem', { name: 'Sent' })).toHaveAttribute('aria-current', 'true')
    await user.click(screen.getByRole('menuitem', { name: 'Inbox' }))
    expect(screen.getByRole('status')).toHaveTextContent('inbox')
  })

  it('renders links on web and marks the current page', () => {
    renderWithProvider(
      <Menu aria-label="Settings">
        <Menu.Item href="/profile" selected>
          Profile
        </Menu.Item>
        <Menu.Item href="/billing" disabled>
          Billing
        </Menu.Item>
      </Menu>,
    )
    const profile = screen.getByRole('menuitem', { name: 'Profile' })
    expect(profile.tagName).toBe('A')
    expect(profile).toHaveAttribute('href', '/profile')
    expect(profile).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('menuitem', { name: 'Billing' })).not.toHaveAttribute('href')
  })
})
