import { Heatmap } from '@advui/charts'

const states = [
  { state: 'Kachin', health: 6, wash: -4, education: 2, protection: -9, food: 11 },
  { state: 'Shan', health: -3, wash: 8, education: -12, protection: 1, food: 4 },
  { state: 'Rakhine', health: 14, wash: 17, education: -6, protection: 9, food: 21 },
  { state: 'Chin', health: -8, wash: -11, education: 0, protection: -2, food: -5 },
  { state: 'Sagaing', health: 3, wash: -1, education: 7, protection: 12, food: -15 },
]

export default function HeatmapChange() {
  return (
    <Heatmap
      title="Change in active projects since August"
      description="Orange for fewer projects, blue for more"
      data={states}
      index="state"
      indexLabel="State"
      scale="diverging"
      series={[
        { key: 'health', label: 'Health' },
        { key: 'wash', label: 'WASH' },
        { key: 'education', label: 'Education' },
        { key: 'protection', label: 'Protection' },
        { key: 'food', label: 'Food' },
      ]}
      valueFormatter={(v) => (v > 0 ? `+${v}` : String(v))}
    />
  )
}
