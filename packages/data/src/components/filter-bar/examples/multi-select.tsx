import { type FilterDefinition, FilterBar } from '@advui/data'

const filters: FilterDefinition[] = [
  {
    key: 'department',
    label: 'Department',
    type: 'multi-select',
    placeholder: 'All departments',
    options: [
      { label: 'Engineering', value: 'engineering' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' },
      { label: 'Legal', value: 'legal', disabled: true },
    ],
  },
]

export default function FilterBarMultiSelect() {
  return (
    <FilterBar
      aria-label="Filter staff"
      width="100%"
      filters={filters}
      defaultValue={{ department: ['engineering', 'finance'] }}
      showActiveFilters
    />
  )
}
