import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { Spoiler } from './Spoiler'

// happy-dom does no layout: give every element a height.
function contentHeight(px: number) {
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(px)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Spoiler', () => {
  it('cuts long content off and shows it with a button', async () => {
    contentHeight(300)
    const onExpandedChange = vi.fn()
    const { user } = renderWithProvider(
      <Spoiler maxHeight={96} onExpandedChange={onExpandedChange}>
        A long release note.
      </Spoiler>,
    )
    const button = screen.getByRole('button', { name: 'Show more' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    const content = document.getElementById(button.getAttribute('aria-controls')!)!
    expect(content).toHaveTextContent('A long release note.')
    expect(content).toHaveStyle({ maxHeight: '96px', overflow: 'hidden' })

    await user.click(button)
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(content.style.maxHeight).toBe('')
  })

  it('has no button when the content fits', () => {
    contentHeight(40)
    renderWithProvider(<Spoiler maxHeight={96}>A short note.</Spoiler>)
    expect(screen.getByText('A short note.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('takes a size token and its own labels', () => {
    contentHeight(300)
    renderWithProvider(
      <Spoiler maxHeight="32" defaultExpanded showLabel="Read all" hideLabel="Read less">
        Notes
      </Spoiler>,
    )
    const button = screen.getByRole('button', { name: 'Read less' })
    const content = document.getElementById(button.getAttribute('aria-controls')!)!
    expect(content.style.maxHeight).toBe('')
    fireEvent.click(button)
    // The 32 size token is 128px.
    expect(content).toHaveStyle({ maxHeight: '128px' })
    expect(screen.getByRole('button', { name: 'Read all' })).toBeInTheDocument()
  })

  it('shows the rest when focus moves to something cut off', () => {
    contentHeight(300)
    renderWithProvider(
      <Spoiler maxHeight={96}>
        <Button>Above the cut</Button>
        <Button>Below the cut</Button>
      </Spoiler>,
    )
    const toggle = screen.getByRole('button', { name: 'Show more' })
    const content = document.getElementById(toggle.getAttribute('aria-controls')!)!
    const rect = (bottom: number) => ({ bottom }) as DOMRect
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(rect(96))
    const above = screen.getByRole('button', { name: 'Above the cut' })
    const below = screen.getByRole('button', { name: 'Below the cut' })
    vi.spyOn(above, 'getBoundingClientRect').mockReturnValue(rect(40))
    vi.spyOn(below, 'getBoundingClientRect').mockReturnValue(rect(140))

    fireEvent.focus(above)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    fireEvent.focus(below)
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
