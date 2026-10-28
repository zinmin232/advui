import { RadialChart } from '@advui/charts'

export default function RadialChartGauge() {
  return (
    <RadialChart
      title="Appeal funded"
      description="$412M of $640M received"
      variant="gauge"
      data={[{ label: 'Funded', value: 64 }]}
      max={100}
      height={200}
      valueFormatter={(v) => `${v}%`}
    />
  )
}
