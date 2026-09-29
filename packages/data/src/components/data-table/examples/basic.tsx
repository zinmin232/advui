import { Badge } from '@advui/core'
import { DataTable, type DataTableColumn } from '@advui/data'

interface Project {
  id: string
  organization: string
  sector: string
  township: string
  beneficiaries: number
  status: 'Ongoing' | 'Completed' | 'Planned'
}

const statusVariant = { Ongoing: 'success', Completed: 'secondary', Planned: 'info' } as const

const projects: Project[] = [
  {
    id: 'P-101',
    organization: 'Shwe Health',
    sector: 'Health',
    township: 'Hlaing Tharyar',
    beneficiaries: 12400,
    status: 'Ongoing',
  },
  {
    id: 'P-102',
    organization: 'Green Valley',
    sector: 'WASH',
    township: 'Sittwe',
    beneficiaries: 8300,
    status: 'Ongoing',
  },
  {
    id: 'P-103',
    organization: 'Hill Schools',
    sector: 'Education',
    township: 'Hakha',
    beneficiaries: 2150,
    status: 'Completed',
  },
  {
    id: 'P-104',
    organization: 'River Delta Relief',
    sector: 'Food Security',
    township: 'Labutta',
    beneficiaries: 15900,
    status: 'Planned',
  },
  {
    id: 'P-105',
    organization: 'Shwe Health',
    sector: 'Health',
    township: 'Mawlamyine',
    beneficiaries: 6100,
    status: 'Completed',
  },
  {
    id: 'P-106',
    organization: 'Care Myanmar',
    sector: 'Protection',
    township: 'Myitkyina',
    beneficiaries: 4700,
    status: 'Ongoing',
  },
  {
    id: 'P-107',
    organization: 'Green Valley',
    sector: 'WASH',
    township: 'Pakokku',
    beneficiaries: 9800,
    status: 'Planned',
  },
]

const columns: DataTableColumn<Project>[] = [
  { id: 'organization', header: 'Organization', sortable: true, flex: 2 },
  { id: 'sector', header: 'Sector', sortable: true },
  { id: 'township', header: 'Township', sortable: true },
  {
    id: 'beneficiaries',
    header: 'Reached',
    sortable: true,
    align: 'end',
    cell: (row) => row.beneficiaries.toLocaleString('en-US'),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge size="sm" variant={statusVariant[row.status]}>
        {row.status}
      </Badge>
    ),
  },
]

export default function DataTableBasic() {
  return (
    <DataTable
      aria-label="Projects"
      data={projects}
      columns={columns}
      getRowLabel={(row) => `${row.organization}, ${row.township}`}
      defaultSort={{ column: 'beneficiaries', direction: 'descending' }}
      pageSize={5}
      searchable
      selectable
      minWidth={640}
    />
  )
}
