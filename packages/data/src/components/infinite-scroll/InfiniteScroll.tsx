import { Children, type ReactNode, forwardRef, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo } from 'react-native'
import { type TamaguiElement, View, isWeb } from 'tamagui/unstyled'
import {
  Button,
  HStack,
  ScrollArea,
  type ScrollAreaProps,
  Spinner,
  Text,
  VStack,
  VisuallyHidden,
  ariaState,
  isTextContent,
} from '@advui/core'
import { useNearEnd } from './useNearEnd'

export type InfiniteScrollMode = 'auto' | 'button'

export interface InfiniteScrollProps extends Omit<ScrollAreaProps, 'children' | 'orientation'> {
  /** The loaded items. Put them in directly, or give `itemCount`. */
  children: ReactNode
  /** More items remain to load. */
  hasMore: boolean
  /** A page is loading. The parent owns this state. */
  loading?: boolean
  /** Loads the next page: called near the end, or from the Load more button. */
  onLoadMore: () => void
  /** `auto` loads as the end comes near; `button` waits for Load more. Default `auto`. */
  mode?: InfiniteScrollMode
  /** How near the end loading starts, in visible heights. Default 0.5. */
  threshold?: number
  /** The number of loaded items. Default: the number of children. */
  itemCount?: number
  /** Why the last page failed. Shown with a Try again button; loading pauses until it clears. */
  error?: ReactNode
  /** Shown once nothing remains, such as "You're all caught up". */
  endMessage?: ReactNode
  loadingLabel?: string
  loadMoreLabel?: string
  retryLabel?: string
  /** Announced after a page loads, with the number of new items. */
  loadedLabel?: (count: number) => string
}

type Handler = (...args: never[]) => void

/** Our handlers first, then the caller's, such as `useBackToTop`'s onScroll. */
function mergeHandlers(own: Record<string, unknown>, extra: Record<string, unknown>) {
  const merged = { ...own }
  for (const [key, value] of Object.entries(extra)) {
    const theirs = own[key]
    merged[key] =
      typeof value === 'function' && typeof theirs === 'function'
        ? (...args: never[]) => {
            ;(value as Handler)(...args)
            ;(theirs as Handler)(...args)
          }
        : (theirs ?? value)
  }
  return merged
}

/**
 * Loads more items as the end of a list comes into view, with a loading
 * row, an error with Try again, and an end message. In a ScrollArea of its
 * own height, or on the page on web when it has none.
 */
export const InfiniteScroll = forwardRef<TamaguiElement, InfiniteScrollProps>(
  function InfiniteScroll(
    {
      children,
      hasMore,
      loading = false,
      onLoadMore,
      mode = 'auto',
      threshold = 0.5,
      itemCount,
      error,
      endMessage,
      loadingLabel = 'Loading more…',
      loadMoreLabel = 'Load more',
      retryLabel = 'Try again',
      loadedLabel = (count) => `${count} more loaded`,
      ...props
    },
    ref,
  ) {
    const count = itemCount ?? Children.count(children)
    const failed = error != null && error !== false
    const near = useNearEnd({
      enabled: mode === 'auto' && hasMore && !loading && !failed,
      threshold,
      count,
      onNearEnd: onLoadMore,
    })

    // After a page, say how many items came: on web through a live region,
    // on iOS and Android with announceForAccessibility.
    const [message, setMessage] = useState({ text: '', key: 0 })
    const announce = (text: string) => {
      if (isWeb) setMessage((current) => ({ text, key: current.key + 1 }))
      else AccessibilityInfo.announceForAccessibility(text)
    }
    const countBefore = useRef<number | null>(null)
    useEffect(() => {
      if (loading) {
        if (countBefore.current === null) countBefore.current = count
        return
      }
      if (countBefore.current === null) return
      const added = count - countBefore.current
      countBefore.current = null
      if (added > 0) announce(loadedLabel(added))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, count])
    useEffect(() => {
      if (typeof error === 'string' && error) announce(error)
    }, [error])

    let footer: ReactNode = null
    if (failed) {
      footer = (
        <VStack alignItems="center" gap="2" padding="3">
          {isTextContent(error) ? (
            <Text size="sm" tone="error" textAlign="center">
              {error}
            </Text>
          ) : (
            error
          )}
          <Button size="sm" variant="outline" onPress={onLoadMore}>
            {retryLabel}
          </Button>
        </VStack>
      )
    } else if (hasMore && mode === 'button') {
      footer = (
        <HStack justifyContent="center" padding="3">
          <Button
            size="sm"
            variant="outline"
            // Not `disabled` (nor LoadingButton, which sets it): a disabled
            // button drops keyboard focus, and this one is busy after each press.
            aria-disabled={ariaState(loading)}
            aria-busy={ariaState(loading)}
            icon={loading ? <Spinner size="sm" aria-hidden /> : undefined}
            onPress={() => {
              if (!loading) onLoadMore()
            }}
          >
            {loadMoreLabel}
          </Button>
        </HStack>
      )
    } else if (loading) {
      footer = (
        <HStack justifyContent="center" alignItems="center" gap="2" padding="3">
          {/* The text says what the spinner shows. */}
          <Spinner size="sm" aria-hidden />
          <Text size="sm" tone="muted">
            {loadingLabel}
          </Text>
        </HStack>
      )
    } else if (!hasMore && endMessage) {
      footer = (
        <HStack justifyContent="center" padding="3">
          {isTextContent(endMessage) ? (
            <Text size="sm" tone="muted" textAlign="center">
              {endMessage}
            </Text>
          ) : (
            endMessage
          )}
        </HStack>
      )
    }

    const setRefs = (node: TamaguiElement | null) => {
      near.frameRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    return (
      <ScrollArea
        ref={setRefs}
        {...(loading && { 'aria-busy': true })}
        {...(mergeHandlers(props as Record<string, unknown>, near.frameProps) as object)}
      >
        <View>
          <View position="relative">
            {children}
            {near.sentinel}
          </View>
          {footer}
          {isWeb ? (
            <VisuallyHidden role="status" aria-live="polite">
              {message.text ? <Text key={message.key}>{message.text}</Text> : null}
            </VisuallyHidden>
          ) : null}
        </View>
      </ScrollArea>
    )
  },
)
