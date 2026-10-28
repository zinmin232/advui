import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { ComposedChart } from './ComposedChart'

const data = [
  { month: 'Jan', reached: 18, planned: 10, target: 20 },
  { month: 'Feb', reached: 21, planned: 12, target: null },
  { month: 'Mar', reached: null, planned: 8, target: 22 },
  { month: 'Apr', reached: 24, planned: 15, target: 22 },
]
const series = [
  { key: 'reached', label: 'Reached' },
  { key: 'planned', label: 'Planned', type: 'bar' },
  { key: 'target', label: 'Target', type: 'line', dashed: true },
] as const

describe('ComposedChart', () => {
  it('draws bars and a dashed line with a marker per value', () => {
    const { container } = renderWithProvider(
      <ComposedChart
        title="Against target"
        description="Thousands"
        data={data}
        index="month"
        series={series}
        width={600}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Against target' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /^Against target\. Thousands\. Use the arrow keys/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
    // Seven bars (March has no `reached`); the missing February target breaks
    // the line into Jan alone and Mar to Apr, so one path is drawn.
    const paths = [...container.querySelectorAll('svg path')]
    const lines = paths.filter((p) => p.getAttribute('fill') === 'none')
    expect(paths.length - lines.length).toBe(7)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toHaveAttribute('stroke-dasharray', '6 4')
    expect(container.querySelectorAll('svg circle')).toHaveLength(3)
  })

  it('reads every series for a category with the arrow keys', async () => {
    const { user } = renderWithProvider(
      <ComposedChart
        title="Against target"
        data={data}
        index="month"
        series={series}
        width={600}
        valueFormatter={(v) => `${v}K`}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('Feb: Reached 21K, Planned 12K, Target –')).toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByText('Apr: Reached 24K, Planned 15K, Target 22K')).toBeInTheDocument()
  })

  it('shows the tooltip for the category under the pointer', () => {
    renderWithProvider(
      <ComposedChart
        title="Against target"
        data={data}
        index="month"
        series={series}
        width={600}
      />,
    )
    const plot = screen.getByRole('img', { name: /Against target/ })
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 590, clientY: 100 })
    })
    expect(screen.getByText('Apr: Reached 24, Planned 15, Target 22')).toBeInTheDocument()
  })

  it('stacks the bars and keeps lines apart, with a table of every value', async () => {
    const { user, container } = renderWithProvider(
      <ComposedChart
        title="Stacked"
        data={data}
        index="month"
        indexLabel="Month"
        series={series}
        stacked
        width={600}
      />,
    )
    const bars = [...container.querySelectorAll('svg path')].filter(
      (p) => p.getAttribute('fill') !== 'none',
    )
    expect(bars).toHaveLength(7)
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const table = screen.getByRole('table', { name: 'Stacked' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Month', 'Reached', 'Planned', 'Target'])
    expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Mar–822')
  })
})
