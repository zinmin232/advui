import { Button, Heading } from '@advui/core'
import { type FilterDefinition, type FilterState, FilterBar } from '@advui/data'
import { DownloadIcon } from '@advui/icons'
import { useState } from 'react'

const filters: FilterDefinition[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'Editor', value: 'editor' },
      { label: 'Viewer', value: 'viewer' },
    ],
  },
]

export default function FilterBarCustomContent() {
  const [state, setState] = useState<FilterState>({})
  return (
    <FilterBar
      aria-label="Filter users"
      width="100%"
      variant="outline"
      leading={
        <Heading level={3} size="lg">
          Users
        </Heading>
      }
      trailing={
        <Button variant="outline" icon={<DownloadIcon />}>
          Export
        </Button>
      }
      searchable
      filters={filters}
      value={state}
      onValueChange={setState}
    />
  )
}
