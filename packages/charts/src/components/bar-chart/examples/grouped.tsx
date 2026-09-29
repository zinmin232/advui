import { BarChart } from '@advui/charts'

const data = [
  { sector: 'Health', planned: 420, reached: 388 },
  { sector: 'WASH', planned: 310, reached: 332 },
  { sector: 'Education', planned: 260, reached: 191 },
  { sector: 'Protection', planned: 180, reached: 142 },
  { sector: 'Food', planned: 390, reached: 351 },
]

export default function BarChartGrouped() {
  return (
    <BarChart
      title="Planned vs reached, by sector"
      description="Thousands of people, 2026"
      data={data}
      index="sector"
      indexLabel="Sector"
      series={[
        { key: 'planned', label: 'Planned' },
        { key: 'reached', label: 'Reached' },
      ]}
      valueFormatter={(v) => `${v}K`}
    />
  )
}
