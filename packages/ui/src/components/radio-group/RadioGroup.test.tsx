import { View } from 'tamagui'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Label } from '../label/Label'
import { RadioGroup } from './RadioGroup'

function Plans(props: { onValueChange?: (v: string) => void }) {
  return (
    <RadioGroup aria-label="Plan" defaultValue="free" {...props}>
      {['free', 'pro', 'team'].map((plan) => (
        <div key={plan}>
          <RadioGroup.Item value={plan} id={`plan-${plan}`} />
          <Label htmlFor={`plan-${plan}`}>{plan}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('renders a labelled radiogroup with one checked item', () => {
    renderWithProvider(<Plans />)
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'free' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'pro' })).toHaveAttribute('aria-checked', 'false')
  })

  it('selects by click and reports the value', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Plans onValueChange={onValueChange} />)
    await user.click(screen.getByRole('radio', { name: 'team' }))
    expect(onValueChange).toHaveBeenCalledWith('team')
    expect(screen.getByRole('radio', { name: 'team' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'free' })).toHaveAttribute('aria-checked', 'false')
  })

  it('names items by their label and links their description', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <RadioGroup aria-label="Plan" defaultValue="free" onValueChange={onValueChange}>
        <RadioGroup.Item value="free" label="Free" description="Up to 3 projects." />
        <RadioGroup.Item value="pro" label="Pro" description="Unlimited projects." />
        <RadioGroup.Item value="team" label="Team" disabled />
      </RadioGroup>,
    )
    const pro = screen.getByRole('radio', { name: 'Pro' })
    expect(pro).toHaveAccessibleDescription('Unlimited projects.')
    await user.click(screen.getByText('Pro'))
    expect(onValueChange).toHaveBeenCalledWith('pro')
    expect(pro).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Team' })).toBeDisabled()
  })

  it('spaces its items', () => {
    renderWithProvider(
      <>
        <RadioGroup aria-label="Plan">
          <RadioGroup.Item value="free" label="Free" />
        </RadioGroup>
        <View gap="3" testID="reference" />
      </>,
    )
    const gap = getComputedStyle(screen.getByRole('radiogroup')).gap
    expect(gap).not.toBe('')
    expect(gap).toBe(getComputedStyle(screen.getByTestId('reference')).gap)
  })

  it('moves selection with arrow keys', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Plans onValueChange={onValueChange} />)
    screen.getByRole('radio', { name: 'free' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'pro' })).toHaveFocus()
  })
})
