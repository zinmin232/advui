import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, testConfig, waitFor } from '../../../test/utils'
import { UniversalProvider } from '../../provider/UniversalProvider'
import { Sidebar } from '../sidebar/Sidebar'
import { Text } from '../typography/Text'
import { AppShell, type AppShellProps, useAppShell } from './AppShell'

function Shell({ onPage, ...props }: Partial<AppShellProps> & { onPage?: (page: string) => void }) {
  return (
    <AppShell {...props}>
      <AppShell.Header>
        <AppShell.SidebarTrigger />
        <Text>Adv Data</Text>
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Main">
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group label="Workspace">
              <Sidebar.Item onPress={() => onPage?.('reports')}>Reports</Sidebar.Item>
              <Sidebar.Toggle />
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Text>Overview</Text>
      </AppShell.Main>
      <AppShell.Footer>
        <Text>Synced</Text>
      </AppShell.Footer>
    </AppShell>
  )
}

describe('AppShell on web', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the four landmarks, with one navigation landmark around the Sidebar', () => {
    renderWithProvider(<Shell />)
    expect(screen.getByRole('banner', { hidden: true })).toHaveTextContent('Adv Data')
    expect(screen.getByRole('main', { hidden: true })).toHaveTextContent('Overview')
    expect(screen.getByRole('contentinfo', { hidden: true })).toHaveTextContent('Synced')
    // The area is the landmark; the Sidebar inside it drops its own.
    expect(screen.getAllByRole('navigation', { hidden: true })).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: 'Main', hidden: true })).toHaveTextContent(
      'Reports',
    )
  })

  it('server-renders the same layout at every width, with the drawer closed', () => {
    const html = renderToString(
      <UniversalProvider config={testConfig}>
        <Shell />
      </UniversalProvider>,
    )
    expect(html).toMatch(/<header[^>]*>/)
    expect(html).toMatch(/<nav[^>]*aria-label="Main"/)
    expect(html).toMatch(/<main[^>]*>/)
    expect(html).toMatch(/<footer[^>]*>/)
    expect(html).toContain('_height-100dvh')
    expect(html).not.toContain('role="dialog"')
  })

  // The test window is 1024px wide: below xl, above md.
  it('opens the drawer from the trigger below the breakpoint, and an item closes it', async () => {
    const onPage = vi.fn()
    const onSidebarOpenChange = vi.fn()
    const { user } = renderWithProvider(
      <Shell sidebarBreakpoint="xl" onPage={onPage} onSidebarOpenChange={onSidebarOpenChange} />,
    )
    const trigger = screen.getByRole('button', { name: 'Open navigation', hidden: true })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    const drawer = await screen.findByRole('dialog', { name: 'Main' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveAttribute('aria-controls', drawer.id)
    // In the drawer the Sidebar never collapses, so it has no toggle.
    expect(drawer.querySelector('[aria-label="Collapse sidebar"]')).toBeNull()
    const item = [...drawer.querySelectorAll('a, button')].find((el) => el.textContent === 'Reports')
    await user.click(item as Element)
    expect(onPage).toHaveBeenCalledWith('reports')
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('closes a drawer left open once the window is past the breakpoint', async () => {
    const onSidebarOpenChange = vi.fn()
    renderWithProvider(
      <Shell sidebarBreakpoint="md" defaultSidebarOpen onSidebarOpenChange={onSidebarOpenChange} />,
    )
    await waitFor(() => expect(onSidebarOpenChange).toHaveBeenCalledWith(false))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('puts the header at the top of what scrolls when it is not sticky', () => {
    renderWithProvider(<Shell stickyHeader={false} />)
    const header = screen.getByRole('banner', { hidden: true })
    expect(header.parentElement).toBe(screen.getByRole('main', { hidden: true }).parentElement)
  })

  it('puts the sidebar before the header with layout="sidebar-full"', () => {
    renderWithProvider(<Shell layout="sidebar-full" />)
    const nav = screen.getByRole('navigation', { hidden: true })
    const header = screen.getByRole('banner', { hidden: true })
    expect(nav.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('hides the trigger without a sidebar and warns about other children', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithProvider(
      <AppShell>
        <AppShell.Header>
          <AppShell.SidebarTrigger />
        </AppShell.Header>
        <AppShell.Main>
          <Text>Body</Text>
        </AppShell.Main>
        <Text>Stray</Text>
      </AppShell>,
    )
    expect(screen.queryByRole('button', { name: 'Open navigation', hidden: true })).toBeNull()
    expect(screen.queryByText('Stray')).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('AppShell.Header'))
  })

  it('useAppShell is always closed outside a shell', () => {
    let state: ReturnType<typeof useAppShell> | undefined
    function Probe() {
      state = useAppShell()
      return null
    }
    renderWithProvider(<Probe />)
    expect(state?.sidebarOpen).toBe(false)
    expect(() => state?.setSidebarOpen(true)).not.toThrow()
  })
})
