import { Calendar } from '@advui/core'
import { useState } from 'react'

export default function CalendarBasic() {
  const [day, setDay] = useState<Date | null>(new Date(2026, 2, 12))
  // A fixed month and "today" keep the example (and its screenshot) stable.
  return <Calendar value={day} onValueChange={setDay} today={new Date(2026, 2, 3)} />
}
