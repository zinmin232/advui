import { Calendar, type DateRange } from '@advui/core'
import { useState } from 'react'

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function CalendarRange() {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2026, 3, 7),
    end: new Date(2026, 3, 16),
  })
  return (
    <Calendar
      mode="range"
      value={range}
      onValueChange={setRange}
      isDateDisabled={isWeekend}
      weekStartsOn={1}
      min={new Date(2026, 3, 2)}
      today={new Date(2026, 3, 1)}
    />
  )
}
