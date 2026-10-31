import { BellIcon, HomeIcon, SearchIcon } from '@advui/icons'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { NavigationBar } from './NavigationBar'

function Example({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <NavigationBar defaultValue="home" onValueChange={onValueChange} aria-label="Main">
      <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
      <NavigationBar.Item value="search" icon={<SearchIcon />} label="Search" />
      <NavigationBar.Item value="inbox" icon={<BellIcon />} label="Inbox" badge={3} />
      <NavigationBar.Item value="later" icon={<BellIcon />} label="Later" disabled />
    </NavigationBar>
  )
}

describe('NavigationBar', () => {
  it('is a named nav landmark that marks the current destination', () => {
    renderWithProvider(<Example />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Search' })).not.toHaveAttribute('aria-current')
  })

  // The pill is absolute, and a positioned box paints over static ones whatever
  // their order: the icon sits in a positioned box after it to stay visible.
  it('draws the icon above the active pill', () => {
    renderWithProvider(<Example />)
    const icon = screen.getByRole('button', { name: 'Home' }).querySelector('svg')!
    const box = icon.parentElement!
    expect(getComputedStyle(box).position).toBe('relative')
    const pill = box.previousElementSibling
    expect(pill && getComputedStyle(pill).position).toBe('absolute')
  })

  it('includes badges in the name', () => {
    renderWithProvider(<Example />)
    expect(screen.getByRole('button', { name: 'Inbox, 3 new' })).toBeInTheDocument()
  })

  it('selects a destination on press', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onValueChange).toHaveBeenLastCalledWith('search')
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('ignores disabled destinations', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Example onValueChange={onValueChange} />)
    const later = screen.getByRole('button', { name: 'Later' })
    expect(later).toHaveAttribute('aria-disabled', 'true')
    await user.click(later)
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
