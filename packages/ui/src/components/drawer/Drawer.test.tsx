import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Drawer, type DrawerContentProps } from './Drawer'

function Example({
  onOpenChange,
  ...content
}: Partial<DrawerContentProps> & { onOpenChange?: (open: boolean) => void }) {
  return (
    <Drawer onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <Button>Filters</Button>
      </Drawer.Trigger>
      <Drawer.Content {...content}>
        <Drawer.Header>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow down the results.</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body>
          <Input aria-label="Keyword" />
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

describe('Drawer', () => {
  it('opens a labelled, described modal dialog from the trigger', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Filters' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByRole('dialog')).toBeNull()

    await user.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Filters' })
    expect(dialog).toHaveAccessibleDescription('Narrow down the results.')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('textbox', { name: 'Keyword' })).toBeInTheDocument()
  })

  it('closes with Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Filters' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Filters' })

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('closes from the × button and from Drawer.Close, which keeps its own name', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('dialog', { name: 'Filters' })
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('dialog', { name: 'Filters' })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('can hide the × button', async () => {
    const { user } = renderWithProvider(<Example hideCloseButton side="left" />)
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    await screen.findByRole('dialog', { name: 'Filters' })
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('traps focus inside while open', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Filters' }))
    const dialog = await screen.findByRole('dialog', { name: 'Filters' })
    for (let i = 0; i < 5; i++) {
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    }
  })
})
