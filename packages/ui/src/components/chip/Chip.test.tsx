import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Chip } from './Chip'

describe('Chip', () => {
  it('filter chip: a toggle button that reports its pressed state', async () => {
    const onSelectedChange = vi.fn()
    const { user } = renderWithProvider(
      <Chip defaultSelected={false} onSelectedChange={onSelectedChange}>
        Vegan
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Vegan' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await user.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
  })

  it('filter chip: can be controlled and toggled from the keyboard', async () => {
    function Controlled() {
      const [on, setOn] = useState(true)
      return (
        <Chip selected={on} onSelectedChange={setOn}>
          Halal
        </Chip>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    const chip = screen.getByRole('button', { name: 'Halal' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    chip.focus()
    await user.keyboard(' ')
    expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  it('input chip: text plus a named remove button', async () => {
    const onRemove = vi.fn()
    const { user } = renderWithProvider(<Chip onRemove={onRemove}>Ada Lovelace</Chip>)
    expect(screen.queryByRole('button', { name: 'Ada Lovelace' })).toBeNull()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Ada Lovelace' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('action chip: a button; a chip without actions is plain text', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <>
        <Chip onPress={onPress}>Schedule</Chip>
        <Chip>Draft</Chip>
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Schedule' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'Draft' })).toBeNull()
  })

  it('does nothing when disabled', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Chip onPress={onPress} disabled>
        Invite
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Invite' })
    expect(chip).toHaveAttribute('aria-disabled', 'true')
    await user.click(chip)
    expect(onPress).not.toHaveBeenCalled()
  })
})
