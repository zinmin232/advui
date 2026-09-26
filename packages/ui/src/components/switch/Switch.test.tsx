import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Label } from '../label/Label'
import { Switch } from './Switch'

describe('Switch', () => {
  it('exposes the switch role and toggles with click and keyboard', async () => {
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <Switch id="wifi" onCheckedChange={onCheckedChange} />
        <Label htmlFor="wifi">Wi-Fi</Label>
      </>,
    )
    const toggle = screen.getByRole('switch', { name: 'Wi-Fi' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')

    toggle.focus()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(onCheckedChange).toHaveBeenNthCalledWith(1, true)
    expect(onCheckedChange).toHaveBeenNthCalledWith(2, false)
  })

  it('respects controlled checked state', () => {
    renderWithProvider(<Switch aria-label="Dark mode" checked onCheckedChange={() => {}} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(
      <Switch aria-label="Sync" disabled onCheckedChange={onCheckedChange} />,
    )
    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
