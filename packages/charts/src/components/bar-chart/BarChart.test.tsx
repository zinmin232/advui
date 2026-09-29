import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { BarChart } from './BarChart'

const data = [
  { sector: 'Health', planned: 420, reached: 388 },
  { sector: 'WASH', planned: 310, reached: null },
  { sector: 'Education', planned: 260, reached: 191 },
]
const series = [
  { key: 'planned', label: 'Planned' },
  { key: 'reached', label: 'Reached' },
]

describe('BarChart', () => {
  it('is a named figure with a plot image, a legend and bars', () => {
    const { container } = renderWithProvider(
      <BarChart
        title="By sector"
        description="Thousands"
        data={data}
        index="sector"
        series={series}
        width={600}
      />,
    )
    expect(screen.getByRole('figure', { name: 'By sector' })).toBeInTheDocument()
    const plot = screen.getByRole('img', { name: /^By sector\. Thousands\. Use the arrow keys/ })
    expect(plot).toHaveAttribute('tabindex', '0')
    expect(screen.getByText('Planned')).toBeInTheDocument()
    expect(screen.getByText('Reached')).toBeInTheDocument()
    // Five bars: the missing WASH value draws nothing.
    expect(container.querySelectorAll('svg path')).toHaveLength(5)
  })

  it('has no legend for one series', () => {
    renderWithProvider(
      <BarChart title="Planned" data={data} index="sector" series={[series[0]!]} width={600} />,
    )
    expect(screen.queryByText('Planned', { selector: 'span:not([id])' })).not.toBeInTheDocument()
  })

  it('shows the data as a table', async () => {
    const { user } = renderWithProvider(
      <BarChart
        title="By sector"
        data={data}
        index="sector"
        indexLabel="Sector"
        series={series}
        width={600}
      />,
    )
    const toggle = screen.getByRole('button', { name: 'Show table' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    const table = screen.getByRole('table', { name: 'By sector' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Sector', 'Planned', 'Reached'])
    expect(within(table).getAllByRole('row')[2]).toHaveTextContent('WASH310–')
    expect(screen.getByRole('button', { name: 'Hide table' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('reads each category with the arrow keys', async () => {
    const { user } = renderWithProvider(
      <BarChart
        title="By sector"
        data={data}
        index="sector"
        series={series}
        width={600}
        valueFormatter={(v) => `${v}K`}
      />,
    )
    await user.tab()
    expect(screen.getByRole('img', { name: /By sector/ })).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Health: Planned 420K, Reached 388K')).toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByText('Education: Planned 260K, Reached 191K')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText(/^Education:/)).not.toBeInTheDocument()
  })

  it('shows the tooltip for the category under the pointer', () => {
    renderWithProvider(
      <BarChart title="By sector" data={data} index="sector" series={series} width={600} />,
    )
    const plot = screen.getByRole('img', { name: /By sector/ })
    // happy-dom lays nothing out, so the plot's box starts at 0,0.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 590, clientY: 100 })
    })
    expect(screen.getByText('Education: Planned 260, Reached 191')).toBeInTheDocument()
    act(() => {
      fireEvent.mouseLeave(plot)
    })
    expect(screen.queryByText(/^Education:/)).not.toBeInTheDocument()
  })

  it('stacks horizontally', () => {
    const { container } = renderWithProvider(
      <BarChart
        title="Stacked"
        data={data}
        index="sector"
        series={series}
        layout="horizontal"
        stacked
        width={600}
      />,
    )
    expect(container.querySelectorAll('svg path')).toHaveLength(5)
    expect(screen.getByText('Health')).toBeInTheDocument()
  })
})
