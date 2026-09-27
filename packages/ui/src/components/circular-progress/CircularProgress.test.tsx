import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { CircularProgress } from './CircularProgress'

describe('CircularProgress', () => {
  it('exposes progressbar values and hides the percentage text from screen readers', () => {
    renderWithProvider(<CircularProgress value={40} label="Storage used" showValue />)
    const ring = screen.getByRole('progressbar', { name: 'Storage used' })
    expect(ring).toHaveAttribute('aria-valuenow', '40')
    expect(ring).toHaveAttribute('aria-valuemax', '100')
    expect(ring).not.toHaveAttribute('aria-busy')
    expect(screen.getByText('40%')).toHaveAttribute('aria-hidden', 'true')
  })

  it('clamps out-of-range values', () => {
    renderWithProvider(<CircularProgress value={180} max={120} label="Over" showValue />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '120')
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('spins without a value, with no value and a busy state', () => {
    renderWithProvider(<CircularProgress label="Syncing" showValue />)
    const ring = screen.getByRole('progressbar', { name: 'Syncing' })
    expect(ring).not.toHaveAttribute('aria-valuenow')
    expect(ring).toHaveAttribute('aria-busy', 'true')
    expect(ring.querySelector('svg')).toHaveClass('aui-spinner')
    expect(screen.queryByText(/%$/)).toBeNull()
  })

  it('draws no indicator at zero, so no dot shows from the round cap', () => {
    renderWithProvider(<CircularProgress value={0} label="Empty" />)
    expect(screen.getByRole('progressbar').querySelectorAll('circle')).toHaveLength(1)
  })
})
