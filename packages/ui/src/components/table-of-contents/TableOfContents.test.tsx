import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderWithProvider, screen } from '../../../test/utils'
import { Heading } from '../typography/Heading'
import { TableOfContents } from './TableOfContents'

const items = [
  { id: 'toc-install', label: 'Install', level: 2 },
  { id: 'toc-setup', label: 'Set up the provider', level: 3 },
  { id: 'toc-usage', label: 'Usage', level: 2 },
]

// happy-dom does no layout: place each heading `top` pixels below the window's top.
function placeHeadings(tops: Record<string, number>) {
  for (const [id, top] of Object.entries(tops))
    vi.spyOn(document.getElementById(id)!, 'getBoundingClientRect').mockReturnValue({
      top,
    } as DOMRect)
}

async function scroll() {
  await act(async () => {
    window.dispatchEvent(new Event('scroll'))
    await new Promise((resolve) => requestAnimationFrame(resolve))
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TableOfContents', () => {
  it('is a named navigation list of links to the sections, deeper levels indented', () => {
    renderWithProvider(<TableOfContents items={items} title="On this page" />)
    const nav = screen.getByRole('navigation', { name: 'On this page' })
    expect(nav.tagName).toBe('NAV')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    const install = screen.getByRole('link', { name: 'Install' })
    expect(install).toHaveAttribute('href', '#toc-install')
    // The first section is current until the scroll says otherwise.
    expect(install).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Usage' })).not.toHaveAttribute('aria-current')
    const padding = (name: string) =>
      parseFloat(getComputedStyle(screen.getByRole('link', { name }).parentElement!).paddingLeft)
    expect(padding('Set up the provider')).toBeGreaterThan(padding('Install'))
    expect(padding('Usage')).toBe(padding('Install'))
  })

  it('follows the scroll to the last heading above the offset', async () => {
    const onActiveIdChange = vi.fn()
    renderWithProvider(
      <>
        <TableOfContents items={items} onActiveIdChange={onActiveIdChange} />
        {items.map((item) => (
          <Heading key={item.id} id={item.id}>
            {item.label}
          </Heading>
        ))}
      </>,
    )
    const current = () =>
      screen.getAllByRole('link').find((link) => link.getAttribute('aria-current'))?.textContent
    placeHeadings({ 'toc-install': -400, 'toc-setup': 60, 'toc-usage': 500 })
    await scroll()
    expect(current()).toBe('Set up the provider')
    expect(onActiveIdChange).toHaveBeenLastCalledWith('toc-setup')
    placeHeadings({ 'toc-install': -900, 'toc-setup': -500, 'toc-usage': 40 })
    await scroll()
    expect(current()).toBe('Usage')
  })

  it('marks a pressed item current and tells the app', async () => {
    const onItemPress = vi.fn()
    const { user } = renderWithProvider(
      <TableOfContents items={items} activeId="toc-install" onItemPress={onItemPress} />,
    )
    await user.click(screen.getByRole('link', { name: 'Usage' }))
    expect(onItemPress).toHaveBeenCalledWith(items[2])
    // Controlled: the app did not move activeId.
    expect(screen.getByRole('link', { name: 'Install' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })
})
