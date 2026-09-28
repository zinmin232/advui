import { Table } from '@advui/core'

const columns = ['Sector', 'Partners', 'Townships', 'Villages', 'Reached', 'Target']
const rows = [
  ['Health', '42', '118', '2,304', '410,220', '520,000'],
  ['Education', '35', '96', '1,877', '188,905', '250,000'],
  ['WASH', '28', '84', '1,512', '302,448', '300,000'],
  ['Protection', '31', '77', '980', '96,130', '140,000'],
]

export default function TableScroll() {
  return (
    <Table caption="Coverage by sector. Scroll sideways on small screens." striped minWidth={640}>
      <Table.Header>
        <Table.Row>
          {columns.map((column, index) => (
            <Table.Head key={column} align={index === 0 ? 'start' : 'end'}>
              {column}
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map(([sector, ...values]) => (
          <Table.Row key={sector}>
            <Table.Cell>{sector}</Table.Cell>
            {values.map((value, index) => (
              <Table.Cell key={columns[index + 1]} align="end">
                {value}
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
