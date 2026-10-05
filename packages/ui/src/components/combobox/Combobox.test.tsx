import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Combobox } from './Combobox'

const options = [
  { value: 'mm', label: 'Myanmar' },
  { value: 'th', label: 'Thailand' },
  { value: 'sg', label: 'Singapore' },
  { value: 'st', label: 'São Tomé', disabled: true },
]

describe('Combobox', () => {
  it('filters as you type and picks with the keyboard', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Combobox aria-label="Country" options={options} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('combobox', { name: 'Country' })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    await user.type(input, 'an')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const listbox = screen.getByRole('listbox')
    expect(input).toHaveAttribute('aria-controls', listbox.id)
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Myanmar', 'Thailand'])
    // The first match is highlighted; ArrowDown moves to the next.
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1]!.id)
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('th')
    expect(input).toHaveValue('Thailand')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('ignores accents, skips disabled options and says when nothing matches', async () => {
    const { user } = renderWithProvider(<Combobox aria-label="Country" options={options} />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'sao')
    const option = screen.getByRole('option', { name: 'São Tomé' })
    expect(option).toHaveAttribute('aria-disabled', 'true')
    await user.clear(input)
    await user.type(input, 'xyz')
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('opens on a click but not on Tab focus, and the chevron closes it', async () => {
    const { user } = renderWithProvider(<Combobox aria-label="Country" options={options} />)
    const input = screen.getByRole('combobox')
    await user.tab()
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    await user.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(4)
    await user.click(input.nextElementSibling!)
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveFocus()
  })

  it('restores the picked label on Escape and marks the picked option', async () => {
    const { user } = renderWithProvider(
      <Combobox aria-label="Country" options={options} defaultValue="mm" />,
    )
    const input = screen.getByRole('combobox')
    expect(input).toHaveValue('Myanmar')
    await user.click(input)
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Myanmar' })).toHaveAttribute('aria-selected', 'true')
    await user.type(input, 'x')
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('Myanmar')
  })
})
