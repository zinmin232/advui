import { type ReactNode, type Ref, useEffect, useMemo, useRef, useState } from 'react'
import { type TamaguiElement, View } from 'tamagui/unstyled'
import { ScrollArea, type ScrollAreaProps } from '@advui/core'
import { type ItemHeight, heightOf, indexAt, itemOffsets } from './offsets'

export interface VirtualListProps<T> extends Omit<ScrollAreaProps, 'children' | 'orientation'> {
  data: readonly T[]
  /** Draws one row. It gets the row's height, so keep its content to that height. */
  renderItem: (item: T, index: number) => ReactNode
  /** Row height in pixels: one number for every row, or a function of the index. */
  itemHeight: ItemHeight
  /** A stable key per row, such as its id. Default: the index. */
  getItemKey?: (item: T, index: number) => string | number
  /** Rows drawn above and below the visible ones, so fast scrolling shows no gap. Web only. */
  overscan?: number
  /** Rows drawn before the list is measured: on the server and in the first frame. */
  initialCount?: number
  /** Called once per length of `data` when the end comes near, to load more. */
  onEndReached?: () => void
  /** How near the end `onEndReached` fires, in visible heights. Default 0.5. */
  onEndReachedThreshold?: number
  /** Shown after the last row, such as a loading row. */
  footer?: ReactNode
  /** Shown instead of the list when `data` is empty. */
  empty?: ReactNode
  ref?: Ref<TamaguiElement>
}

type ScrollEvent = { currentTarget: HTMLElement }

/**
 * A long list that draws only the rows in view, so thousands of rows scroll
 * smoothly. Web windows the rows itself in a ScrollArea; iOS and Android use
 * React Native's FlatList.
 */
export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  getItemKey,
  overscan = 4,
  initialCount = 10,
  onEndReached,
  onEndReachedThreshold = 0.5,
  footer,
  empty,
  ref,
  onScroll,
  ...props
}: VirtualListProps<T>) {
  const count = data.length
  const offsets = useMemo(() => itemOffsets(count, itemHeight), [count, itemHeight])
  const scrollRef = useRef<HTMLElement | null>(null)
  const rowRefs = useRef(new Map<number, HTMLElement>())
  // Unknown until measured, after the first render (and on the server).
  const [view, setView] = useState<{ top: number; height: number } | null>(null)
  // A row that holds focus stays drawn when scrolled away, or focus would be lost.
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const endCalledFor = useRef(-1)
  const handlers = useRef({ onEndReached, onEndReachedThreshold })
  handlers.current = { onEndReached, onEndReachedThreshold }

  const check = (node: HTMLElement) => {
    const next = { top: node.scrollTop, height: node.clientHeight }
    setView((prev) => (prev?.top === next.top && prev.height === next.height ? prev : next))
    const { onEndReached: onEnd, onEndReachedThreshold: threshold } = handlers.current
    const distance = node.scrollHeight - next.top - next.height
    if (onEnd && next.height > 0 && distance <= threshold * next.height) {
      if (endCalledFor.current === count) return
      endCalledFor.current = count
      onEnd()
    }
  }

  // The area's height can change with the window; the rows it shows with it.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    check(node)
    const observer = new ResizeObserver(() => check(node))
    observer.observe(node)
    return () => observer.disconnect()
    // `count` too: new rows may still leave the end in view, so ask for more.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  let start = 0
  let end = Math.min(count, initialCount)
  if (view && view.height > 0) {
    start = Math.max(0, indexAt(offsets, view.top) - overscan)
    end = Math.min(count, indexAt(offsets, view.top + view.height) + 1 + overscan)
  }
  const indices = Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i)
  if (focusIndex !== null && focusIndex < count && (focusIndex < start || focusIndex >= end)) {
    indices.push(focusIndex)
  }

  const setRefs = (node: TamaguiElement | null) => {
    scrollRef.current = node as HTMLElement | null
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  return (
    <ScrollArea
      ref={setRefs}
      onScroll={(event: ScrollEvent) => {
        check(event.currentTarget)
        ;(onScroll as ((event: ScrollEvent) => void) | undefined)?.(event)
      }}
      {...props}
    >
      {count === 0 && empty ? (
        empty
      ) : (
        <View>
          <View
            role="list"
            position="relative"
            height={offsets[count]}
            onFocus={(event: { target: EventTarget }) => {
              for (const [index, node] of rowRefs.current) {
                if (node.contains(event.target as Node)) return setFocusIndex(index)
              }
            }}
            onBlur={(event: { currentTarget: HTMLElement; relatedTarget: EventTarget | null }) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setFocusIndex(null)
              }
            }}
          >
            {indices.map((index) => (
              <View
                key={getItemKey ? getItemKey(data[index]!, index) : index}
                ref={(node: TamaguiElement | null) => {
                  if (node) rowRefs.current.set(index, node as unknown as HTMLElement)
                  else rowRefs.current.delete(index)
                }}
                role="listitem"
                // The list holds only the drawn rows: these tell screen
                // readers where each one is in the whole list.
                aria-posinset={index + 1}
                aria-setsize={count}
                position="absolute"
                top={offsets[index]}
                left={0}
                right={0}
                height={heightOf(itemHeight, index)}
              >
                {renderItem(data[index]!, index)}
              </View>
            ))}
          </View>
          {footer}
        </View>
      )}
    </ScrollArea>
  )
}
