import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Input } from '../input/Input'
import { Dialog } from './Dialog'

function Example() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Edit profile</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description>Update your details.</Dialog.Description>
        </Dialog.Header>
        <Input aria-label="Name" />
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens from the trigger with an accessible name and description', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')

    await user.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Edit profile' })
    expect(dialog).toHaveAccessibleDescription('Update your details.')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('closes with Escape and returns focus to the trigger', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Edit profile' })
    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Edit profile' })

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('closes from Dialog.Close and the built-in close button', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull())

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit profile' })).toBeNull())
  })
})
