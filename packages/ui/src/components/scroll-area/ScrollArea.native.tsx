import { forwardRef } from 'react'
import { ScrollView, type TamaguiElement } from 'tamagui'
import type { ScrollAreaProps } from './ScrollArea'

/** Native: a React Native ScrollView with the platform's scroll indicators. */
export const ScrollArea = forwardRef<TamaguiElement, ScrollAreaProps>(function ScrollArea(
  { orientation = 'vertical', 'aria-label': label, children, ...props },
  ref,
) {
  const horizontal = orientation === 'horizontal'
  return (
    <ScrollView
      ref={ref as never}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={horizontal}
      showsVerticalScrollIndicator={!horizontal}
      aria-label={label}
      {...(props as object)}
    >
      {children}
    </ScrollView>
  )
})

export type { ScrollAreaOrientation, ScrollAreaProps } from './ScrollArea'
