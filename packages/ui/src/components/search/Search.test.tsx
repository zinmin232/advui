import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Search } from './Search'

describe('Search', () => {
  it('is a named searchbox with a clear button once there is text', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Search onValueChange={onValueChange} />)
    const box = screen.getByRole('searchbox', { name: 'Search' })
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
    await user.type(box, 'hakha')
    expect(onValueChange).toHaveBeenLastCalledWith('hakha')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(box).toHaveValue('')
    expect(box).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('runs onSearch on Enter and clears on Escape', async () => {
    const onSearch = vi.fn()
    const { user } = renderWithProvider(<Search onSearch={onSearch} />)
    const box = screen.getByRole('searchbox')
    await user.type(box, 'sittwe{Enter}')
    expect(onSearch).toHaveBeenCalledWith('sittwe')
    await user.keyboard('{Escape}')
    expect(box).toHaveValue('')
  })

  it('follows a controlled value and shows loading', () => {
    renderWithProvider(<Search value="bago" loading aria-label="Find a place" />)
    const box = screen.getByRole('searchbox', { name: 'Find a place' })
    expect(box).toHaveValue('bago')
    expect(box).toHaveAttribute('aria-busy', 'true')
  })

  it('can be a search landmark', () => {
    renderWithProvider(<Search landmark />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })
})
