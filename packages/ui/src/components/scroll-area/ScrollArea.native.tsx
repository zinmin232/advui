import { shorthands } from '@advui/theme'
import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
} from 'react'
import { ScrollView, type TamaguiElement, useComposedRefs, validStyles } from 'tamagui/unstyled'
import { KeyboardAvoidanceContext, useKeyboardAvoidance } from '../../hooks/useKeyboardAvoidance'
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
  { orientation = 'vertical', 'aria-label': label, avoidKeyboard = false, children, ...props },
  ref,
) {
  const horizontal = orientation === 'horizontal'
  const pinned = pinStickyChildren(children, horizontal)
  const scrollRef = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, scrollRef)
  const keyboard = useKeyboardAvoidance(scrollRef, avoidKeyboard)
  return (
    // Around the ScrollView, not its children, which sticky headers index.
    <KeyboardAvoidanceContext.Provider value={keyboard.context}>
      <ScrollView
        ref={composedRef as never}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={horizontal}
        showsVerticalScrollIndicator={!horizontal}
        // Android: without it, a ScrollArea inside a scrolling screen never
        // scrolls; the screen takes every vertical drag.
        nestedScrollEnabled
        // React Native maps aria-label on View only; its ScrollView drops it.
        accessibilityLabel={label}
        {...(pinned && {
          stickyHeaderIndices: pinned.indices,
          contentContainerStyle: pinned.style,
        })}
        {...(keyboard.avoid && {
          // iOS insets the content by the keyboard and scrolls the focused field into view.
          automaticallyAdjustKeyboardInsets: true,
          // A tap on a button while the keyboard is up presses it, not only closes the keyboard.
          keyboardShouldPersistTaps: 'handled' as const,
        })}
        {...(props as object)}
        // Android: ends where the keyboard starts (useKeyboardAvoidance).
        {...(keyboard.inset > 0 && { marginBottom: keyboard.inset })}
      >
        {pinned ? pinned.inner : children}
      </ScrollView>
    </KeyboardAvoidanceContext.Provider>
  )
})

export type { ScrollAreaOrientation, ScrollAreaProps } from './ScrollArea'
