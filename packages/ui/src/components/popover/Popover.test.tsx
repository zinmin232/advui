import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { Popover } from './Popover'

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Popover onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <Button>Dimensions</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Layer size</Popover.Title>
        <Popover.Description>Width and height in pixels.</Popover.Description>
        <Popover.Close asChild>
          <Button variant="ghost">Done</Button>
        </Popover.Close>
      </Popover.Content>
    </Popover>
  )
}

describe('Popover', () => {
  it('announces a dialog popup on its trigger', () => {
    renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Dimensions' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens a dialog named by its title', async () => {
    const onOpenChange = vi.fn()
    const { user } = renderWithProvider(<Example onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Dimensions' }))
    const dialog = await screen.findByRole('dialog', { name: 'Layer size' })
    expect(dialog).toHaveTextContent('Width and height in pixels.')
    expect(screen.getByRole('button', { name: 'Dimensions' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(onOpenChange.mock.lastCall?.[0]).toBe(true)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user } = renderWithProvider(<Example />)
    const trigger = screen.getByRole('button', { name: 'Dimensions' })
    await user.click(trigger)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('closes from Popover.Close', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(screen.getByRole('button', { name: 'Dimensions' }))
    await user.click(await screen.findByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('can be controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button>Filters</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Filters</Popover.Title>
            <Button onPress={() => setOpen(false)}>Apply</Button>
          </Popover.Content>
        </Popover>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    expect(await screen.findByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})
