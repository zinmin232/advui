import { type DateRange, DateRangePicker, FormField } from '@advui/core'
import { useState } from 'react'

export default function DateRangePickerBasic() {
  const [stay, setStay] = useState<DateRange>({
    start: new Date(2026, 11, 22),
    end: new Date(2026, 11, 29),
  })
  return (
    <FormField label="Stay" width="100%" maxWidth={320}>
      <DateRangePicker value={stay} onValueChange={setStay} />
    </FormField>
  )
}
