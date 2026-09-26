import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { toast } from './Toaster'

describe('toast', () => {
  afterEach(() => {
    act(() => {
      toast.dismiss()
    })
  })

  it('renders toasts created imperatively inside a labelled region', async () => {
    renderWithProvider(<div />)
    act(() => {
      toast.success('Profile saved', { description: 'Changes are live.' })
    })
    expect(await screen.findByText('Profile saved')).toBeInTheDocument()
    expect(screen.getByText('Changes are live.')).toBeInTheDocument()
  })

  it('can be dismissed with the close button', async () => {
    const { user } = renderWithProvider(<div />)
    act(() => {
      toast('Heads up')
    })
    await screen.findByText('Heads up')
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    await waitFor(() => expect(screen.queryByText('Heads up')).toBeNull())
  })
})
