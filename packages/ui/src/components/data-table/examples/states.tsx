import { Button, DataTable, HStack, type DataTableColumn } from '@advui/core'
import { useState } from 'react'

interface Partner {
  id: string
  name: string
}

const columns: DataTableColumn<Partner>[] = [
  { id: 'name', header: 'Partner', sortable: true },
  { id: 'id', header: 'Code', align: 'end' },
]

export default function DataTableStates() {
  const [state, setState] = useState<'loading' | 'empty'>('loading')
  return (
    <DataTable
      aria-label="Partners"
      size="sm"
      variant="outline"
      data={[] as Partner[]}
      columns={columns}
      loading={state === 'loading'}
      searchable
      toolbar={
        <HStack gap="$2">
          <Button size="sm" variant="outline" onPress={() => setState('loading')}>
            Loading
          </Button>
          <Button size="sm" variant="outline" onPress={() => setState('empty')}>
            Empty
          </Button>
        </HStack>
      }
    />
  )
}
