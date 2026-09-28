import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { DataTable, type DataTableColumn } from './DataTable'

interface Row {
  id: string
  name: string
  count: number | null
}

const rows: Row[] = [
  { id: 'a', name: 'Bago', count: 30 },
  { id: 'b', name: 'Ayeyarwady', count: 5 },
  { id: 'c', name: 'Chin', count: null },
  { id: 'd', name: 'Dawei', count: 12 },
  { id: 'e', name: 'Éinme', count: 7 },
]

const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', sortable: true },
  { id: 'count', header: 'Count', sortable: true, align: 'end' },
]

const names = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]!.textContent)

describe('DataTable', () => {
  it('renders the rows in data order as a named table', () => {
    renderWithProvider(<DataTable aria-label="Regions" data={rows} columns={columns} />)
    expect(screen.getByRole('table', { name: 'Regions' })).toBeInTheDocument()
    expect(names()).toEqual(['Bago', 'Ayeyarwady', 'Chin', 'Dawei', 'Éinme'])
    expect(screen.getByText('1–5 of 5')).toBeInTheDocument()
  })

  it('sorts ascending, descending, then back to data order; empty values stay last', async () => {
    const onSortChange = vi.fn()
    const { user } = renderWithProvider(
      <DataTable aria-label="Regions" data={rows} columns={columns} onSortChange={onSortChange} />,
    )
    const count = () => screen.getByRole('button', { name: 'Count' })
    await user.click(count())
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'count', direction: 'ascending' })
    expect(names()).toEqual(['Ayeyarwady', 'Éinme', 'Dawei', 'Bago', 'Chin'])
    expect(screen.getAllByRole('columnheader')[1]).toHaveAttribute('aria-sort', 'ascending')
    await user.click(count())
    expect(names()).toEqual(['Bago', 'Dawei', 'Éinme', 'Ayeyarwady', 'Chin'])
    await user.click(count())
    expect(onSortChange).toHaveBeenLastCalledWith(null)
    expect(names()).toEqual(['Bago', 'Ayeyarwady', 'Chin', 'Dawei', 'Éinme'])
  })

  it('filters with the search field, ignoring case and accents', async () => {
    const { user } = renderWithProvider(
      <DataTable aria-label="Regions" data={rows} columns={columns} searchable />,
    )
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'EIN')
    expect(names()).toEqual(['Éinme'])
    await user.clear(screen.getByRole('searchbox'))
    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('pages the rows', async () => {
    const onPageChange = vi.fn()
    const { user } = renderWithProvider(
      <DataTable
        aria-label="Regions"
        data={rows}
        columns={columns}
        pageSize={2}
        onPageChange={onPageChange}
      />,
    )
    expect(names()).toEqual(['Bago', 'Ayeyarwady'])
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
    expect(names()).toEqual(['Éinme'])
    expect(screen.getByText('5–5 of 5')).toBeInTheDocument()
  })

  it('selects rows and all rows on the page', async () => {
    const onSelectedIdsChange = vi.fn()
    const { user } = renderWithProvider(
      <DataTable
        aria-label="Regions"
        data={rows}
        columns={columns}
        pageSize={2}
        selectable
        getRowLabel={(row) => row.name}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    )
    const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    await user.click(screen.getByRole('checkbox', { name: 'Select Bago' }))
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a'])
    expect(all).toHaveAttribute('aria-checked', 'mixed')
    expect(screen.getByText('1 selected · 1–2 of 5')).toBeInTheDocument()
    await user.click(all)
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(['a', 'b'])
    await user.click(all)
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith([])
  })

  it('shows placeholders while loading', () => {
    const { container } = renderWithProvider(
      <DataTable aria-label="Regions" data={rows} columns={columns} loading />,
    )
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(screen.queryByText('Bago')).not.toBeInTheDocument()
  })

  it('renders custom cells and a custom empty state', () => {
    renderWithProvider(
      <>
        <DataTable
          aria-label="Custom"
          data={rows.slice(0, 1)}
          columns={[{ id: 'name', header: 'Name', cell: (row) => <b>{row.name}!</b> }]}
        />
        <DataTable
          aria-label="Empty"
          data={[]}
          columns={columns}
          empty={<span>Nothing yet</span>}
        />
      </>,
    )
    expect(screen.getByText('Bago!')).toBeInTheDocument()
    expect(screen.getByText('Nothing yet')).toBeInTheDocument()
  })
})
