import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('is a button that reports its pressed state', async () => {
    const onPressedChange = vi.fn()
    const { user } = renderWithProvider(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange} />,
    )
    const toggle = screen.getByRole('button', { name: 'Bold' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(onPressedChange).toHaveBeenLastCalledWith(true)
  })

  it('toggles from the keyboard', async () => {
    const { user } = renderWithProvider(<Toggle defaultPressed>Mute</Toggle>)
    const toggle = screen.getByRole('button', { name: 'Mute' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    toggle.focus()
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('can be controlled', async () => {
    function Controlled() {
      const [pressed, setPressed] = useState(false)
      return (
        <>
          <Toggle pressed={pressed} onPressedChange={setPressed}>
            Save
          </Toggle>
          <span>{pressed ? 'saved' : 'not saved'}</span>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('saved')).toBeInTheDocument()
  })

  it('does not change when disabled', async () => {
    const onPressedChange = vi.fn()
    const { user } = renderWithProvider(
      <Toggle disabled onPressedChange={onPressedChange}>
        Favorite
      </Toggle>,
    )
    const toggle = screen.getByRole('button', { name: 'Favorite' })
    expect(toggle).toHaveAttribute('aria-disabled', 'true')
    await user.click(toggle)
    expect(onPressedChange).not.toHaveBeenCalled()
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })
})
