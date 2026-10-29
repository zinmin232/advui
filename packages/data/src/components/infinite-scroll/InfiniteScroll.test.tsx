import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Text, VStack } from '@advui/core'
import { useState } from 'react'
import { act, renderWithProvider, screen } from '../../../test/utils'
import { InfiniteScroll, type InfiniteScrollProps } from './InfiniteScroll'

// happy-dom never intersects: tests say when the end is in view. A new
// observer's first report is the one a browser sends right after `observe`.
class FakeObserver {
  static all: FakeObserver[] = []
  disconnected = false
  constructor(public callback: (entries: { isIntersecting: boolean }[]) => void) {
    FakeObserver.all.push(this)
  }
  observe() {}
  unobserve() {}
  takeRecords() {
    return []
  }
  disconnect() {
    this.disconnected = true
  }
}

const endInView = (isIntersecting = true) =>
  act(() => {
    for (const observer of FakeObserver.all.filter((o) => !o.disconnected)) {
      observer.callback([{ isIntersecting }])
    }
  })

beforeEach(() => {
  FakeObserver.all = []
  vi.stubGlobal('IntersectionObserver', FakeObserver)
})
afterEach(() => vi.unstubAllGlobals())

const page = (from: number) => Array.from({ length: 10 }, (_, i) => `Order ${from + i + 1}`)

/** A feed whose pages arrive when the test calls `resolve`. */
function Feed({
  pages = 3,
  onLoadMore,
  ...props
}: Partial<InfiniteScrollProps> & { pages?: number }) {
  const [items, setItems] = useState(() => page(0))
  const [loading, setLoading] = useState(false)
  resolve = (empty = false) =>
    act(() => {
      if (!empty) setItems((current) => [...current, ...page(current.length)])
      setLoading(false)
    })
  return (
    <InfiniteScroll
      aria-label="Orders"
      hasMore={items.length < pages * 10}
      loading={loading}
      onLoadMore={() => {
        onLoadMore?.()
        setLoading(true)
      }}
      {...props}
    >
      {items.map((item) => (
        <Text key={item}>{item}</Text>
      ))}
    </InfiniteScroll>
  )
}
let resolve: (empty?: boolean) => void = () => {}

describe('InfiniteScroll', () => {
  it('loads the next page when the end comes into view, and shows it is loading', () => {
    const onLoadMore = vi.fn()
    renderWithProvider(<Feed onLoadMore={onLoadMore} endMessage="All orders loaded" />)
    const region = screen.getByRole('region', { name: 'Orders' })
    expect(screen.getByText('Order 10')).toBeInTheDocument()
    endInView(false)
    expect(onLoadMore).not.toHaveBeenCalled()
    endInView()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Loading more…')).toBeInTheDocument()
    // No second request while one is loading.
    endInView()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    resolve()
    expect(region).not.toHaveAttribute('aria-busy')
    expect(screen.getByText('Order 20')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('10 more loaded')
  })

  it('keeps loading while the end stays in view, but not after an empty page', () => {
    const onLoadMore = vi.fn()
    renderWithProvider(<Feed onLoadMore={onLoadMore} pages={10} />)
    endInView()
    resolve()
    // The new observer's first report: the end is still in view.
    endInView()
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    resolve(true)
    endInView()
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    // A later report comes from scrolling, and loads again.
    endInView(false)
    endInView()
    expect(onLoadMore).toHaveBeenCalledTimes(3)
  })

  it('shows the end message once nothing remains', () => {
    renderWithProvider(<Feed pages={2} endMessage="All orders loaded" />)
    expect(screen.queryByText('All orders loaded')).toBeNull()
    endInView()
    resolve()
    expect(screen.getByText('All orders loaded')).toBeInTheDocument()
    expect(FakeObserver.all.every((observer) => observer.disconnected)).toBe(true)
  })

  it('pauses on an error and tries again from its button', async () => {
    const onLoadMore = vi.fn()
    const { user } = renderWithProvider(
      <InfiniteScroll
        aria-label="Orders"
        hasMore
        onLoadMore={onLoadMore}
        error="Couldn’t load more orders."
      >
        <Text>Order 1</Text>
      </InfiniteScroll>,
    )
    // Shown under the items, and announced.
    expect(screen.getAllByText('Couldn’t load more orders.')).toHaveLength(2)
    expect(screen.getByRole('status')).toHaveTextContent('Couldn’t load more orders.')
    endInView()
    expect(onLoadMore).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('in button mode loads only from Load more, which keeps focus while it loads', async () => {
    const onLoadMore = vi.fn()
    const { user } = renderWithProvider(<Feed mode="button" onLoadMore={onLoadMore} />)
    endInView()
    expect(onLoadMore).not.toHaveBeenCalled()
    const button = screen.getByRole('button', { name: 'Load more' })
    await user.click(button)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    const busy = screen.getByRole('button', { name: 'Load more' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    // Not disabled: browsers move focus off a disabled button (happy-dom does not).
    expect(busy).toHaveAttribute('aria-disabled', 'true')
    expect(busy).toBeEnabled()
    expect(busy).toHaveFocus()
    await user.click(busy)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    resolve()
    expect(screen.getByText('Order 20')).toBeInTheDocument()
  })

  it('counts items from itemCount when they are inside one element', () => {
    function Wrapped() {
      const [count, setCount] = useState(10)
      const [loading, setLoading] = useState(false)
      resolve = () =>
        act(() => {
          setCount(20)
          setLoading(false)
        })
      return (
        <InfiniteScroll
          aria-label="Orders"
          hasMore
          loading={loading}
          itemCount={count}
          onLoadMore={() => setLoading(true)}
        >
          <VStack gap="2">
            {page(0)
              .concat(count > 10 ? page(10) : [])
              .map((item) => (
                <Text key={item}>{item}</Text>
              ))}
          </VStack>
        </InfiniteScroll>
      )
    }
    renderWithProvider(<Wrapped />)
    endInView()
    resolve()
    expect(screen.getByText('Order 20')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('10 more loaded')
  })
})
