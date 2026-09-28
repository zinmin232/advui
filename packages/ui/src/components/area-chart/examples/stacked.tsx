import { AreaChart } from '@advui/core'

const data = [
  { year: '2021', cash: 22, inKind: 41, services: 18 },
  { year: '2022', cash: 31, inKind: 38, services: 21 },
  { year: '2023', cash: 44, inKind: 35, services: 24 },
  { year: '2024', cash: 52, inKind: 30, services: 29 },
  { year: '2025', cash: 61, inKind: 27, services: 31 },
  { year: '2026', cash: 67, inKind: 25, services: 34 },
]

export default function AreaChartStacked() {
  return (
    <AreaChart
      title="Assistance by modality"
      description="Millions of USD; the top edge is the total."
      data={data}
      index="year"
      indexLabel="Year"
      stacked
      series={[
        { key: 'cash', label: 'Cash' },
        { key: 'inKind', label: 'In kind' },
        { key: 'services', label: 'Services' },
      ]}
    />
  )
}
