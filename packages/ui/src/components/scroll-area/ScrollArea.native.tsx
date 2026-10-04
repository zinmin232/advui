import { shorthands } from '@advui/theme'
import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react'
import { ScrollView, type TamaguiElement, validStyles } from 'tamagui'
import { Sticky, type StickyProps } from '../sticky/Sticky'
import type { ScrollAreaProps } from './ScrollArea'

type ContentElement = ReactElement<{ children?: ReactNode } & Record<string, unknown>> & {
  type: { staticConfig?: { defaultProps?: Record<string, unknown> } }
}

/** The style props of the content element (its own and its component's defaults), in longhand. */
function contentStyle(content: ContentElement) {
  const style: Record<string, unknown> = {}
  const props = { ...content.type.staticConfig?.defaultProps, ...content.props }
  for (const [key, value] of Object.entries(props)) {
    const longhand: string = shorthands[key as keyof typeof shorthands] ?? key
    if (longhand in validStyles) style[longhand] = value
  }
  return style
}

/** The children, with fragments opened, such as one fragment per list group. */
function flatChildren(nodes: ReactNode, prefix = ''): ReactNode[] {
  return Children.toArray(nodes).flatMap((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) return [child]
    if (child.type === Fragment) return flatChildren(child.props.children, `${prefix}${child.key}`)
    // Keys stay unique once several fragments' children share one list.
    return prefix ? [cloneElement(child, { key: `${prefix}${child.key}` })] : [child]
  })
}

/**
 * React Native pins only direct children of the scroll content
 * (`stickyHeaderIndices`), but a ScrollArea's content is one element, such as
 * a VStack. When that element's own children (fragments opened) include a top Sticky, they
 * become the ScrollView's children instead, and the element's style props
 * (padding, gap…) style the scroll content, so the Sticky can be pinned.
 */
function pinStickyChildren(children: ReactNode, horizontal: boolean) {
  const items = Children.toArray(children)
  const content = items[0]
  if (horizontal || items.length !== 1 || !isValidElement(content)) return null
  const element = content as ContentElement
  const inner = flatChildren(element.props.children)
  const indices = inner.flatMap((child, index) =>
    isValidElement<StickyProps>(child) && child.type === Sticky && child.props.edge !== 'bottom'
      ? [index]
      : [],
  )
  return indices.length ? { inner, indices, style: contentStyle(element) } : null
}

/** Native: a React Native ScrollView with the platform's scroll indicators. */
export const ScrollArea = forwardRef<TamaguiElement, ScrollAreaProps>(function ScrollArea(
  { orientation = 'vertical', 'aria-label': label, children, ...props },
  ref,
) {
  const horizontal = orientation === 'horizontal'
  const pinned = pinStickyChildren(children, horizontal)
  return (
    <ScrollView
      ref={ref as never}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal}
      showsVerticalScrollIndicator={!horizontal}
      // Android: without it, a ScrollArea inside a scrolling screen never
      // scrolls; the screen takes every vertical drag.
      nestedScrollEnabled
      aria-label={label}
      {...(pinned && {
        stickyHeaderIndices: pinned.indices,
        contentContainerStyle: pinned.style,
      })}
      {...(props as object)}
    >
      {pinned ? pinned.inner : children}
    </ScrollView>
  )
})

export type { ScrollAreaOrientation, ScrollAreaProps } from './ScrollArea'
