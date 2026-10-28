import { ComposedChart } from '@advui/charts'

const months = [
  { month: 'Jan', reached: 18, target: 20 },
  { month: 'Feb', reached: 21, target: 20 },
  { month: 'Mar', reached: 17, target: 22 },
  { month: 'Apr', reached: 24, target: 22 },
  { month: 'May', reached: 26, target: 24 },
  { month: 'Jun', reached: 23, target: 24 },
]

export default function ComposedChartBasic() {
  return (
    <ComposedChart
      title="People reached against the target"
      description="Thousands of people per month, 2026"
      data={months}
      index="month"
      indexLabel="Month"
      series={[
        { key: 'reached', label: 'Reached' },
        { key: 'target', label: 'Target', type: 'line', dashed: true },
      ]}
      valueFormatter={(v) => `${v}K`}
    />
  )
}
