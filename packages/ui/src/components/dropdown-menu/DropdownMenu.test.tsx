import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { DropdownMenu } from './DropdownMenu'

function Example({
  onProfile = () => {},
  onLocked = () => {},
  onCheckedChange = () => {},
  onValueChange = () => {},
}: {
  onProfile?: () => void
  onLocked?: () => void
  onCheckedChange?: (checked: boolean) => void
  onValueChange?: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <Button>Account</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Signed in</DropdownMenu.Label>
        <DropdownMenu.Item onSelect={onProfile} shortcut="⌘P">
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={onLocked} disabled>
          Locked
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem checked onCheckedChange={onCheckedChange}>
          Status bar
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.RadioGroup value="newest" onValueChange={onValueChange}>
          <DropdownMenu.RadioItem value="newest">Newest</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="oldest">Oldest</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('marks the trigger as a menu button', () => {
    renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Account' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens a menu of items and calls onSelect', async () => {
    const onProfile = vi.fn()
    const { user } = renderWithProvider(<Example onProfile={onProfile} />)
    await user.click(screen.getByRole('button', { name: 'Account' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: /Profile/ }))
    expect(onProfile).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('opens from the keyboard and returns focus to the trigger', async () => {
    const onProfile = vi.fn()
    const { user } = renderWithProvider(<Example onProfile={onProfile} />)
    const trigger = screen.getByRole('button', { name: 'Account' })
    trigger.focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('menu')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Profile/ })).toHaveFocus())
    await user.keyboard('{Enter}')
    expect(onProfile).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('does not select disabled items', async () => {
    const onLocked = vi.fn()
    const { user } = renderWithProvider(<Example onLocked={onLocked} />)
    await user.click(screen.getByRole('button', { name: 'Account' }))
    const locked = await screen.findByRole('menuitem', { name: 'Locked' })
    expect(locked).toHaveAttribute('aria-disabled', 'true')
    await user.click(locked)
    expect(onLocked).not.toHaveBeenCalled()
  })

  it('exposes checkbox and radio items with their state', async () => {
    const onCheckedChange = vi.fn()
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Example onCheckedChange={onCheckedChange} onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Account' }))
    const status = await screen.findByRole('menuitemcheckbox', { name: 'Status bar' })
    expect(status).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemradio', { name: 'Newest' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await user.click(status)
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('reports the chosen radio item', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: 'Account' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'Oldest' }))
    expect(onValueChange).toHaveBeenCalledWith('oldest')
  })

  it('closes on Escape', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Account' }))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})
