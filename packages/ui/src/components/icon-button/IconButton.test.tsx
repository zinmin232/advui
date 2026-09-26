import { SearchIcon } from '@adv-ui/icons'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('uses aria-label as its accessible name', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <IconButton aria-label="Search" icon={<SearchIcon />} onPress={onPress} />,
    )
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onPress).toHaveBeenCalledOnce()
  })

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    renderWithProvider(<IconButton aria-label="Add" icon={<SearchIcon />} size={size} circular />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })
})
