import { RadarChart } from '@advui/charts'

const sectors = [
  { sector: 'Health', kachin: 82, rakhine: 64 },
  { sector: 'WASH', kachin: 71, rakhine: 78 },
  { sector: 'Education', kachin: 58, rakhine: 41 },
  { sector: 'Protection', kachin: 66, rakhine: 52 },
  { sector: 'Food', kachin: 74, rakhine: 85 },
  { sector: 'Shelter', kachin: 49, rakhine: 70 },
]

export default function RadarChartBasic() {
  return (
    <RadarChart
      title="Coverage by sector"
      description="Share of people in need reached, 2026"
      data={sectors}
      index="sector"
      indexLabel="Sector"
      series={[
        { key: 'kachin', label: 'Kachin' },
        { key: 'rakhine', label: 'Rakhine' },
      ]}
      max={100}
      valueFormatter={(v) => `${v}%`}
    />
  )
}
