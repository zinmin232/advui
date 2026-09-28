import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { DataGrid, type DataGridColumn } from './DataGrid'

interface Row {
  id: string
  township: string
  reached: number | null
}

const rows: Row[] = [
  { id: 'a', township: 'Hakha', reached: 4200 },
  { id: 'b', township: 'Sittwe', reached: 9800 },
]

const columns: DataGridColumn<Row>[] = [
  { id: 'township', header: 'Township', editable: true },
  {
    id: 'reached',
    header: 'Reached',
    type: 'number',
    editable: true,
    validate: (value) => (value != null && Number(value) < 0 ? 'Must be 0 or more.' : null),
  },
]

describe('DataGrid', () => {
  it('is a named grid with one tab stop', () => {
    renderWithProvider(<DataGrid aria-label="Reach" defaultData={rows} columns={columns} />)
    const grid = screen.getByRole('grid', { name: 'Reach' })
    expect(grid).toHaveAttribute('aria-rowcount', '3')
    expect(
      within(grid)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Township', 'Reached'])
    const cells = within(grid).getAllByRole('gridcell')
    expect(cells).toHaveLength(4)
    expect(cells.filter((cell) => cell.getAttribute('tabindex') === '0')).toEqual([cells[0]])
  })

  it('moves with the arrow keys, Home and End', async () => {
    const { user } = renderWithProvider(
      <DataGrid aria-label="Reach" defaultData={rows} columns={columns} />,
    )
    const cells = screen.getAllByRole('gridcell')
    await user.click(cells[0]!)
    await user.keyboard('{ArrowRight}')
    expect(cells[1]).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(cells[3]).toHaveFocus()
    expect(cells[3]).toHaveAttribute('tabindex', '0')
    await user.keyboard('{Home}')
    expect(cells[2]).toHaveFocus()
    await user.keyboard('{Control>}{Home}{/Control}')
    expect(cells[0]).toHaveFocus()
  })

  it('edits with Enter, saves with Enter and moves down', async () => {
    const onCellChange = vi.fn()
    const onDataChange = vi.fn()
    const { user } = renderWithProvider(
      <DataGrid
        aria-label="Reach"
        defaultData={rows}
        columns={columns}
        onCellChange={onCellChange}
        onDataChange={onDataChange}
      />,
    )
    await user.click(screen.getAllByRole('gridcell')[1]!)
    await user.keyboard('{Enter}')
    const field = screen.getByRole('textbox', { name: 'Reached, Hakha' })
    expect(field).toHaveValue('4200')
    await user.clear(field)
    await user.type(field, '4,500{Enter}')
    expect(onCellChange).toHaveBeenCalledWith(
      expect.objectContaining({
        rowId: 'a',
        columnId: 'reached',
        value: 4500,
        previousValue: 4200,
      }),
    )
    expect(onDataChange).toHaveBeenLastCalledWith([{ ...rows[0], reached: 4500 }, rows[1]])
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')[3]).toHaveFocus()
  })

  it('starts editing by typing, and Escape cancels', async () => {
    const onCellChange = vi.fn()
    const { user } = renderWithProvider(
      <DataGrid
        aria-label="Reach"
        defaultData={rows}
        columns={columns}
        onCellChange={onCellChange}
      />,
    )
    await user.click(screen.getAllByRole('gridcell')[0]!)
    await user.keyboard('M')
    expect(screen.getByRole('textbox', { name: 'Township, Hakha' })).toHaveValue('M')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(onCellChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('gridcell')[0]).toHaveFocus()
  })

  it('rejects invalid values and says why', async () => {
    const onCellChange = vi.fn()
    const { user } = renderWithProvider(
      <DataGrid
        aria-label="Reach"
        defaultData={rows}
        columns={columns}
        onCellChange={onCellChange}
      />,
    )
    await user.click(screen.getAllByRole('gridcell')[1]!)
    await user.keyboard('{F2}')
    const field = screen.getByRole('textbox')
    await user.clear(field)
    await user.type(field, 'abc{Enter}')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Reached, Hakha: Enter a number.')).toBeInTheDocument()
    await user.clear(field)
    await user.type(field, '-5{Enter}')
    expect(screen.getByText('Reached, Hakha: Must be 0 or more.')).toBeInTheDocument()
    expect(onCellChange).not.toHaveBeenCalled()
  })

  it('does not edit when read-only', async () => {
    const { user } = renderWithProvider(
      <DataGrid aria-label="Reach" defaultData={rows} columns={columns} readOnly />,
    )
    expect(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true')
    await user.click(screen.getAllByRole('gridcell')[0]!)
    await user.keyboard('{Enter}x')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
