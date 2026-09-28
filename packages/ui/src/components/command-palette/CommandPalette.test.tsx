import { describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen, waitFor, within } from '../../../test/utils'
import { type Command, CommandPalette, rankCommand } from './CommandPalette'

const make = (onSelect = vi.fn()): Command[] => [
  { id: 'home', label: 'Dashboard', group: 'Go to', onSelect },
  {
    id: 'partners',
    label: 'Partner directory',
    group: 'Go to',
    keywords: ['organizations'],
    onSelect,
  },
  { id: 'export', label: 'Export to Excel', group: 'Actions', onSelect },
  { id: 'admin', label: 'Admin console', group: 'Actions', disabled: true, onSelect },
]

describe('rankCommand', () => {
  it('ranks prefix, word and contains matches', () => {
    const command = { id: 'x', label: 'Export to Excel', keywords: ['xlsx'], onSelect: () => {} }
    expect(rankCommand(command, 'exp')).toBe(0)
    expect(rankCommand(command, 'exc')).toBe(1)
    expect(rankCommand(command, 'xls')).toBe(2)
    expect(rankCommand(command, 'pdf')).toBe(-1)
  })
})

describe('CommandPalette', () => {
  it('is a named dialog with a combobox and grouped options', async () => {
    renderWithProvider(<CommandPalette commands={make()} defaultOpen />)
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' })
    const input = within(dialog).getByRole('combobox', { name: 'Command palette' })
    expect(input).toHaveFocus()
    expect(within(dialog).getByRole('group', { name: 'Go to' })).toBeInTheDocument()
    const options = within(dialog).getAllByRole('option')
    expect(options).toHaveLength(4)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', options[0]!.id)
  })

  it('filters, moves with the arrows, skips disabled and runs with Enter', async () => {
    const onSelect = vi.fn()
    const commands = make(onSelect)
    const { user } = renderWithProvider(<CommandPalette commands={commands} defaultOpen />)
    const input = await screen.findByRole('combobox')
    await user.type(input, 'organ')
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Partner directory'])
    await user.clear(input)
    await user.keyboard('{ArrowUp}')
    // Wrapped past the disabled "Admin console" to "Export to Excel".
    expect(screen.getByRole('option', { name: 'Export to Excel' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledOnce()
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument(),
    )
  })

  it('shows the empty text', async () => {
    const { user } = renderWithProvider(<CommandPalette commands={make()} defaultOpen />)
    await user.type(await screen.findByRole('combobox'), 'zzz')
    expect(screen.getByText('No results.')).toBeInTheDocument()
  })

  it('opens and closes with ⌘K / Ctrl+K', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(
      <CommandPalette commands={make()} onOpenChange={onOpenChange} />,
    )
    await user.keyboard('{Control>}k{/Control}')
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    await act(async () => {
      await user.keyboard('{Meta>}k{/Meta}')
    })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('runs a command on press', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProvider(<CommandPalette commands={make(onSelect)} defaultOpen />)
    await user.click(await screen.findByRole('option', { name: 'Dashboard' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})
