import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { AreaChart } from './AreaChart'

const data = [
  { year: '2024', cash: 10, services: 5 },
  { year: '2025', cash: 20, services: 10 },
]

describe('AreaChart', () => {
  it('fills under each line from zero', () => {
    const { container } = renderWithProvider(
      <AreaChart
        title="Assistance"
        data={data}
        index="year"
        series={[{ key: 'cash', label: 'Cash' }]}
        width={400}
      />,
    )
    const fills = [...container.querySelectorAll('svg path')].filter(
      (p) => p.getAttribute('fill-opacity') === '0.1',
    )
    expect(fills).toHaveLength(1)
    expect(fills[0]!.getAttribute('d')).toMatch(/Z$/)
  })

  it('stacks series so the top edge is the total', async () => {
    const { user } = renderWithProvider(
      <AreaChart
        title="Assistance"
        data={data}
        index="year"
        stacked
        series={[
          { key: 'cash', label: 'Cash' },
          { key: 'services', label: 'Services' },
        ]}
        width={400}
      />,
    )
    // The tooltip and table still give each series' own value.
    await user.tab()
    await user.keyboard('{End}')
    expect(screen.getByText('2025: Cash 20, Services 10')).toBeInTheDocument()
  })
})
