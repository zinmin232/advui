import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog'

function Example(props: Partial<ConfirmDialogProps>) {
  return (
    <ConfirmDialog
      trigger={<Button>Delete project</Button>}
      title="Delete Atlas?"
      description="This cannot be undone."
      confirmLabel="Delete"
      tone="destructive"
      {...props}
    />
  )
}

/** A Promise the test settles by hand. */
function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('ConfirmDialog', () => {
  it('opens an alertdialog named and described by its text, focused on Cancel', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete Atlas?' })
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus())
  })

  it('confirms and closes', async () => {
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(
      <Example onConfirm={onConfirm} onOpenChange={onOpenChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('cancels with Escape, returns focus to the trigger and does not confirm', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    const { user } = renderWithProvider(<Example onConfirm={onConfirm} onCancel={onCancel} />)
    const trigger = screen.getByRole('button', { name: 'Delete project' })
    await user.click(trigger)
    await screen.findByRole('alertdialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('stays open and busy until an async onConfirm resolves', async () => {
    const request = deferred()
    const onConfirm = vi.fn(() => request.promise)
    const { user } = renderWithProvider(<Example onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    const confirm = await screen.findByRole('button', { name: 'Delete' })
    await user.click(confirm)
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy', 'true'))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    // Neither a second press nor Escape acts while it runs.
    await user.click(confirm)
    await user.keyboard('{Escape}')
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()

    request.resolve()
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('stays open when an async onConfirm rejects, so the user can retry', async () => {
    const request = deferred()
    const onConfirm = vi.fn(() => request.promise)
    const { user } = renderWithProvider(<Example onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Delete project' }))
    const confirm = await screen.findByRole('button', { name: 'Delete' })
    await user.click(confirm)
    // Browsers drop focus from a button when it is disabled; happy-dom does not.
    confirm.blur()
    request.reject(new Error('Network error'))
    await waitFor(() => expect(confirm).not.toHaveAttribute('aria-busy'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
    await waitFor(() => expect(confirm).toHaveFocus())
    await user.click(confirm)
    expect(onConfirm).toHaveBeenCalledTimes(2)
  })

  it('opens without a trigger when controlled', async () => {
    renderWithProvider(<Example trigger={undefined} open description={undefined} />)
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete Atlas?' })
    expect(dialog).not.toHaveAccessibleDescription()
    expect(screen.queryByRole('button', { name: 'Delete project' })).toBeNull()
  })

  it('uses the default labels', async () => {
    renderWithProvider(<ConfirmDialog defaultOpen title="Leave the page?" />)
    await screen.findByRole('alertdialog', { name: 'Leave the page?' })
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})
