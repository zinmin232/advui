import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { LoadingState } from './LoadingState'

describe('LoadingState', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is a status with a default title, and hides the spinner from assistive technology', () => {
    renderWithProvider(<LoadingState />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('keeps its actions outside the status text', async () => {
    const onCancel = vi.fn()
    const { user } = renderWithProvider(
      <LoadingState title="Loading invoices…" description="This can take a minute.">
        <Button onPress={onCancel}>Cancel</Button>
      </LoadingState>,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading invoices…This can take a minute.')
    expect(screen.getByRole('status')).not.toHaveTextContent('Cancel')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows nothing until the delay has passed, inside a status that is already there', () => {
    vi.useFakeTimers()
    renderWithProvider(
      <LoadingState delay={300} title="Loading invoices…">
        <Button>Cancel</Button>
      </LoadingState>,
    )
    const status = screen.getByRole('status')
    expect(status).toBeEmptyDOMElement()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(300))
    expect(status).toHaveTextContent('Loading invoices…')
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})
