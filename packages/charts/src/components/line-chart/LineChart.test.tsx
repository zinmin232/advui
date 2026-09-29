import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { LineChart } from './LineChart'

const data = [
  { q: 'Q1', health: 61, wash: 48 },
  { q: 'Q2', health: 66, wash: null },
  { q: 'Q3', health: 72, wash: 57 },
]

describe('LineChart', () => {
  it('draws a line per series, broken where a value is missing', () => {
    const { container } = renderWithProvider(
      <LineChart
        title="Coverage"
        data={data}
        index="q"
        series={[
          { key: 'health', label: 'Health' },
          { key: 'wash', label: 'WASH' },
        ]}
        width={500}
      />,
    )
    const lines = [...container.querySelectorAll('svg path')].map((p) => p.getAttribute('d'))
    // Health is one line through three points. WASH is broken into two lone
    // values, which have no line to draw and show as dots instead.
    expect(lines).toHaveLength(1)
    expect(lines[0]!.match(/L/g)).toHaveLength(2)
    const circles = [...container.querySelectorAll('svg circle')]
    expect(circles.filter((c) => c.getAttribute('r') === '3')).toHaveLength(2)
    // End markers: one per series.
    expect(circles.filter((c) => c.getAttribute('r') === '4')).toHaveLength(2)
  })

  it('reads the values at each position', async () => {
    const { user } = renderWithProvider(
      <LineChart
        title="Coverage"
        data={data}
        index="q"
        series={[{ key: 'health', label: 'Health' }]}
        width={500}
      />,
    )
    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByText('Q2: Health 66')).toBeInTheDocument()
  })
})
