import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Link } from '../link/Link'
import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  it('is a span in a 1px box on one line, not hidden from screen readers', () => {
    renderWithProvider(<VisuallyHidden>3 unread messages</VisuallyHidden>)
    const text = screen.getByText('3 unread messages')
    expect(text.tagName).toBe('SPAN')
    expect(text).not.toHaveAttribute('aria-hidden')
    const style = getComputedStyle(text)
    expect(style.position).toBe('absolute')
    expect(style.width).toBe('1px')
    expect(style.height).toBe('1px')
    expect(style.overflow).toBe('hidden')
    expect(style.whiteSpace).toBe('nowrap')
    // `display: none` and `visibility: hidden` would hide it from screen readers too.
    expect(style.display).not.toBe('none')
    expect(style.visibility).not.toBe('hidden')
    expect(Number(style.opacity)).toBeGreaterThan(0)
  })

  it('adds its words to the name of the link around it', () => {
    renderWithProvider(
      <Link href="/pricing">
        Read more<VisuallyHidden> about pricing</VisuallyHidden>
      </Link>,
    )
    const link = screen.getByRole('link', { name: /^Read more\s*about pricing$/ })
    expect(link).toHaveAttribute('href', '/pricing')
    // happy-dom trims the span's leading space from the name; browsers keep it
    // (the e2e test checks the name in Chromium).
    expect(link).toHaveTextContent('Read more about pricing')
  })

  it('takes a role and ARIA props, e.g. a status that announces a change', () => {
    renderWithProvider(
      <VisuallyHidden role="status" aria-live="polite">
        Saved
      </VisuallyHidden>,
    )
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Saved')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })
})
