import { BarChart } from '@advui/core'

const data = [
  { township: 'Hlaing Tharyar', un: 12, ingo: 18, ngo: 26 },
  { township: 'Sittwe', un: 21, ingo: 15, ngo: 9 },
  { township: 'Myitkyina', un: 8, ingo: 14, ngo: 22 },
  { township: 'Hakha', un: 4, ingo: 9, ngo: 11 },
]

export default function BarChartStacked() {
  return (
    <BarChart
      title="Active organizations by township"
      description="By organization type"
      data={data}
      index="township"
      indexLabel="Township"
      layout="horizontal"
      stacked
      series={[
        { key: 'un', label: 'UN' },
        { key: 'ingo', label: 'INGO' },
        { key: 'ngo', label: 'NGO' },
      ]}
    />
  )
}
