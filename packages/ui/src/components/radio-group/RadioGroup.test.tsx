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

  it('moves selection with arrow keys', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Plans onValueChange={onValueChange} />)
    screen.getByRole('radio', { name: 'free' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'pro' })).toHaveFocus()
  })
})
