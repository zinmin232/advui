import { type FilterDefinition, type FilterState, FilterBar } from '@advui/data'
import { useState } from 'react'

const filters: FilterDefinition[] = [
  { key: 'period', label: 'Period', type: 'date-range' },
  {
    key: 'channel',
    label: 'Channel',
    type: 'select',
    placeholder: 'All channels',
    options: [
      { label: 'Card', value: 'card' },
      { label: 'Bank transfer', value: 'bank' },
      { label: 'Mobile wallet', value: 'wallet' },
    ],
  },
  { key: 'flagged', label: 'Review', type: 'boolean', trueLabel: 'Flagged', falseLabel: 'Clear' },
]

export default function FilterBarDashboard() {
  const [state, setState] = useState<FilterState>({
    period: { start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) },
  })
  return (
    <FilterBar
      aria-label="Filter transactions"
      width="100%"
      layout="responsive"
      variant="filled"
      locale="en-US"
      searchable
      searchPlaceholder="Search transactions…"
      filters={filters}
      value={state}
      onValueChange={setState}
      showActiveCount
      showResetButton
    />
  )
}
