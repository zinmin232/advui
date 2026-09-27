import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Collapsible } from './Collapsible'

function Example({ disabled = false }: { disabled?: boolean }) {
  return (
    <Collapsible disabled={disabled}>
      <Collapsible.Trigger>
        <Button>Advanced options</Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <input aria-label="Slug" />
      </Collapsible.Content>
    </Collapsible>
  )
}

describe('Collapsible', () => {
  it('links the trigger to the content and toggles it', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const contentId = trigger.getAttribute('aria-controls')
    expect(contentId).toBeTruthy()
    // Closed content stays in the page for aria-controls, hidden from everyone.
    expect(document.getElementById(contentId as string)).not.toBeNull()
    expect(screen.queryByRole('textbox', { name: 'Slug' })).toBeNull()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('textbox', { name: 'Slug' })).toBeVisible()

    await user.keyboard('{Enter}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps what was typed after closing', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    await user.click(trigger)
    await user.type(screen.getByRole('textbox', { name: 'Slug' }), 'atlas')
    await user.click(trigger)
    await user.click(trigger)
    expect(screen.getByRole('textbox', { name: 'Slug' })).toHaveValue('atlas')
  })

  it('supports controlled use and runs the trigger’s own handler', async () => {
    const onPress = vi.fn()
    const onOpenChange = vi.fn()
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <Collapsible
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next)
            setOpen(next)
          }}
        >
          <Collapsible.Trigger>
            <Button onPress={onPress}>Details</Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <p>Shipping in 3 days</p>
          </Collapsible.Content>
        </Collapsible>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    expect(screen.getByText('Shipping in 3 days')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Details' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('does nothing when disabled', async () => {
    const { user } = renderWithProvider(<Example disabled />)
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
