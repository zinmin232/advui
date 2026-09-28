import { LineChart } from '@advui/core'

const data = [
  { quarter: 'Q1 25', health: 61, wash: 48, education: 35 },
  { quarter: 'Q2 25', health: 66, wash: 52, education: 33 },
  { quarter: 'Q3 25', health: 72, wash: 57, education: 38 },
  { quarter: 'Q4 25', health: 70, wash: 63, education: 44 },
  { quarter: 'Q1 26', health: 78, wash: 66, education: 47 },
  { quarter: 'Q2 26', health: 83, wash: 64, education: null },
  { quarter: 'Q3 26', health: 88, wash: 71, education: 52 },
]

export default function LineChartMultiple() {
  return (
    <LineChart
      title="Townships covered, by sector"
      description="Education has no Q2 2026 report, so its line breaks there."
      data={data}
      index="quarter"
      indexLabel="Quarter"
      series={[
        { key: 'health', label: 'Health' },
        { key: 'wash', label: 'WASH' },
        { key: 'education', label: 'Education' },
      ]}
    />
  )
}
