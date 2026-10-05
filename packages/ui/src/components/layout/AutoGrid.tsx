import { type ReactNode, forwardRef } from 'react'
import { type SpaceTokens, type TamaguiElement, View, type ViewProps } from 'tamagui'
import { spaceValue } from './autoGridColumns'

export interface AutoGridProps extends Omit<ViewProps, 'children' | 'gap'> {
  children?: ReactNode
  /** Narrowest a cell gets, in px; the column count follows from it. Default `240`. */
  minChildWidth?: number
  /** Space between cells, across and down (token). Default `$4`. */
  gap?: SpaceTokens
  /** Most columns, however wide the grid gets. */
  maxColumns?: number
  onLayout?: (event: { nativeEvent: { layout: { width: number; height: number } } }) => void
}

/**
 * `grid-template-columns` for an AutoGrid. `auto-fill` keeps empty tracks, so
 * a lone card stays one column wide. `maxColumns` raises the narrowest cell to
 * a 1/n share of the row, so no more than n fit, and `min(…, 100%)` keeps one
 * column from overflowing a grid narrower than `minChildWidth`.
 */
export function autoGridTemplate(minChildWidth: number, gap: number, maxColumns?: number) {
  const min = `${Math.max(minChildWidth, 1)}px`
  const most = maxColumns !== undefined && maxColumns >= 1 ? Math.floor(maxColumns) : undefined
  const cell = most ? `max(${min}, calc((100% - ${(most - 1) * gap}px) / ${most}))` : min
  return `repeat(auto-fill, minmax(min(${cell}, 100%), 1fr))`
}

/**
 * Equal-width cells that fill the row: as many columns as fit at
 * `minChildWidth`, up to `maxColumns`. Web uses CSS grid, the one place Adv
 * UI does, because it is the only way to get the column count right on the
 * first paint (and in server-rendered HTML) without measuring.
 * AutoGrid.native.tsx measures instead.
 */
export const AutoGrid = forwardRef<TamaguiElement, AutoGridProps>(function AutoGrid(
  { minChildWidth = 240, gap = '$4', maxColumns, style, ...props },
  ref,
) {
  const template = autoGridTemplate(minChildWidth, spaceValue(gap), maxColumns)
  return (
    <View
      ref={ref}
      display={'grid' as ViewProps['display']}
      gap={gap}
      width="100%"
      {...props}
      style={{ gridTemplateColumns: template, ...(style as object | undefined) }}
    />
  )
})
