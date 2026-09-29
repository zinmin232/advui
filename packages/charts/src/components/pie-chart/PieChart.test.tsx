import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { PieChart } from './PieChart'

const data = [
  { label: 'Health', value: 50 },
  { label: 'WASH', value: 30 },
  { label: 'Education', value: 20 },
]

describe('PieChart', () => {
  it('names each slice with its share and shows the total', () => {
    const { container } = renderWithProvider(<PieChart title="Projects" data={data} width={300} />)
    expect(screen.getByText('Health · 50%')).toBeInTheDocument()
    expect(screen.getByText('Education · 20%')).toBeInTheDocument()
    expect(container.querySelectorAll('svg path')).toHaveLength(3)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('folds small slices into Other and lists everything in the table', async () => {
    const { user } = renderWithProvider(
      <PieChart
        title="Donors"
        variant="pie"
        maxSlices={2}
        data={[...data, { label: 'Zero', value: 0 }]}
        width={300}
      />,
    )
    expect(screen.getByText('Other · 50%')).toBeInTheDocument()
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show table' }))
    const rows = within(screen.getByRole('table', { name: 'Donors' })).getAllByRole('row')
    expect(rows.map((r) => r.textContent)).toEqual([
      'LabelValueShare',
      'Health5050%',
      'Other5050%',
      'Total100100%',
    ])
  })

  it('reads each slice with the arrow keys', async () => {
    const { user } = renderWithProvider(<PieChart title="Projects" data={data} width={300} />)
    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('WASH: 30% 30')).toBeInTheDocument()
  })
})
