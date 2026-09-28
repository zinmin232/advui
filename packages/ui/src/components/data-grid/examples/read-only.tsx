import { Badge, DataGrid, type DataGridColumn } from '@advui/core'

interface Partner {
  id: string
  name: string
  type: string
  townships: number
  status: 'Active' | 'Paused'
}

const partners: Partner[] = [
  { id: '1', name: 'Shwe Health', type: 'NNGO', townships: 14, status: 'Active' },
  { id: '2', name: 'Green Valley', type: 'NNGO', townships: 9, status: 'Active' },
  { id: '3', name: 'River Delta Relief', type: 'INGO', townships: 21, status: 'Paused' },
  { id: '4', name: 'Care Myanmar', type: 'INGO', townships: 33, status: 'Active' },
]

const columns: DataGridColumn<Partner>[] = [
  { id: 'name', header: 'Organization', width: 180 },
  { id: 'type', header: 'Type', width: 90 },
  { id: 'townships', header: 'Townships', type: 'number', width: 110 },
  {
    id: 'status',
    header: 'Status',
    width: 110,
    cell: (row) => (
      <Badge size="sm" variant={row.status === 'Active' ? 'success' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
]

export default function DataGridReadOnly() {
  return (
    <DataGrid aria-label="Partners" defaultData={partners} columns={columns} readOnly size="sm" />
  )
}
