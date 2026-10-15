import { type FilterDefinition, FilterBar } from '@advui/data'

const filters: FilterDefinition[] = [
  {
    key: 'level',
    label: 'Level',
    type: 'select',
    placeholder: 'Any level',
    options: [
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Error', value: 'error' },
    ],
  },
  { key: 'day', label: 'Day', type: 'date', placeholder: 'Any day' },
]

export default function FilterBarCompact() {
  return (
    <FilterBar
      aria-label="Filter audit log"
      width="100%"
      size="sm"
      variant="ghost"
      showLabels={false}
      searchable
      searchPlaceholder="Search events…"
      filters={filters}
      showResetButton
    />
  )
}
