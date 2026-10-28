import { ScatterChart } from '@advui/charts'

const townships = [
  { township: 'Hpakant', distance: 92, coverage: 41, people: 180000 },
  { township: 'Myitkyina', distance: 4, coverage: 86, people: 306000 },
  { township: 'Bhamo', distance: 18, coverage: 72, people: 154000 },
  { township: 'Mohnyin', distance: 64, coverage: 55, people: 213000 },
  { township: 'Putao', distance: 140, coverage: 28, people: 61000 },
  { township: 'Waingmaw', distance: 11, coverage: 79, people: 98000 },
  { township: 'Momauk', distance: 37, coverage: 63, people: 72000 },
]

export default function ScatterChartBubble() {
  return (
    <ScatterChart
      title="Coverage falls with distance"
      description="Kachin townships; bubble size is population"
      data={townships}
      x="distance"
      y="coverage"
      size="people"
      xLabel="Distance to a hub (km)"
      yLabel="Coverage (%)"
      sizeLabel="Population"
      index="township"
      indexLabel="Township"
      startAtZero
      valueFormatter={(value, field) =>
        field === 'x' ? `${value} km` : field === 'y' ? `${value}%` : value.toLocaleString('en-US')
      }
    />
  )
}
