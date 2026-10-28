import { ComposedChart } from '@advui/charts'

const quarters = [
  { quarter: 'Q1', un: 4.2, ingo: 3.1, ngo: 1.4, total: 8.7 },
  { quarter: 'Q2', un: 3.6, ingo: 3.4, ngo: 1.9, total: 8.9 },
  { quarter: 'Q3', un: 5.1, ingo: 2.8, ngo: 2.2, total: 10.1 },
  { quarter: 'Q4', un: 4.8, ingo: 3.9, ngo: 2.6, total: 11.3 },
]

export default function ComposedChartStacked() {
  return (
    <ComposedChart
      title="Funding received, by organization type"
      description="Millions of USD, 2026"
      data={quarters}
      index="quarter"
      indexLabel="Quarter"
      stacked
      series={[
        { key: 'un', label: 'UN' },
        { key: 'ingo', label: 'INGO' },
        { key: 'ngo', label: 'NGO' },
        { key: 'total', label: 'Total', type: 'line' },
      ]}
      valueFormatter={(v) => `$${v}M`}
    />
  )
}
