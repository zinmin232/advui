import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Link } from './Link'

describe('Link', () => {
  it('renders an underlined <a> with its href', () => {
    renderWithProvider(<Link href="/docs">Read the docs</Link>)
    const link = screen.getByRole('link', { name: 'Read the docs' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).not.toHaveAttribute('target')
    expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  })

  it('opens external links in a new tab and says so in the name', () => {
    renderWithProvider(
      <>
        <Link href="https://example.com" external>
          Example
        </Link>
        <Link href="https://example.org" external labels={{ external: '(neuer Tab)' }}>
          Beispiel
        </Link>
      </>,
    )
    const link = screen.getByRole('link', { name: /^Example\s+\(opens in a new tab\)$/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: /^Beispiel\s+\(neuer Tab\)$/ })).toBeInTheDocument()
  })

  it('without an href, is a link button that calls onPress', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(<Link onPress={onPress}>Show details</Link>)
    const link = screen.getByRole('link', { name: 'Show details' })
    expect(link.tagName).toBe('BUTTON')
    expect(link).toHaveAttribute('type', 'button')
    await user.click(link)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders a router link passed as render', () => {
    renderWithProvider(
      <Link render={<a href="/settings" data-router="" />} tone="muted">
        Settings
      </Link>,
    )
    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).toHaveAttribute('href', '/settings')
    expect(link).toHaveAttribute('data-router')
  })

  it('takes the size of the surrounding text unless given one', () => {
    renderWithProvider(
      <>
        <Text size="xs" testID="sentence">
          Read the <Link href="/docs">docs</Link> first.
        </Text>
        <Text size="xs" testID="reference" />
        <Text size="lg" testID="large" />
        <Text size="xs">
          A{' '}
          <Link href="/big" size="lg">
            big
          </Link>{' '}
          link.
        </Text>
      </>,
    )
    const inline = screen.getByRole('link', { name: 'docs' })
    expect(inline.closest('[data-testid="sentence"]')).not.toBeNull()
    const sized = (id: string) => getComputedStyle(screen.getByTestId(id)).fontSize
    expect(sized('reference')).not.toBe(sized('large'))
    expect(getComputedStyle(inline).fontSize).toBe(sized('reference'))
    expect(getComputedStyle(screen.getByRole('link', { name: 'big' })).fontSize).toBe(
      sized('large'),
    )
  })

  it('as a button, takes the font and color of the text around it', () => {
    renderWithProvider(
      <Text size="xs" tone="success" testID="sentence">
        Agree to the{' '}
        <Link onPress={() => {}} tone="inherit">
          terms
        </Link>
      </Text>,
    )
    const link = screen.getByRole('link', { name: 'terms' })
    const sentence = getComputedStyle(screen.getByTestId('sentence'))
    expect(link.tagName).toBe('BUTTON')
    const style = getComputedStyle(link)
    expect(style.color).toBe(sentence.color)
    expect(style.fontSize).toBe(sentence.fontSize)
    expect(style.fontFamily).toBe(sentence.fontFamily)
  })

  it('underlines on hover only when asked', () => {
    renderWithProvider(
      <>
        <Link href="/a" underline="hover">
          Hover
        </Link>
        <Link href="/b" underline="none">
          None
        </Link>
      </>,
    )
    expect(getComputedStyle(screen.getByRole('link', { name: 'Hover' })).textDecorationLine).toBe(
      'none',
    )
    expect(getComputedStyle(screen.getByRole('link', { name: 'None' })).textDecorationLine).toBe(
      'none',
    )
  })
})
