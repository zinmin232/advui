import { Badge } from '@advui/core'
import { Table } from '@advui/data'

const invoices = [
  { id: 'INV-001', partner: 'Shwe Health', status: 'Paid', amount: '$250.00' },
  { id: 'INV-002', partner: 'Green Valley NGO', status: 'Pending', amount: '$150.00' },
  { id: 'INV-003', partner: 'River Delta Relief', status: 'Unpaid', amount: '$350.00' },
  { id: 'INV-004', partner: 'Hill Schools', status: 'Paid', amount: '$450.00' },
]

const statusVariant = { Paid: 'success', Pending: 'warning', Unpaid: 'secondary' } as const

export default function TableBasic() {
  return (
    <Table caption="Recent invoices" variant="outline" minWidth={480}>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head flex={2}>Partner</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell>{invoice.id}</Table.Cell>
            <Table.Cell flex={2}>{invoice.partner}</Table.Cell>
            <Table.Cell>
              <Badge
                size="sm"
                variant={statusVariant[invoice.status as keyof typeof statusVariant]}
              >
                {invoice.status}
              </Badge>
            </Table.Cell>
            <Table.Cell align="end">{invoice.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell flexGrow={5}>Total</Table.Cell>
          <Table.Cell align="end">$1,200.00</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table>
  )
}
