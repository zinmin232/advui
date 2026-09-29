import { LineChart } from '@advui/charts'

const data = [
  { month: 'Jan', reports: 212 },
  { month: 'Feb', reports: 238 },
  { month: 'Mar', reports: 301 },
  { month: 'Apr', reports: 276 },
  { month: 'May', reports: 334 },
  { month: 'Jun', reports: 362 },
  { month: 'Jul', reports: 348 },
  { month: 'Aug', reports: 391 },
]

export default function LineChartBasic() {
  return (
    <LineChart
      title="5W activity reports received"
      description="Per month, 2026"
      data={data}
      index="month"
      indexLabel="Month"
      series={[{ key: 'reports', label: 'Reports' }]}
    />
  )
}
