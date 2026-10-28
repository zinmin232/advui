import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { RadialChart } from './RadialChart'

const data = [
  { label: 'Food', value: 72 },
  { label: 'Health', value: 58 },
  { label: 'WASH', value: 0 },
  { label: 'Education', value: 23 },
]

describe('RadialChart', () => {
  it('draws a named track per item and an arc per value', () => {
    const { container } = renderWithProvider(
      <RadialChart title="Funding" description="Percent" data={data} max={100} width={600} />,
    )
    expect(screen.getByRole('figure', { name: 'Funding' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /^Funding\. Percent\. Use the arrow keys/ }),
    ).toBeInTheDocument()
    // Four tracks and three arcs: WASH has nothing to fill.
    expect(container.querySelectorAll('svg path')).toHaveLength(7)
    // Rings are named on the plot, so there is no legend.
    expect(container.querySelector('svg')).toHaveTextContent('FoodHealthWASHEducation')
    expect(screen.getAllByText('Food')).toHaveLength(1)
  })

  it('reads each ring and its percent of max with the arrow keys', async () => {
    const { user } = renderWithProvider(
      <RadialChart title="Funding" data={data} max={200} width={600} />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Food: 36% 72')).toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByText('Education: 11.5% 23')).toBeInTheDocument()
  })

  it('shows the tooltip for the ring under the pointer', () => {
    renderWithProvider(<RadialChart title="Funding" data={data} max={100} width={600} />)
    const plot = screen.getByRole('img', { name: /Funding/ })
    // The rings are centered at 300,120; the outer one is about 102px out.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 300, clientY: 18 })
    })
    expect(screen.getByText('Food: 72% 72')).toBeInTheDocument()
    // The hole in the middle belongs to no ring.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 300, clientY: 120 })
    })
    expect(screen.queryByText(/^Food:/)).not.toBeInTheDocument()
  })

  it('shows a gauge’s value in the middle, with a legend only for several', () => {
    const { container } = renderWithProvider(
      <>
        <RadialChart
          title="Funded"
          variant="gauge"
          data={[{ label: 'Received', value: 64 }]}
          max={100}
          width={300}
          valueFormatter={(v) => `${v}%`}
        />
        <RadialChart
          title="Two gauges"
          variant="gauge"
          data={[
            { label: 'Received', value: 64 },
            { label: 'Pledged', value: 81 },
          ]}
          max={100}
          width={300}
        />
      </>,
    )
    const [single, double] = container.querySelectorAll('svg')
    expect(single).toHaveTextContent('64%Received')
    expect(double).toHaveTextContent('64Received')
    // Only the second has a legend.
    expect(screen.getAllByText('Received · 64')).toHaveLength(1)
    expect(screen.getByText('Pledged · 81')).toBeInTheDocument()
  })

  it('fills the ring at max and lists every item in the table', async () => {
    const { user } = renderWithProvider(
      <RadialChart
        title="Funding"
        data={[...data, { label: 'Shelter', value: 120 }]}
        max={100}
        width={600}
        text={{ label: 'Sector' }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const table = screen.getByRole('table', { name: 'Funding' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Sector', 'Value', 'Percent'])
    expect(within(table).getAllByRole('row')[5]).toHaveTextContent('Shelter120120%')
  })
})
