import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { TransferList } from './TransferList'

const columns = [
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'id', label: 'ID', disabled: true },
]

describe('TransferList', () => {
  it('splits the items between two named groups by value', () => {
    renderWithProvider(<TransferList items={columns} defaultValue={['email']} />)
    const source = screen.getByRole('group', { name: 'Available' })
    const target = screen.getByRole('group', { name: 'Selected' })
    expect(within(source).getAllByRole('checkbox')).toHaveLength(4) // Select all and 3 items
    expect(within(target).getByRole('checkbox', { name: 'Email' })).toBeInTheDocument()
    expect(within(source).queryByRole('checkbox', { name: 'Email' })).toBeNull()
    // Nothing is checked, so neither button moves anything.
    for (const name of ['Move to Selected', 'Move to Available'])
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-disabled', 'true')
  })

  it('moves checked items across in the order of items, and says so', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TransferList items={columns} defaultValue={['email']} onValueChange={onValueChange} />,
    )
    const source = screen.getByRole('group', { name: 'Available' })
    await user.click(within(source).getByRole('checkbox', { name: 'Role' }))
    await user.click(within(source).getByRole('checkbox', { name: 'Name' }))
    const add = screen.getByRole('button', { name: 'Move to Selected' })
    expect(add).not.toHaveAttribute('aria-disabled')
    await user.click(add)
    expect(onValueChange).toHaveBeenLastCalledWith(['name', 'email', 'role'])
    expect(screen.getByRole('status')).toHaveTextContent('2 moved to Selected')
    // The button keeps focus, and has nothing left to move.
    expect(add).toHaveFocus()
    expect(add).toHaveAttribute('aria-disabled', 'true')
    const target = screen.getByRole('group', { name: 'Selected' })
    expect(within(target).getAllByRole('checkbox')).toHaveLength(4)
    expect(within(target).getByRole('checkbox', { name: 'Role' })).not.toBeChecked()

    await user.click(within(target).getByRole('checkbox', { name: 'Email' }))
    await user.click(screen.getByRole('button', { name: 'Move to Available' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['name', 'role'])
    expect(screen.getByRole('status')).toHaveTextContent('1 moved to Available')
  })

  it('leaves disabled items out of Select all, and shows an empty list', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <TransferList
        items={columns}
        onValueChange={onValueChange}
        labels={{ source: 'Hidden columns', target: 'Shown columns', empty: 'None shown' }}
      />,
    )
    // An empty list has no group of checkboxes, only the text.
    expect(screen.queryByRole('group', { name: 'Shown columns' })).toBeNull()
    expect(screen.getByText('None shown')).toBeInTheDocument()
    const source = screen.getByRole('group', { name: 'Hidden columns' })
    await user.click(within(source).getByRole('checkbox', { name: 'Select all' }))
    await user.click(screen.getByRole('button', { name: 'Move to Shown columns' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['name', 'email', 'role'])
    expect(within(source).getByRole('checkbox', { name: 'ID' })).toBeDisabled()
  })
})
