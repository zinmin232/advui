import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { ScrollArea } from '../scroll-area/ScrollArea'
import { Text } from '../typography/Text'
import { BackToTop, useBackToTop } from './BackToTop'

function scrollPage(y: number) {
  act(() => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(y)
    window.dispatchEvent(new Event('scroll'))
  })
}

function Feed() {
  const scroll = useBackToTop({ threshold: 100 })
  return (
    <>
      <ScrollArea aria-label="Feed" height={200} {...scroll.scrollProps}>
        <Text>Posts</Text>
      </ScrollArea>
      <BackToTop scroll={scroll} label="Back to the newest" />
    </>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BackToTop', () => {
  it('shows once the page is scrolled down, and takes it and focus back to the top', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const { user } = renderWithProvider(<BackToTop threshold={300} />)
    expect(screen.queryByRole('button')).toBeNull()
    scrollPage(200)
    expect(screen.queryByRole('button')).toBeNull()
    scrollPage(800)
    const button = screen.getByRole('button', { name: 'Back to top' })
    // It stays in the corner of the window.
    expect(button).toHaveStyle({ position: 'fixed' })
    await user.click(button)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    // The next Tab starts at the top of the page.
    expect(document.activeElement).toBe(document.body)
    expect(document.body).toHaveAttribute('tabindex', '-1')
    scrollPage(0)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('watches a ScrollArea through useBackToTop', async () => {
    const { user } = renderWithProvider(<Feed />)
    const area = screen.getByRole('region', { name: 'Feed' })
    const scrollTo = vi.fn()
    area.scrollTo = scrollTo
    // The page's own scroll is not watched.
    scrollPage(800)
    expect(screen.queryByRole('button')).toBeNull()

    area.scrollTop = 400
    fireEvent.scroll(area)
    const button = screen.getByRole('button', { name: 'Back to the newest' })
    expect(button).toHaveStyle({ position: 'absolute' })
    await user.click(button)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(area).toHaveFocus()
  })

  it('shows at once for a ScrollArea that is scrolled before it mounts', () => {
    // Scrolled before the page hydrated, or put back by the browser.
    vi.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockReturnValue(500)
    renderWithProvider(<Feed />)
    expect(screen.getByRole('button', { name: 'Back to the newest' })).toBeInTheDocument()
  })
})
