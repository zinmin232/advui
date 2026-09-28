import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Sidebar } from './Sidebar'

function App(props: Partial<Parameters<typeof Sidebar>[0]> & { onPress?: () => void }) {
  const { onPress, ...rest } = props
  return (
    <Sidebar aria-label="App" {...rest}>
      <Sidebar.Header>
        <Sidebar.Toggle />
      </Sidebar.Header>
      <Sidebar.Content>
        <Sidebar.Group label="Workspace">
          <Sidebar.Item href="/" active icon={<svg data-testid="icon" />}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item badge="3" onPress={onPress}>
            Reports
          </Sidebar.Item>
          <Sidebar.Item disabled onPress={onPress}>
            Admin
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar.Content>
    </Sidebar>
  )
}

describe('Sidebar', () => {
  it('is a named navigation with a labelled list of links', () => {
    renderWithProvider(<App />)
    expect(screen.getByRole('navigation', { name: 'App' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Workspace' })).toBeInTheDocument()
    const dashboard = screen.getByRole('link', { name: 'Dashboard' })
    expect(dashboard).toHaveAttribute('href', '/')
    expect(dashboard).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Reports 3' })).not.toHaveAttribute('aria-current')
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('runs onPress, but not on a disabled item', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(<App onPress={onPress} />)
    await user.click(screen.getByRole('link', { name: 'Reports 3' }))
    expect(onPress).toHaveBeenCalledOnce()
    const admin = screen.getByRole('link', { name: 'Admin' })
    expect(admin).toHaveAttribute('aria-disabled', 'true')
    await user.click(admin)
    expect(onPress).toHaveBeenCalledOnce()
  })

  it('collapses to an icon rail that keeps the names', async () => {
    const onCollapsedChange = vi.fn()
    const { user } = renderWithProvider(<App onCollapsedChange={onCollapsedChange} />)
    const nav = screen.getByRole('navigation', { name: 'App' })
    const wide = getComputedStyle(nav).width
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(toggle).toHaveAttribute('aria-controls', nav.id)
    await user.click(toggle)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(getComputedStyle(nav).width).not.toBe(wide)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    // The labels are visually hidden, still in the accessible name.
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Workspace' })).toBeInTheDocument()
  })

  it('can be controlled', () => {
    renderWithProvider(<App collapsed />)
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument()
  })
})
