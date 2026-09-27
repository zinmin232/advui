import { PlusIcon } from '@advui/icons'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Fab } from './Fab'

describe('Fab', () => {
  it('is a button named by its aria-label and runs its action', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Fab icon={<PlusIcon />} aria-label="New project" onPress={onPress} />,
    )
    const fab = screen.getByRole('button', { name: 'New project' })
    expect(fab.tagName).toBe('BUTTON')
    expect(fab).toHaveAttribute('type', 'button')
    await user.click(fab)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('shows the label of an extended FAB as its name', () => {
    renderWithProvider(<Fab icon={<PlusIcon />} label="Compose" />)
    expect(screen.getByRole('button', { name: 'Compose' })).toHaveTextContent('Compose')
  })

  it('does not run when disabled', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Fab icon={<PlusIcon />} aria-label="Add" disabled onPress={onPress} />,
    )
    const fab = screen.getByRole('button', { name: 'Add' })
    expect(fab).toHaveAttribute('aria-disabled', 'true')
    await user.click(fab)
    expect(onPress).not.toHaveBeenCalled()
  })
})
