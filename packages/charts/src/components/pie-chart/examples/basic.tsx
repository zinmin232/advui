import { PieChart } from '@advui/charts'

export default function PieChartBasic() {
  return (
    <PieChart
      title="Projects by sector"
      description="Active projects, September 2026"
      data={[
        { label: 'Health', value: 412 },
        { label: 'WASH', value: 298 },
        { label: 'Education', value: 187 },
        { label: 'Protection', value: 164 },
        { label: 'Food security', value: 121 },
      ]}
    />
  )
}
