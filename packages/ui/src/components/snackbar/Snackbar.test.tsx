import { act, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Snackbar } from './Snackbar'

function Example({
  onUndo = () => {},
  duration,
}: {
  onUndo?: () => void
  duration?: number | null
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onPress={() => setOpen(true)}>Archive</Button>
      <Snackbar
        open={open}
        onOpenChange={setOpen}
        duration={duration}
        action={{ label: 'Undo', onPress: onUndo }}
      >
        Conversation archived
      </Snackbar>
    </>
  )
}

describe('Snackbar', () => {
  it('announces its message in a live region that is there before it opens', async () => {
    const { user } = renderWithProvider(<Example />)
    const region = await screen.findByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toBeEmptyDOMElement()
    await user.click(screen.getByRole('button', { name: 'Archive' }))
    expect(region).toHaveTextContent('Conversation archived')
  })

  it('runs the action and closes', async () => {
    const onUndo = vi.fn()
    const { user } = renderWithProvider(<Example onUndo={onUndo} />)
    await user.click(screen.getByRole('button', { name: 'Archive' }))
    await user.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('Conversation archived')).toBeNull())
  })

  it('shows a close button when it stays open', async () => {
    const { user } = renderWithProvider(<Example duration={null} />)
    await user.click(screen.getByRole('button', { name: 'Archive' }))
    await user.click(await screen.findByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByText('Conversation archived')).toBeNull())
  })

  describe('timing', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    it('closes by itself after its duration and pauses while hovered', async () => {
      renderWithProvider(<Example duration={1000} />)
      fireEvent.click(screen.getByRole('button', { name: 'Archive' }))
      const message = await screen.findByText('Conversation archived')

      // Hovering pauses the timer, so reading or reaching Undo is not rushed.
      fireEvent.mouseEnter(message.parentElement as HTMLElement)
      await act(() => vi.advanceTimersByTimeAsync(3000))
      expect(screen.getByText('Conversation archived')).toBeInTheDocument()

      fireEvent.mouseLeave(message.parentElement as HTMLElement)
      await act(() => vi.advanceTimersByTimeAsync(1100))
      await waitFor(() => expect(screen.queryByText('Conversation archived')).toBeNull())
    })
  })
})
