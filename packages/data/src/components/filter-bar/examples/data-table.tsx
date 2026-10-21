import { Badge, VStack } from '@advui/core'
import {
  type DataTableColumn,
  DataTable,
  type FilterDefinition,
  type FilterState,
  FilterBar,
} from '@advui/data'
import { useState } from 'react'

interface Member {
  id: string
  name: string
  department: 'engineering' | 'finance' | 'operations'
  status: 'active' | 'inactive' | 'pending'
  verified: boolean
}

const members: Member[] = [
  { id: 'U-1', name: 'Aye Chan', department: 'engineering', status: 'active', verified: true },
  { id: 'U-2', name: 'Min Thu', department: 'finance', status: 'active', verified: false },
  { id: 'U-3', name: 'Su Myat', department: 'operations', status: 'pending', verified: false },
  { id: 'U-4', name: 'Kyaw Zin', department: 'engineering', status: 'inactive', verified: true },
  { id: 'U-5', name: 'Hnin Wai', department: 'finance', status: 'active', verified: true },
  { id: 'U-6', name: 'Thura Aung', department: 'operations', status: 'active', verified: true },
]

const departments = { engineering: 'Engineering', finance: 'Finance', operations: 'Operations' }
const statuses = { active: 'Active', inactive: 'Inactive', pending: 'Pending' }
const statusVariant = { active: 'success', inactive: 'secondary', pending: 'warning' } as const

const filters: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: Object.entries(statuses).map(([value, label]) => ({ value, label })),
  },
  {
    key: 'department',
    label: 'Department',
    type: 'multi-select',
    options: Object.entries(departments).map(([value, label]) => ({ value, label })),
  },
  { key: 'verified', label: 'Verified', type: 'boolean' },
]

const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, flex: 2 },
  { id: 'department', header: 'Department', cell: (row) => departments[row.department] },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge size="sm" variant={statusVariant[row.status]}>
        {statuses[row.status]}
      </Badge>
    ),
  },
  { id: 'verified', header: 'Verified', cell: (row) => (row.verified ? 'Yes' : 'No') },
]

// Filter Bar only holds the filters; the app applies them to its data.
// An unset filter is null, and a missing key reads as unset here.
function matches(member: Member, { search, status, department, verified }: FilterState) {
  const text = typeof search === 'string' ? search.toLowerCase() : ''
  return (
    (!text || member.name.toLowerCase().includes(text)) &&
    (status == null || member.status === status) &&
    (!Array.isArray(department) || department.includes(member.department)) &&
    (verified == null || member.verified === verified)
  )
}

export default function FilterBarDataTable() {
  const [state, setState] = useState<FilterState>({})
  const rows = members.filter((member) => matches(member, state))
  return (
    <VStack gap="3" width="100%">
      <FilterBar
        aria-label="Filter members"
        variant="ghost"
        searchable
        searchPlaceholder="Search members…"
        filters={filters}
        value={state}
        onValueChange={setState}
        showResetButton
      />
      <DataTable aria-label="Members" data={rows} columns={columns} minWidth={560} />
    </VStack>
  )
}
