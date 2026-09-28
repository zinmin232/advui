import { BarChart } from '@advui/core'

const data = [
  { state: 'Kachin', reached: 182000 },
  { state: 'Shan', reached: 246000 },
  { state: 'Rakhine', reached: 311000 },
  { state: 'Chin', reached: 94000 },
  { state: 'Kayah', reached: 57000 },
  { state: 'Sagaing', reached: 268000 },
]

export default function BarChartBasic() {
  return (
    <BarChart
      title="People reached by state"
      description="Q3 2026, all sectors"
      data={data}
      index="state"
      indexLabel="State"
      series={[{ key: 'reached', label: 'People reached' }]}
    />
  )
}
