import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'bug', label: 'Bug' },
  { value: 'docs', label: 'Docs' },
  { value: 'perf', label: 'Performance' },
]

describe('MultiSelect', () => {
  it('picks several options from a list that stays open', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <MultiSelect aria-label="Labels" options={options} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole('combobox', { name: 'Labels' })
    await user.click(input)
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await user.click(screen.getByRole('option', { name: 'Bug' }))
    await user.click(screen.getByRole('option', { name: 'Docs' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['bug', 'docs'])
    expect(screen.getByRole('option', { name: 'Bug' })).toHaveAttribute('aria-selected', 'true')
    // Picking again unpicks.
    await user.click(screen.getByRole('option', { name: 'Bug' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['docs'])
  })

  it('removes chips with their buttons and with Backspace', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <MultiSelect
        aria-label="Labels"
        options={options}
        defaultValue={['bug', 'docs', 'perf']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Docs' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['bug', 'perf'])
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(['bug'])
  })
})
