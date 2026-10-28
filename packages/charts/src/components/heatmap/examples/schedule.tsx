import { Heatmap } from '@advui/charts'

const days = [
  { day: 'Mon', early: 12, morning: 48, midday: 31, afternoon: 39, evening: 8 },
  { day: 'Tue', early: 9, morning: 52, midday: 28, afternoon: 44, evening: 11 },
  { day: 'Wed', early: 14, morning: 45, midday: 35, afternoon: 37, evening: null },
  { day: 'Thu', early: 10, morning: 57, midday: 30, afternoon: 41, evening: 9 },
  { day: 'Fri', early: 7, morning: 40, midday: 22, afternoon: 26, evening: 5 },
  { day: 'Sat', early: 2, morning: 11, midday: 9, afternoon: 6, evening: 1 },
  { day: 'Sun', early: 0, morning: 4, midday: 3, afternoon: 2, evening: 0 },
]

export default function HeatmapSchedule() {
  return (
    <Heatmap
      title="Reports submitted, by day and time"
      description="Last four weeks; Wednesday evening was not recorded"
      data={days}
      index="day"
      indexLabel="Day"
      color="chart3"
      series={[
        { key: 'early', label: '6–9' },
        { key: 'morning', label: '9–12' },
        { key: 'midday', label: '12–15' },
        { key: 'afternoon', label: '15–18' },
        { key: 'evening', label: '18–21' },
      ]}
      valueFormatter={(v) => `${v} reports`}
    />
  )
}
