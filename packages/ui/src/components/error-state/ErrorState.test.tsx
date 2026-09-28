import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('is announced as an alert with a default title and retries', async () => {
    const onRetry = vi.fn()
    const { user } = renderWithProvider(<ErrorState onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the retry button as busy while retrying', () => {
    renderWithProvider(<ErrorState onRetry={() => {}} retrying />)
    expect(screen.getByRole('button', { name: /Try again/ })).toHaveAttribute('aria-busy', 'true')
  })
})
