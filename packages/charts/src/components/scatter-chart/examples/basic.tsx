import { ScatterChart } from '@advui/charts'

const projects = [
  { project: 'Mobile clinics', sector: 'Health', budget: 420, reached: 38 },
  { project: 'Maternal care', sector: 'Health', budget: 260, reached: 21 },
  { project: 'Vaccination drive', sector: 'Health', budget: 180, reached: 46 },
  { project: 'Water points', sector: 'WASH', budget: 310, reached: 52 },
  { project: 'Latrines', sector: 'WASH', budget: 150, reached: 19 },
  { project: 'Hygiene kits', sector: 'WASH', budget: 90, reached: 33 },
  { project: 'Temporary classrooms', sector: 'Education', budget: 240, reached: 12 },
  { project: 'Teacher stipends', sector: 'Education', budget: 120, reached: 9 },
  { project: 'Learning kits', sector: 'Education', budget: 70, reached: 15 },
]

export default function ScatterChartBasic() {
  return (
    <ScatterChart
      title="Budget and reach, by project"
      description="2026, thousands"
      data={projects}
      x="budget"
      y="reached"
      xLabel="Budget (USD)"
      yLabel="People reached"
      index="project"
      indexLabel="Project"
      category="sector"
      categoryLabel="Sector"
      startAtZero
      valueFormatter={(value, field) => (field === 'x' ? `$${value}K` : `${value}K`)}
    />
  )
}
