import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { RadarChart } from './RadarChart'

const data = [
  { sector: 'Health', kachin: 82, rakhine: 64, chin: null },
  { sector: 'WASH', kachin: 71, rakhine: null, chin: 30 },
  { sector: 'Food', kachin: 74, rakhine: 85, chin: null },
]
const series = [
  { key: 'kachin', label: 'Kachin' },
  { key: 'rakhine', label: 'Rakhine' },
] as const

describe('RadarChart', () => {
  it('draws a ring per tick, a spoke per row and a shape per series', () => {
    const { container } = renderWithProvider(
      <RadarChart
        title="Coverage"
        description="Percent"
        data={data}
        index="sector"
        series={series}
        max={100}
        width={600}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Coverage' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /^Coverage\. Percent\. Use the arrow keys/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rakhine')).toBeInTheDocument()
    const paths = [...container.querySelectorAll('svg path')]
    // Rings at 20, 40, 60, 80 and 100.
    expect(paths.filter((p) => p.getAttribute('fill') === 'none')).toHaveLength(5)
    expect(paths.filter((p) => p.getAttribute('fill') !== 'none')).toHaveLength(2)
    expect(container.querySelectorAll('svg line')).toHaveLength(3)
    expect(container.querySelector('svg')).toHaveTextContent(/Health.*WASH.*Food/)
  })

  it('draws a lone value as a dot and round rings as circles', () => {
    const { container } = renderWithProvider(
      <RadarChart
        title="Chin"
        data={data}
        index="sector"
        series={[{ key: 'chin', label: 'Chin' }]}
        grid="circle"
        width={600}
      />,
    )
    // Rings at 10, 20 and 30 (the largest value), and the one value as a dot.
    expect(container.querySelectorAll('svg circle[fill="none"]')).toHaveLength(3)
    expect(container.querySelectorAll('svg circle:not([fill="none"])')).toHaveLength(1)
    expect(container.querySelectorAll('svg path')).toHaveLength(0)
  })

  it('reads every series on a spoke with the arrow keys', async () => {
    const { user, container } = renderWithProvider(
      <RadarChart
        title="Coverage"
        data={data}
        index="sector"
        series={series}
        max={100}
        width={600}
        valueFormatter={(v) => `${v}%`}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Health: Kachin 82%, Rakhine 64%')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('WASH: Kachin 71%, Rakhine –')).toBeInTheDocument()
    // One marker: Rakhine has no WASH value.
    expect(container.querySelectorAll('svg circle')).toHaveLength(1)
  })

  it('shows the tooltip for the spoke nearest the pointer', () => {
    renderWithProvider(
      <RadarChart
        title="Coverage"
        data={data}
        index="sector"
        series={series}
        max={100}
        width={600}
      />,
    )
    const plot = screen.getByRole('img', { name: /Coverage/ })
    // The web is centered at 300,150; WASH points down and to the right.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 400, clientY: 200 })
    })
    expect(screen.getByText('WASH: Kachin 71, Rakhine –')).toBeInTheDocument()
    // The corner is outside the web.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 5, clientY: 5 })
    })
    expect(screen.queryByText(/^WASH:/)).not.toBeInTheDocument()
  })

  it('lists every spoke in the table', async () => {
    const { user } = renderWithProvider(
      <RadarChart
        title="Coverage"
        data={data}
        index="sector"
        indexLabel="Sector"
        series={series}
        width={600}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const table = screen.getByRole('table', { name: 'Coverage' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Sector', 'Kachin', 'Rakhine'])
    expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Food7485')
  })
})
