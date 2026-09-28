import { AreaChart } from '@advui/core'

const data = [
  { month: 'Mar', displaced: 1.21 },
  { month: 'Apr', displaced: 1.34 },
  { month: 'May', displaced: 1.52 },
  { month: 'Jun', displaced: 1.61 },
  { month: 'Jul', displaced: 1.74 },
  { month: 'Aug', displaced: 1.79 },
  { month: 'Sep', displaced: 1.86 },
]

export default function AreaChartBasic() {
  return (
    <AreaChart
      title="People displaced"
      description="Millions, estimated"
      data={data}
      index="month"
      indexLabel="Month"
      series={[{ key: 'displaced', label: 'Displaced (millions)' }]}
    />
  )
}
