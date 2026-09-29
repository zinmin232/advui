import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { Table } from './Table'

function Invoices(props: Partial<Parameters<typeof Table>[0]>) {
  return (
    <Table caption="Recent invoices" {...props}>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>INV-001</Table.Cell>
          <Table.Cell align="end">$250.00</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>INV-002</Table.Cell>
          <Table.Cell align="end">$150.00</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>INV-003</Table.Cell>
          <Table.Cell align="end">$350.00</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

describe('Table', () => {
  it('exposes table semantics named by its caption', () => {
    renderWithProvider(<Invoices />)
    const table = screen.getByRole('table', { name: 'Recent invoices' })
    expect(within(table).getAllByRole('rowgroup')).toHaveLength(2)
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Invoice', 'Amount'])
    expect(within(table).getAllByRole('cell')).toHaveLength(6)
  })

  it('prefers aria-label over the caption for the name', () => {
    renderWithProvider(<Invoices aria-label="Invoices" />)
    expect(screen.getByRole('table', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByText('Recent invoices')).toBeInTheDocument()
  })

  it('divides body rows except the last, and stripes every other one', () => {
    renderWithProvider(<Invoices striped />)
    const rows = screen.getAllByRole('row').slice(1)
    const style = (row: HTMLElement) => getComputedStyle(row)
    expect(style(rows[0]!).borderBottomWidth).toBe('1px')
    expect(style(rows[2]!).borderBottomWidth).not.toBe('1px')
    expect(style(rows[1]!).backgroundColor).not.toBe(style(rows[0]!).backgroundColor)
    expect(style(rows[2]!).backgroundColor).toBe(style(rows[0]!).backgroundColor)
  })

  it('makes a sortable header a button with aria-sort', async () => {
    const onSort = vi.fn()
    const { user } = renderWithProvider(
      <Table aria-label="Townships">
        <Table.Header>
          <Table.Row>
            <Table.Head sortDirection="ascending" onSort={onSort}>
              Township
            </Table.Head>
            <Table.Head sortDirection="none" onSort={onSort}>
              Population
            </Table.Head>
            <Table.Head>Region</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>,
    )
    const [township, population, region] = screen.getAllByRole('columnheader')
    expect(township).toHaveAttribute('aria-sort', 'ascending')
    expect(population).toHaveAttribute('aria-sort', 'none')
    expect(region).not.toHaveAttribute('aria-sort')
    expect(within(region!).queryByRole('button')).not.toBeInTheDocument()
    await user.click(within(township!).getByRole('button', { name: 'Township' }))
    expect(onSort).toHaveBeenCalledOnce()
  })

  it('scrolls sideways below its minimum width', () => {
    renderWithProvider(<Invoices minWidth={640} />)
    expect(getComputedStyle(screen.getByRole('table')).minWidth).toBe('640px')
  })
})
