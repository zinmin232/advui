import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Label } from '../label/Label'
import { Select } from './Select'

function Fruits(props: { onValueChange?: (v: string) => void; defaultValue?: string }) {
  return (
    <>
      <Label htmlFor="fruit">Fruit</Label>
      <Select id="fruit" placeholder="Pick a fruit" {...props}>
        <Select.Item value="apple">Apple</Select.Item>
        <Select.Group label="Berries">
          <Select.Item value="blueberry">Blueberry</Select.Item>
          <Select.Item value="strawberry">Strawberry</Select.Item>
        </Select.Group>
      </Select>
    </>
  )
}

describe('Select', () => {
  it('renders a labelled combobox showing the placeholder', async () => {
    renderWithProvider(<Fruits />)
    const trigger = await screen.findByRole('combobox', { name: 'Fruit' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveTextContent('Pick a fruit')
  })

  it('shows the selected item label', async () => {
    renderWithProvider(<Fruits defaultValue="blueberry" />)
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Blueberry'))
  })

  it('opens a listbox and selects an option', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Fruits onValueChange={onValueChange} />)
    await user.click(await screen.findByRole('combobox', { name: 'Fruit' }))
    const option = await screen.findByRole('option', { name: 'Strawberry' })
    await user.click(option)
    expect(onValueChange).toHaveBeenCalledWith('strawberry')
  })
})
