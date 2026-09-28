import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { KpiCard } from './KpiCard'

describe('KpiCard', () => {
  it('shows the label, value, change and note', () => {
    renderWithProvider(
      <KpiCard
        label="Total revenue"
        value="$45,231.89"
        delta="20.1%"
        trend="up"
        description="from last month"
      />,
    )
    expect(screen.getByText('Total revenue')).toBeInTheDocument()
    expect(screen.getByText('$45,231.89')).toBeInTheDocument()
    expect(screen.getByText('Increased by')).toBeInTheDocument()
    expect(screen.getByText('20.1%')).toBeInTheDocument()
    expect(screen.getByText('from last month')).toBeInTheDocument()
  })

  it('hides the icon from assistive technology', () => {
    renderWithProvider(<KpiCard label="Users" value="12" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('replaces the figure with placeholders while loading', () => {
    const { container } = renderWithProvider(
      <KpiCard label="Users" value="1,204" delta="6%" trend="up" loading />,
    )
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.queryByText('1,204')).not.toBeInTheDocument()
    expect(screen.queryByText('6%')).not.toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
  })

  it('renders extra content and passes card props through', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <KpiCard
        label="Target"
        value="73%"
        interactive
        role="button"
        aria-label="Open target"
        onPress={onPress}
      >
        <span>24 days left</span>
      </KpiCard>,
    )
    expect(screen.getByText('24 days left')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open target' }))
    expect(onPress).toHaveBeenCalledOnce()
  })
})
