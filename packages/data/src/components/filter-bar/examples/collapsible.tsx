import { type FilterDefinition, FilterBar } from '@advui/data'

const filters: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ],
  },
  { key: 'reference', label: 'Reference', type: 'text', placeholder: 'INV-…', advanced: true },
  { key: 'due', label: 'Due date', type: 'date', advanced: true },
  { key: 'disputed', label: 'Disputed', type: 'boolean', advanced: true },
]

export default function FilterBarCollapsible() {
  return (
    <FilterBar
      aria-label="Filter invoices"
      width="100%"
      variant="outline"
      collapsible
      searchable
      filters={filters}
      defaultValue={{ disputed: true }}
      showResetButton
    />
  )
}
