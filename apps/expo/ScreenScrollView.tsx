import { ScrollArea, type ScrollAreaProps } from '@advui/core'

// A ScrollView prop that ScrollArea passes on but does not type.
const iosInsets = { contentInsetAdjustmentBehavior: 'automatic' } as object

/**
 * A screen's scrolling content that keeps the focused field above the
 * keyboard: ScrollArea's `avoidKeyboard`. On iOS the content also clears the
 * home indicator (`contentInsetAdjustmentBehavior`).
 */
export function ScreenScrollView(props: Omit<ScrollAreaProps, 'avoidKeyboard'>) {
  return <ScrollArea avoidKeyboard {...iosInsets} {...props} />
}
