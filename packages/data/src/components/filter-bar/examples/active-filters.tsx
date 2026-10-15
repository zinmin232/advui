import { type FilterDefinition, type FilterState, FilterBar } from '@advui/data'
import { useState } from 'react'

const filters: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  {
    key: 'department',
    label: 'Department',
    type: 'multi-select',
    options: [
      { label: 'Engineering', value: 'engineering' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' },
    ],
  },
  { key: 'verified', label: 'Verified', type: 'boolean' },
  { key: 'joined', label: 'Joined', type: 'date' },
]

export default function FilterBarActiveFilters() {
  const [state, setState] = useState<FilterState>({
    status: 'active',
    department: ['engineering', 'finance', 'operations'],
    verified: false,
    joined: new Date(2026, 9, 1),
  })
  return (
    <FilterBar
      aria-label="Filter users"
      width="100%"
      locale="en-US"
      filters={filters}
      value={state}
      onValueChange={setState}
      showActiveCount
      showActiveFilters
      showResetButton
    />
  )
}
