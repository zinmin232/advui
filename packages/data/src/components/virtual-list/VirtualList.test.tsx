import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Text } from '@advui/core'
import { act, fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { VirtualList } from './VirtualList'

const rows = Array.from({ length: 1000 }, (_, i) => ({ id: `r${i}`, name: `Row ${i + 1}` }))

// happy-dom has no layout: give every element a 200px tall viewport and
// content as tall as the test says.
let contentHeight = 0
function fakeLayout() {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 200,
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => contentHeight,
  })
}

function scrollTo(node: HTMLElement, top: number) {
  Object.defineProperty(node, 'scrollTop', { configurable: true, value: top })
  fireEvent.scroll(node)
}

const names = () => screen.queryAllByRole('listitem').map((row) => row.textContent)

describe('VirtualList', () => {
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight')
  })

  it('draws the first rows until it is measured, with their place in the whole list', () => {
    renderWithProvider(
      <VirtualList
        aria-label="Invoices"
        height={200}
        data={rows}
        itemHeight={40}
        getItemKey={(row) => row.id}
        renderItem={(row) => <Text>{row.name}</Text>}
      />,
    )
    expect(screen.getByRole('region', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(10)
    expect(items[2]).toHaveAttribute('aria-posinset', '3')
    expect(items[2]).toHaveAttribute('aria-setsize', '1000')
  })

  describe('measured', () => {
    beforeEach(() => {
      contentHeight = 40_000
      fakeLayout()
    })

    it('draws the rows in view and a few around them as it scrolls', () => {
      renderWithProvider(
        <VirtualList
          aria-label="Invoices"
          height={200}
          data={rows}
          itemHeight={40}
          overscan={2}
          renderItem={(row) => <Text>{row.name}</Text>}
        />,
      )
      // Five rows fit; two more below.
      expect(names()).toEqual([
        'Row 1',
        'Row 2',
        'Row 3',
        'Row 4',
        'Row 5',
        'Row 6',
        'Row 7',
        'Row 8',
      ])
      scrollTo(screen.getByRole('region'), 4000)
      expect(names()[0]).toBe('Row 99')
      expect(names()).toContain('Row 101')
      expect(names()).toContain('Row 107')
      expect(names()).not.toContain('Row 1')
      const first = screen.getAllByRole('listitem')[0]!
      expect(first).toHaveAttribute('aria-posinset', '99')
    })

    it('places rows of different heights', () => {
      renderWithProvider(
        <VirtualList
          aria-label="Messages"
          height={200}
          data={rows}
          // Every tenth row is a day heading, half as tall.
          itemHeight={(index) => (index % 10 === 0 ? 20 : 40)}
          overscan={0}
          renderItem={(row) => <Text>{row.name}</Text>}
        />,
      )
      scrollTo(screen.getByRole('region'), 380)
      // 20 + 9 × 40 = 380: row 11 starts there.
      expect(names()[0]).toBe('Row 11')
    })

    it('measures rows that size themselves, and keeps the view in place as rows above it grow', () => {
      // A ResizeObserver the test reports sizes to; happy-dom measures nothing.
      const observers: { callback: ResizeObserverCallback; observed: Set<Element> }[] = []
      const original = globalThis.ResizeObserver
      globalThis.ResizeObserver = class {
        observed = new Set<Element>()
        constructor(public callback: ResizeObserverCallback) {
          observers.push(this)
        }
        observe(target: Element) {
          this.observed.add(target)
        }
        unobserve(target: Element) {
          this.observed.delete(target)
        }
        disconnect() {
          this.observed.clear()
        }
      } as unknown as typeof ResizeObserver
      const resize = (height: (position: number) => number) =>
        act(() => {
          for (const observer of observers) {
            const entries = [...observer.observed].map((target) => ({
              target,
              contentRect: { height: height(Number(target.getAttribute('aria-posinset'))) },
            }))
            observer.callback(entries as never, observer as never)
          }
        })
      try {
        renderWithProvider(
          <VirtualList
            aria-label="Messages"
            height={200}
            data={rows}
            estimatedItemHeight={40}
            overscan={0}
            getItemKey={(row) => row.id}
            renderItem={(row) => <Text>{row.name}</Text>}
          />,
        )
        const region = screen.getByRole('region')
        const style = (name: string) =>
          getComputedStyle(screen.getByText(name).closest('[role="listitem"]')!)
        // Not measured yet: placed by the estimate, and sized by their content.
        expect(style('Row 3').top).toBe('80px')
        expect(style('Row 3').height).not.toBe('40px')
        resize(() => 50)
        expect(style('Row 3').top).toBe('100px')

        // Scrolled down to estimated rows: those that grow above the view
        // move it down by as much, so what is in view stays where it was.
        let scrollTop = 0
        Object.defineProperty(region, 'scrollTop', {
          configurable: true,
          get: () => scrollTop,
          set: (value: number) => {
            scrollTop = value
          },
        })
        // The six rows drawn first are 50 (300), the rest 40: Row 21 starts
        // at 300 + 14 × 40 = 860.
        scrollTop = 860
        fireEvent.scroll(region)
        expect(names()[0]).toBe('Row 21')
        resize((position) => (position === 21 ? 40 : 60))
        // Rows in view or below it grew: nothing above moved.
        expect(scrollTop).toBe(860)
        // Row 20 starts at 820, above the view, and grows by 20.
        scrollTop = 830
        fireEvent.scroll(region)
        expect(names()[0]).toBe('Row 20')
        resize((position) => (position === 21 ? 40 : 60))
        expect(scrollTop).toBe(850)
      } finally {
        globalThis.ResizeObserver = original
      }
    })

    it('keeps the focused row drawn when it scrolls out of view', () => {
      renderWithProvider(
        <VirtualList
          aria-label="People"
          height={200}
          data={rows}
          itemHeight={40}
          overscan={0}
          renderItem={(row) => <button type="button">{row.name}</button>}
        />,
      )
      const button = screen.getByRole('button', { name: 'Row 2' })
      button.focus()
      scrollTo(screen.getByRole('region'), 8000)
      expect(button).toBeInTheDocument()
      expect(button).toHaveFocus()
      expect(names()).toContain('Row 201')
    })

    it('asks for more once per length when the end comes near', () => {
      const onEndReached = vi.fn()
      const short = rows.slice(0, 50)
      contentHeight = 2000
      renderWithProvider(
        <VirtualList
          aria-label="Feed"
          height={200}
          data={short}
          itemHeight={40}
          onEndReached={onEndReached}
          renderItem={(row) => <Text>{row.name}</Text>}
        />,
      )
      const region = screen.getByRole('region')
      scrollTo(region, 1000)
      expect(onEndReached).not.toHaveBeenCalled()
      // 2000 tall: 1700 + 200 leaves 100, within half a view.
      scrollTo(region, 1700)
      scrollTo(region, 1750)
      expect(onEndReached).toHaveBeenCalledTimes(1)
    })
  })

  it('shows `empty` when there are no rows, and a footer after them', () => {
    renderWithProvider(
      <>
        <VirtualList
          aria-label="Empty"
          data={[]}
          itemHeight={40}
          empty={<Text>No invoices yet</Text>}
          renderItem={() => null}
        />
        <VirtualList
          aria-label="Loaded"
          data={rows.slice(0, 2)}
          itemHeight={40}
          footer={<Text>End of list</Text>}
          renderItem={(row) => <Text>{row.name}</Text>}
        />
      </>,
    )
    expect(screen.getByText('No invoices yet')).toBeInTheDocument()
    expect(screen.getAllByRole('list')).toHaveLength(1)
    expect(screen.getByText('End of list')).toBeInTheDocument()
  })
})
