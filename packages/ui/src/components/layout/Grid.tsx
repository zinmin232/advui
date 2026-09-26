import { Children, type ReactNode, isValidElement } from 'react'
import { type SpaceTokens, type Token, View, type ViewProps, getTokenValue } from 'tamagui'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ResponsiveColumns = number | ({ base?: number } & Partial<Record<Breakpoint, number>>)

export interface GridProps extends Omit<ViewProps, 'children' | 'gap'> {
  children?: ReactNode
  /** Column count, or a mobile-first map such as `{ base: 1, md: 2, lg: 3 }`. */
  columns?: ResponsiveColumns
  /** Space between cells (token). */
  gap?: SpaceTokens
}

const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
const percent = (count: number) => `${100 / Math.max(1, count)}%` as const

/**
 * Equal-width responsive grid built on flex-wrap so it behaves identically on
 * web, iOS and Android (CSS grid is not available in React Native).
 * Breakpoints compile to CSS media queries on web, so SSR output is stable.
 */
export function Grid({ children, columns = 1, gap = '$4', ...props }: GridProps) {
  const half = (getTokenValue(gap as Token, 'space') as number) / 2
  const map = typeof columns === 'number' ? { base: columns } : columns
  const cellWidth: Record<string, unknown> = { width: percent(map.base ?? 1) }
  for (const bp of breakpoints) {
    const count = map[bp]
    if (count !== undefined) cellWidth[`$${bp}`] = { width: percent(count) }
  }

  return (
    <View flexDirection="row" flexWrap="wrap" marginHorizontal={-half} rowGap={gap} {...props}>
      {Children.toArray(children).map((child, index) => (
        <View
          key={isValidElement(child) && child.key != null ? child.key : index}
          paddingHorizontal={half}
          {...(cellWidth as ViewProps)}
        >
          {child}
        </View>
      ))}
    </View>
  )
}
