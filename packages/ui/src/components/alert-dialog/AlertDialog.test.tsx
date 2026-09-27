import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { AlertDialog } from './AlertDialog'

function Example({ onDelete = () => {} }: { onDelete?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button>Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete Atlas?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button variant="destructive" onPress={onDelete}>
              Delete
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  )
}

describe('AlertDialog', () => {
  it('opens an alertdialog named and described by its text, focused on Cancel', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete Atlas?' })
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus())
  })

  it('keeps the visible labels of Cancel and Action', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await screen.findByRole('alertdialog')
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dialog Close' })).toBeNull()
  })

  it('runs the action and closes', async () => {
    const onDelete = vi.fn()
    const { user } = renderWithProvider(<Example onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('cancels with Escape and returns focus to the trigger', async () => {
    const onDelete = vi.fn()
    const { user } = renderWithProvider(<Example onDelete={onDelete} />)
    const trigger = screen.getByRole('button', { name: 'Delete project' })
    await user.click(trigger)
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(onDelete).not.toHaveBeenCalled()
  })
})
