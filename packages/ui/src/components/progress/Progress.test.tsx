import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Progress } from './Progress'

describe('Progress', () => {
  it('exposes progressbar values', () => {
    renderWithProvider(<Progress value={40} label="Upload" />)
    const bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('clamps out-of-range values and supports indeterminate mode', () => {
    const { unmount } = renderWithProvider(<Progress value={180} label="Over" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    unmount()
    renderWithProvider(<Progress label="Loading" />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })
})
