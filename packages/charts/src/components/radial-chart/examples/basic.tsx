import { RadialChart } from '@advui/charts'

export default function RadialChartBasic() {
  return (
    <RadialChart
      title="Funding received, by sector"
      description="Percent of the 2026 requirement"
      data={[
        { label: 'Food', value: 72 },
        { label: 'Health', value: 58 },
        { label: 'WASH', value: 41 },
        { label: 'Education', value: 23 },
      ]}
      max={100}
      valueFormatter={(v) => `${v}%`}
    />
  )
}
