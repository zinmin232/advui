import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Autocomplete } from './Autocomplete'

const options = ['Mandalay', 'Mawlamyine', 'Bago'].map((c) => ({ value: c, label: c }))

describe('Autocomplete', () => {
  it('keeps any typed text and fills in a picked suggestion', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Autocomplete aria-label="City" options={options} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('combobox', { name: 'City' })
    await user.type(input, 'ma')
    expect(screen.getAllByRole('option')).toHaveLength(2)
    await user.click(screen.getByRole('option', { name: 'Mawlamyine' }))
    expect(onValueChange).toHaveBeenLastCalledWith('Mawlamyine')
    expect(input).toHaveValue('Mawlamyine')

    await user.clear(input)
    await user.type(input, 'Yangon')
    expect(onValueChange).toHaveBeenLastCalledWith('Yangon')
    // No suggestion matches, so the list hides instead of showing "No results".
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})
