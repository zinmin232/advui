import { RadarChart } from '@advui/charts'

const skills = [
  { skill: 'Data entry', score: 4.5 },
  { skill: 'Mapping', score: 3 },
  { skill: 'Analysis', score: 3.5 },
  { skill: 'Reporting', score: 4 },
  { skill: 'Training', score: 2.5 },
]

export default function RadarChartCircle() {
  return (
    <RadarChart
      title="Team skills"
      description="Average self-rating out of 5"
      data={skills}
      index="skill"
      indexLabel="Skill"
      series={[{ key: 'score', label: 'Score' }]}
      max={5}
      grid="circle"
      height={260}
    />
  )
}
