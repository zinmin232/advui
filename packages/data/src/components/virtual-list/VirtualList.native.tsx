import { type Context, useMemo } from 'react'
import { FlatList, ScrollView } from 'react-native'
import { View } from 'tamagui/unstyled'
import { heightOf, itemOffsets } from './offsets'
import type { VirtualListProps } from './VirtualList'

// React Native warns about a list inside a scroll view that scrolls the same
// way, as such a list often has no height and draws every row. This one has
// its frame's height and keeps its window, so it hides the scroll view around.
const ParentScrollView = (ScrollView as unknown as { Context: Context<unknown> }).Context

/**
 * Native: React Native's FlatList, which keeps its own window of rows. The
 * frame takes the style props (height, border…) and the list fills it. Rows
 * that size themselves are measured by FlatList as it draws them.
 */
export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  estimatedItemHeight: _estimatedItemHeight,
  getItemKey,
  overscan: _overscan,
  initialCount = 10,
  onEndReached,
  onEndReachedThreshold = 0.5,
  footer,
  empty,
  ref,
  onScroll,
  'aria-label': label,
  ...props
}: VirtualListProps<T>) {
  const offsets = useMemo(
    () => (itemHeight === undefined ? null : itemOffsets(data.length, itemHeight)),
    [data.length, itemHeight],
  )
  return (
    <View ref={ref} {...props}>
      <ParentScrollView.Provider value={null}>
        <FlatList
          data={data}
          // `flex: 1` fills the frame, whatever height it is given.
          style={{ flex: 1 }}
          renderItem={({ item, index }) =>
            itemHeight === undefined ? (
              <View>{renderItem(item, index)}</View>
            ) : (
              <View height={heightOf(itemHeight, index)}>{renderItem(item, index)}</View>
            )
          }
          keyExtractor={(item, index) => String(getItemKey ? getItemKey(item, index) : index)}
          // Known heights: FlatList places rows without measuring them, and
          // scrolls straight to any of them. Otherwise it measures them.
          {...(itemHeight !== undefined &&
            offsets && {
              getItemLayout: (_: unknown, index: number) => ({
                length: heightOf(itemHeight, index),
                offset: offsets[index]!,
                index,
              }),
            })}
          initialNumToRender={initialCount}
          onEndReached={onEndReached ? () => onEndReached() : undefined}
          onEndReachedThreshold={onEndReachedThreshold}
          ListFooterComponent={footer ? <>{footer}</> : null}
          ListEmptyComponent={empty ? <>{empty}</> : null}
          onScroll={onScroll as never}
          scrollEventThrottle={16}
          // Android: without it, a list inside a scrolling screen never
          // scrolls; the screen takes every vertical drag.
          nestedScrollEnabled
          // React Native's ScrollView drops aria-label.
          accessibilityLabel={label}
        />
      </ParentScrollView.Provider>
    </View>
  )
}
