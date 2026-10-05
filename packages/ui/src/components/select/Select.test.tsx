import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, testConfig, waitFor } from '../../../test/utils'
import { UniversalProvider } from '../../provider/UniversalProvider'
import { Field } from '../field/Field'
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
  it('is named by its Field label before hydration', () => {
    const html = renderToString(
      <UniversalProvider config={testConfig}>
        <Field label="Plan">
          <Select defaultValue="team">
            <Select.Item value="free">Free</Select.Item>
            <Select.Item value="team">Team</Select.Item>
          </Select>
        </Field>
      </UniversalProvider>,
    )
    const page = new DOMParser().parseFromString(html, 'text/html')
    const trigger = page.querySelector('[role="combobox"]')
    const labelledBy = trigger?.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(page.getElementById(labelledBy ?? '')?.textContent).toContain('Plan')
  })

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

  it('keeps the native-only accessibilityHint off the DOM', async () => {
    const { container } = renderWithProvider(
      <Field label="Plan" description="Billed monthly.">
        <Select defaultValue="team" accessibilityHint="Billed monthly.">
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="team">Team</Select.Item>
        </Select>
      </Field>,
    )
    await screen.findByRole('combobox', { name: 'Plan' })
    expect(container.querySelector('[accessibilityhint]')).toBeNull()
  })
})
