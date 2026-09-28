import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Text } from '../typography/Text'
import { ContextMenu } from './ContextMenu'

function Example({
  onCopy = () => {},
  onOpenChange,
  onCheckedChange = () => {},
  disabled,
}: {
  onCopy?: () => void
  onOpenChange?: (open: boolean) => void
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenu.Trigger disabled={disabled} testID="area">
        <Text>Right-click here</Text>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>File</ContextMenu.Label>
        <ContextMenu.Item onSelect={onCopy} shortcut="⌘C">
          Copy
        </ContextMenu.Item>
        <ContextMenu.Item disabled>Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.CheckboxItem checked onCheckedChange={onCheckedChange}>
          Show hidden
        </ContextMenu.CheckboxItem>
        <ContextMenu.Item destructive>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  )
}

describe('ContextMenu', () => {
  it('stays closed until the area is right-clicked', () => {
    renderWithProvider(<Example />)
    expect(screen.getByText('Right-click here')).toBeInTheDocument()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens on right-click and calls onSelect, then closes', async () => {
    const onCopy = vi.fn()
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onCopy={onCopy} onOpenChange={onOpenChange} />)
    fireEvent.contextMenu(screen.getByTestId('area'), { clientX: 40, clientY: 40 })
    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByRole('menuitem', { name: /Copy/ }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('exposes item roles and state', async () => {
    renderWithProvider(<Example />)
    fireEvent.contextMenu(screen.getByTestId('area'))
    await screen.findByRole('menu')
    expect(screen.getByRole('menuitem', { name: 'Paste' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('menuitemcheckbox', { name: 'Show hidden' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('toggles checkbox items', async () => {
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(<Example onCheckedChange={onCheckedChange} />)
    fireEvent.contextMenu(screen.getByTestId('area'))
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Show hidden' }))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })

  it('closes with Escape', async () => {
    const { user } = renderWithProvider(<Example />)
    fireEvent.contextMenu(screen.getByTestId('area'))
    await screen.findByRole('menu')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('ignores right-clicks while disabled', async () => {
    renderWithProvider(<Example disabled />)
    fireEvent.contextMenu(screen.getByTestId('area'))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
