import { Heatmap } from '@advui/charts'

const states = [
  { state: 'Kachin', health: 34, wash: 21, education: 12, protection: 18, food: 26 },
  { state: 'Shan', health: 41, wash: 28, education: 19, protection: 11, food: 33 },
  { state: 'Rakhine', health: 47, wash: 44, education: 9, protection: 29, food: 48 },
  { state: 'Chin', health: 14, wash: 8, education: 6, protection: 4, food: 12 },
  { state: 'Sagaing', health: 38, wash: 17, education: 22, protection: 25, food: 30 },
]

export default function HeatmapBasic() {
  return (
    <Heatmap
      title="Active projects, by state and sector"
      description="September 2026"
      data={states}
      index="state"
      indexLabel="State"
      series={[
        { key: 'health', label: 'Health' },
        { key: 'wash', label: 'WASH' },
        { key: 'education', label: 'Education' },
        { key: 'protection', label: 'Protection' },
        { key: 'food', label: 'Food' },
      ]}
    />
  )
}
