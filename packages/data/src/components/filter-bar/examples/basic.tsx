import { type FilterDefinition, FilterBar } from '@advui/data'

const filters: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ],
  },
]

export default function FilterBarBasic() {
  return (
    <FilterBar
      aria-label="Filter users"
      width="100%"
      searchable
      searchPlaceholder="Search users…"
      filters={filters}
    />
  )
}
