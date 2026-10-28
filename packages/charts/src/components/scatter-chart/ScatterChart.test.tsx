import { describe, expect, it } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { ScatterChart } from './ScatterChart'

const data = [
  { project: 'Wells', sector: 'WASH', budget: 300, reached: 50, staff: 12 },
  { project: 'Clinics', sector: 'Health', budget: 100, reached: 20, staff: 30 },
  { project: 'Kits', sector: 'WASH', budget: 200, reached: null, staff: 4 },
  { project: 'Vaccines', sector: 'Health', budget: 0, reached: 40, staff: 6 },
]

describe('ScatterChart', () => {
  it('is a named figure with a plot image, a legend of groups and one dot per point', () => {
    const { container } = renderWithProvider(
      <ScatterChart
        title="Budget and reach"
        description="Thousands"
        data={data}
        x="budget"
        y="reached"
        index="project"
        category="sector"
        width={600}
      />,
    )
    expect(screen.getByRole('figure', { name: 'Budget and reach' })).toBeInTheDocument()
    const plot = screen.getByRole('img', { name: /^Budget and reach\. Thousands\. Use the arrow/ })
    expect(plot).toHaveAttribute('tabindex', '0')
    expect(screen.getByText('WASH')).toBeInTheDocument()
    expect(screen.getByText('Health')).toBeInTheDocument()
    // Three points: Kits has no `reached` value.
    expect(container.querySelectorAll('svg circle')).toHaveLength(3)
    // The axis names default to the fields.
    expect(container.querySelector('svg')).toHaveTextContent(/reached.*budget/)
  })

  it('has no legend without groups', () => {
    renderWithProvider(
      <ScatterChart title="Points" data={data} x="budget" y="reached" width={600} />,
    )
    expect(screen.queryByText('WASH')).not.toBeInTheDocument()
  })

  it('reads the points left to right with the arrow keys', async () => {
    const { user } = renderWithProvider(
      <ScatterChart
        title="Budget and reach"
        data={data}
        x="budget"
        y="reached"
        xLabel="Budget"
        yLabel="Reached"
        index="project"
        category="sector"
        categoryLabel="Sector"
        width={600}
        valueFormatter={(value, field) => (field === 'x' ? `$${value}K` : `${value}K`)}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Vaccines: Sector Health, Budget $0K, Reached 40K')).toBeInTheDocument()
    await user.keyboard('{End}')
    expect(screen.getByText('Wells: Sector WASH, Budget $300K, Reached 50K')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText(/^Wells:/)).not.toBeInTheDocument()
  })

  it('names unnamed points by group, or by row number', async () => {
    const { user } = renderWithProvider(
      <>
        <ScatterChart title="Grouped" data={data} x="budget" y="reached" category="sector" />
        <ScatterChart title="Plain" data={data} x="budget" y="reached" />
      </>,
    )
    await user.tab()
    await user.keyboard('{Home}')
    expect(screen.getByText('Health: budget 0, reached 40')).toBeInTheDocument()
    await user.tab()
    await user.tab()
    await user.keyboard('{End}')
    expect(screen.getByText('1: budget 300, reached 50')).toBeInTheDocument()
  })

  it('shows the tooltip for the point under the pointer only', () => {
    renderWithProvider(
      <ScatterChart
        title="Budget and reach"
        data={data}
        x="budget"
        y="reached"
        index="project"
        width={600}
        height={300}
      />,
    )
    const plot = screen.getByRole('img', { name: /Budget and reach/ })
    // happy-dom lays nothing out, so the plot's box starts at 0,0. Wells, the
    // largest budget and reach, sits in the top right corner.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 580, clientY: 30 })
    })
    expect(screen.getByText('Wells: budget 300, reached 50')).toBeInTheDocument()
    // Open space finds nothing.
    act(() => {
      fireEvent.mouseMove(plot, { clientX: 300, clientY: 240 })
    })
    expect(screen.queryByText(/^Wells:/)).not.toBeInTheDocument()
  })

  it('sizes bubbles by area and lists every row in the table', async () => {
    const { user, container } = renderWithProvider(
      <ScatterChart
        title="Bubbles"
        data={data}
        x="budget"
        y="reached"
        size="staff"
        sizeLabel="Staff"
        index="project"
        indexLabel="Project"
        width={600}
      />,
    )
    const radii = [...container.querySelectorAll('svg circle')].map((c) =>
      Number(c.getAttribute('r')),
    )
    // Drawn largest first: Clinics (30 staff) is the full 20px.
    expect(radii[0]).toBe(20)
    expect(radii.at(-1)).toBeLessThan(10)
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const table = screen.getByRole('table', { name: 'Bubbles' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Project', 'budget', 'reached', 'Staff'])
    expect(within(table).getAllByRole('row')[3]).toHaveTextContent('Kits200–4')
  })
})
