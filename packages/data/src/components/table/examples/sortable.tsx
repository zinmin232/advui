import { Table, type TableSortDirection } from '@advui/data'
import { useState } from 'react'

const townships = [
  { name: 'Hlaing Tharyar', region: 'Yangon', population: 687867 },
  { name: 'Pyigyitagon', region: 'Mandalay', population: 237618 },
  { name: 'Mawlamyine', region: 'Mon', population: 289388 },
  { name: 'Sittwe', region: 'Rakhine', population: 147899 },
]

type Key = 'name' | 'population'

export default function TableSortable() {
  const [sort, setSort] = useState<{ key: Key; direction: TableSortDirection }>({
    key: 'population',
    direction: 'descending',
  })
  const rows = [...townships].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0
    return sort.direction === 'ascending' ? order : -order
  })
  const direction = (key: Key) => (sort.key === key ? sort.direction : 'none')
  const toggle = (key: Key) =>
    setSort({
      key,
      direction: sort.key === key && sort.direction === 'ascending' ? 'descending' : 'ascending',
    })

  return (
    <Table aria-label="Townships by population" size="sm">
      <Table.Header>
        <Table.Row>
          <Table.Head sortDirection={direction('name')} onSort={() => toggle('name')}>
            Township
          </Table.Head>
          <Table.Head>Region</Table.Head>
          <Table.Head
            align="end"
            sortDirection={direction('population')}
            onSort={() => toggle('population')}
          >
            Population
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.name}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.region}</Table.Cell>
            <Table.Cell align="end">{row.population.toLocaleString('en-US')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
