import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Sheet } from './Sheet'

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Sheet onOpenChange={onOpenChange}>
      <Sheet.Trigger>
        <Button>Edit profile</Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Edit profile</Sheet.Title>
          <Sheet.Description>Visible to your team.</Sheet.Description>
        </Sheet.Header>
        <Input aria-label="Name" />
        <Sheet.Footer>
          <Sheet.Close>
            <Button variant="outline">Cancel</Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  )
}

const dialog = () => screen.queryByRole('dialog', { name: 'Edit profile' })

describe('Sheet', () => {
  it('announces the dialog popup on its trigger', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens a modal dialog named and described by its text, with focus inside', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const sheet = await screen.findByRole('dialog', { name: 'Edit profile' })
    expect(sheet).toHaveAttribute('aria-modal', 'true')
    expect(sheet).toHaveAccessibleDescription('Visible to your team.')
    await waitFor(() => expect(sheet).toContainElement(document.activeElement as HTMLElement))
  })

  it('closes with Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Edit profile' })
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('closes from Sheet.Close and from the × button', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(onOpenChange).toHaveBeenCalledTimes(4)
  })

  it('can be controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <Button onPress={() => setOpen(false)}>Hide</Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <Sheet.Content>
              <Sheet.Title>Edit profile</Sheet.Title>
            </Sheet.Content>
          </Sheet>
        </>
      )
    }
    renderWithProvider(<Controlled />)
    expect(await screen.findByRole('dialog', { name: 'Edit profile' })).toBeInTheDocument()
    expect(dialog()).not.toBeNull()
  })
})
