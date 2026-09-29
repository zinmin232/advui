import { PieChart } from '@advui/charts'

// Eight parts is too many to tell apart: the smallest fold into "Other".
export default function PieChartOther() {
  return (
    <PieChart
      title="Funding by donor"
      description="Share of 2026 contributions"
      variant="pie"
      maxSlices={5}
      valueFormatter={(v) => `$${v}M`}
      data={[
        { label: 'Donor A', value: 48 },
        { label: 'Donor B', value: 31 },
        { label: 'Donor C', value: 22 },
        { label: 'Donor D', value: 14 },
        { label: 'Donor E', value: 6 },
        { label: 'Donor F', value: 4 },
        { label: 'Donor G', value: 3 },
        { label: 'Donor H', value: 2 },
      ]}
    />
  )
}
