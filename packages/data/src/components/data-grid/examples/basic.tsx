import { Text, VStack } from '@advui/core'
import { DataGrid, type DataGridColumn } from '@advui/data'
import { useState } from 'react'

interface Row {
  id: string
  township: string
  sector: string
  target: number
  reached: number | null
}

const initial: Row[] = [
  { id: 'MMR004001', township: 'Hakha', sector: 'Health', target: 5000, reached: 4200 },
  { id: 'MMR012001', township: 'Sittwe', sector: 'WASH', target: 12000, reached: 9800 },
  { id: 'MMR017006', township: 'Labutta', sector: 'Food Security', target: 8000, reached: 8150 },
  { id: 'MMR001001', township: 'Myitkyina', sector: 'Protection', target: 3500, reached: null },
  { id: 'MMR005011', township: 'Mawlamyine', sector: 'Education', target: 2600, reached: 1900 },
]

const number = (value: unknown) => (typeof value === 'number' ? value.toLocaleString('en-US') : '')

const columns: DataGridColumn<Row>[] = [
  { id: 'township', header: 'Township', width: 140 },
  { id: 'sector', header: 'Sector', width: 150, editable: true },
  {
    id: 'target',
    header: 'Target',
    type: 'number',
    width: 110,
    editable: true,
    format: number,
    validate: (value) => (value == null || Number(value) <= 0 ? 'Must be more than 0.' : null),
  },
  {
    id: 'reached',
    header: 'Reached',
    type: 'number',
    width: 110,
    editable: true,
    format: number,
    validate: (value) => (value != null && Number(value) < 0 ? 'Must be 0 or more.' : null),
  },
  {
    id: 'progress',
    header: 'Progress',
    width: 100,
    align: 'end',
    accessor: (row) =>
      row.reached == null ? null : `${Math.round((row.reached / row.target) * 100)}%`,
  },
]

export default function DataGridBasic() {
  const [rows, setRows] = useState(initial)
  const [last, setLast] = useState('Double-click a cell, or press Enter, to edit.')
  return (
    <VStack gap="$2" width="100%">
      <DataGrid
        aria-label="Reach by township"
        data={rows}
        onDataChange={setRows}
        columns={columns}
        getRowLabel={(row) => row.township}
        onCellChange={({ row, columnId, value }) =>
          setLast(`${row.township} ${columnId} set to ${value ?? 'empty'}.`)
        }
      />
      <Text size="xs" tone="muted">
        {last}
      </Text>
    </VStack>
  )
}
