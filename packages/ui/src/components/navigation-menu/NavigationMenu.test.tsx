import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { NavigationMenu } from './NavigationMenu'

function Menu(props: Partial<Parameters<typeof NavigationMenu>[0]>) {
  return (
    <>
      <NavigationMenu {...props}>
        <NavigationMenu.Link href="/" active>
          Home
        </NavigationMenu.Link>
        <NavigationMenu.Item label="Data">
          <NavigationMenu.Link href="/5w" description="Who does what, where">
            5W dashboard
          </NavigationMenu.Link>
          <NavigationMenu.Link href="/pcodes">Place codes</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item label="Resources">
          <NavigationMenu.Link href="/publications">Publications</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
      <button type="button">Outside</button>
    </>
  )
}

describe('NavigationMenu', () => {
  it('is a named navigation with links and the current page marked', () => {
    renderWithProvider(<Menu />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    const home = screen.getByRole('link', { name: 'Home' })
    expect(home).toHaveAttribute('href', '/')
    expect(home).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: /5W dashboard/ })).not.toBeInTheDocument()
  })

  it('opens a panel from its button, one at a time', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Menu onValueChange={onValueChange} />)
    const data = screen.getByRole('button', { name: 'Data' })
    expect(data).toHaveAttribute('aria-expanded', 'false')
    const panel = document.getElementById(data.getAttribute('aria-controls')!)
    expect(panel).not.toBeNull()
    await user.click(data)
    expect(data).toHaveAttribute('aria-expanded', 'true')
    expect(onValueChange).toHaveBeenLastCalledWith('Data')
    expect(screen.getByRole('link', { name: /5W dashboard/ })).toHaveAttribute('href', '/5w')
    await user.click(screen.getByRole('button', { name: 'Resources' }))
    expect(data).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('link', { name: 'Publications' })).toBeVisible()
    expect(screen.queryByRole('link', { name: /5W dashboard/ })).not.toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the button', async () => {
    const { user } = renderWithProvider(<Menu />)
    const data = screen.getByRole('button', { name: 'Data' })
    await user.click(data)
    await user.tab()
    expect(screen.getByRole('link', { name: /5W dashboard/ })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(data).toHaveAttribute('aria-expanded', 'false')
    expect(data).toHaveFocus()
  })

  it('closes when focus or a press moves outside', async () => {
    const { user } = renderWithProvider(<Menu />)
    const data = screen.getByRole('button', { name: 'Data' })
    await user.click(data)
    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(data).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes after following a link, and runs its onPress', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <NavigationMenu aria-label="Site">
        <NavigationMenu.Item label="More">
          <NavigationMenu.Link onPress={onPress}>Contact</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByRole('link', { name: 'Contact' }))
    expect(onPress).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false')
  })
})
