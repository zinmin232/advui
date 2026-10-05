import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderWithProvider, screen } from '../test/utils'
import { AreaChart, BarChart, type BarChartProps, LineChart, type LineChartProps } from './index'

// The type checks here run in `pnpm typecheck` (tsc), not in Vitest.
// An interface has no index signature, so it is not a `Record<string, unknown>`.
interface Project {
  sector: string
  planned: number
  reached: number | null
}

const projects: Project[] = [
  { sector: 'Health', planned: 420, reached: 388 },
  { sector: 'WASH', planned: 310, reached: null },
]

describe('chart row types', () => {
  it('accept rows typed with an interface', () => {
    const series = [
      { key: 'planned', label: 'Planned' },
      { key: 'reached', label: 'Reached' },
    ] as const
    renderWithProvider(
      <>
        <BarChart title="Bars" data={projects} index="sector" series={series} width={400} />
        <LineChart title="Lines" data={projects} index="sector" series={series} width={400} />
        <AreaChart title="Areas" data={projects} index="sector" series={series} width={400} />
      </>,
    )
    expect(screen.getAllByRole('figure')).toHaveLength(3)
  })

  it('take index and series keys from the fields of the rows', () => {
    expectTypeOf<BarChartProps<Project>['index']>().toEqualTypeOf<
      'sector' | 'planned' | 'reached'
    >()
    expectTypeOf<LineChartProps<Project>['series'][number]['key']>().toEqualTypeOf<
      'sector' | 'planned' | 'reached'
    >()
    // Rows typed as a record (the default) take any field name, as before.
    expectTypeOf<BarChartProps['index']>().toEqualTypeOf<string>()
    const records: Record<string, unknown>[] = [{ month: 'Jan', reports: 212 }]

    const charts = [
      <BarChart
        key="index"
        title="Bars"
        data={projects}
        // @ts-expect-error Project has no `name` field.
        index="name"
        series={[{ key: 'planned', label: 'Planned' }]}
      />,
      <LineChart
        key="series"
        title="Lines"
        data={projects}
        index="sector"
        // @ts-expect-error Project has no `budget` field.
        series={[{ key: 'budget', label: 'Budget' }]}
      />,
      <AreaChart
        key="records"
        title="Areas"
        data={records}
        index="month"
        series={[{ key: 'reports', label: 'Reports' }]}
      />,
    ]
    expect(charts).toHaveLength(3)
  })
})
