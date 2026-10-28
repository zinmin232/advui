import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { Heatmap } from './Heatmap'

const data = [
  { state: 'Kachin', health: 34, wash: 21, food: null },
  { state: 'Shan', health: 41, wash: 0, food: 48 },
]
const series = [
  { key: 'health', label: 'Health' },
  { key: 'wash', label: 'WASH' },
  { key: 'food', label: 'Food' },
] as const

describe('Heatmap', () => {
  it('draws a cell per value, shaded by step, with a legend of ranges', () => {
    const { container } = renderWithProvider(
      <Heatmap
        title="Projects"
        description="September"
        data={data}
        index="state"
        series={series}
        width={600}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Projects' })).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /^Projects\. September\. Use the arrow keys/ }),
    ).toBeInTheDocument()
    const cells = [...container.querySelectorAll('svg rect')]
    expect(cells).toHaveLength(6)
    // Steps of 10 up to 50: 48 is the full color, 0 the lightest shade.
    expect(cells[5]).toHaveAttribute('fill-opacity', '1')
    expect(cells[4]).toHaveAttribute('fill-opacity', '0.2')
    expect(cells[2]).not.toHaveAttribute('fill', cells[0]!.getAttribute('fill'))
    for (const range of ['0–10', '10–20', '20–30', '30–40', '40–50', 'No data'])
      expect(screen.getByText(range)).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveTextContent('KachinShanHealthWASHFood')
  })

  it('has no "No data" entry when every cell has a value', () => {
    renderWithProvider(
      <Heatmap title="Full" data={data} index="state" series={series.slice(0, 2)} width={600} />,
    )
    expect(screen.queryByText('No data')).not.toBeInTheDocument()
  })

  it('moves along rows and columns with the arrow keys', async () => {
    const { user, container } = renderWithProvider(
      <Heatmap title="Projects" data={data} index="state" series={series} width={600} />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Kachin: Health 34')).toBeInTheDocument()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByText('Shan: Health 41')).toBeInTheDocument()
    await user.keyboard('{ArrowRight}{ArrowDown}')
    // Down from the last row stays put.
    expect(screen.getByText('Shan: WASH 0')).toBeInTheDocument()
    await user.keyboard('{ArrowUp}{ArrowRight}')
    expect(screen.getByText('Kachin: Food –')).toBeInTheDocument()
    // The active cell is outlined.
    expect(container.querySelectorAll('svg rect[fill="none"]')).toHaveLength(1)
    await user.keyboard('{End}')
    expect(screen.getByText('Shan: Food 48')).toBeInTheDocument()
  })

  it('shows the tooltip for the cell under the pointer', () => {
    renderWithProvider(
      <Heatmap title="Projects" data={data} index="state" series={series} width={600} />,
    )
    const plot = screen.getByRole('img', { name: /Projects/ })
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 590, clientY: 60 })
    })
    expect(screen.getByText('Shan: Food 48')).toBeInTheDocument()
    // The row names are not cells.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 10, clientY: 10 })
    })
    expect(screen.queryByText(/^Shan:/)).not.toBeInTheDocument()
  })

  it('lists every row in the table', async () => {
    const { user } = renderWithProvider(
      <Heatmap
        title="Projects"
        data={data}
        index="state"
        indexLabel="State"
        series={series}
        width={600}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const table = screen.getByRole('table', { name: 'Projects' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['State', 'Health', 'WASH', 'Food'])
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Kachin3421–')
  })
})
