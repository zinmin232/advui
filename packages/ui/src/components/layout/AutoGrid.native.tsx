import { Children, forwardRef, isValidElement, useState } from 'react'
import { type TamaguiElement, View } from 'tamagui'
import type { AutoGridProps } from './AutoGrid'
import { autoGridColumns, spaceValue } from './autoGridColumns'

/**
 * Native: React Native has no CSS grid, so the grid measures its width and
 * lays cells out like Grid does, a wrapping row of equal widths. Until the
 * first layout it renders one full-width column, so cells never flash at zero width.
 */
export const AutoGrid = forwardRef<TamaguiElement, AutoGridProps>(function AutoGrid(
  { children, minChildWidth = 240, gap = '$4', maxColumns, onLayout, ...props },
  ref,
) {
  const [width, setWidth] = useState(0)
  const space = spaceValue(gap)
  const columns = width ? autoGridColumns(width, minChildWidth, space, maxColumns) : 1
  // Whole pixels: Yoga rounds each cell, and widths that add up to a hair over
  // the row would push the last cell onto the next line.
  const cell = width ? Math.floor((width - (columns - 1) * space) / columns) : '100%'

  return (
    <View
      ref={ref}
      flexDirection="row"
      flexWrap="wrap"
      gap={gap}
      width="100%"
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width)
        onLayout?.(event)
      }}
      {...props}
    >
      {Children.toArray(children).map((child, index) => (
        <View key={isValidElement(child) && child.key != null ? child.key : index} width={cell}>
          {child}
        </View>
      ))}
    </View>
  )
})

export type { AutoGridProps } from './AutoGrid'
