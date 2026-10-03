import { Children, type ReactNode, createContext, isValidElement, useContext } from 'react'
import {
  type SpaceTokens,
  type Token,
  View,
  type ViewProps,
  getTokenValue,
  withStaticProperties,
} from 'tamagui'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
/** A value, or a mobile-first map such as `{ base: 12, md: 8 }`. */
export type ResponsiveGridValue<T> = T | ({ base?: T } & Partial<Record<Breakpoint, T>>)
export type ResponsiveColumns = ResponsiveGridValue<number>
/** Columns a cell covers: a count, every column (`'full'`) or its content's width (`'auto'`). */
export type GridSpan = number | 'full' | 'auto'
export type ResponsiveSpan = ResponsiveGridValue<GridSpan>
export type ResponsiveOffset = ResponsiveGridValue<number>

export interface GridProps extends Omit<ViewProps, 'children' | 'gap' | 'rowGap' | 'columnGap'> {
  children?: ReactNode
  /** Column count, or a mobile-first map such as `{ base: 1, md: 2, lg: 3 }`. */
  columns?: ResponsiveColumns
  /** Space between cells (token). */
  gap?: SpaceTokens
  /** Space between rows (token). Defaults to `gap`. */
  rowGap?: SpaceTokens
  /** Space between columns (token). Defaults to `gap`. */
  columnGap?: SpaceTokens
  /** Cross-axis alignment of the cells in a row. Cells stretch to the row's height by default. */
  alignItems?: ViewProps['alignItems']
}

export interface GridItemProps extends Omit<ViewProps, 'children'> {
  children?: ReactNode
  /** Columns to cover, optionally per breakpoint (mobile-first). */
  span?: ResponsiveSpan
  /** Empty columns before the cell, optionally per breakpoint (mobile-first). */
  offset?: ResponsiveOffset
}

type Percent = `${number}%`

export interface GridCellStyle {
  width?: Percent | 'auto'
  maxWidth?: Percent
  marginInlineStart?: Percent | 0
}

export type GridCellLayout = GridCellStyle & Partial<Record<`$${Breakpoint}`, GridCellStyle>>

const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

function pick<T>(value: ResponsiveGridValue<T>, key: 'base' | Breakpoint): T | undefined {
  if (typeof value === 'object' && value !== null) return (value as Record<string, T>)[key]
  return key === 'base' ? value : undefined
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const whole = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.round(value) : fallback
const percent = (part: number, count: number) => `${(100 * part) / count}%` as Percent

/**
 * Width and offset of one cell at each breakpoint. Missing breakpoints inherit
 * the nearest smaller one, and only the values that change are returned, as
 * media props (`$md`), so web output is plain CSS media queries.
 */
export function gridCellLayout(
  columns: ResponsiveColumns,
  span: ResponsiveSpan = 1,
  offset: ResponsiveOffset = 0,
): GridCellLayout {
  const layout: GridCellLayout = {}
  let count = 1
  let cover: GridSpan = 1
  let skip = 0
  let width: string | undefined
  let margin: Percent | 0 = 0
  let capped = false

  for (const key of ['base', ...breakpoints] as const) {
    count = pick(columns, key) ?? count
    cover = pick(span, key) ?? cover
    skip = pick(offset, key) ?? skip

    // Not rounded, so a fractional count keeps the 0.6 width, `100 / count`.
    const total = Number.isFinite(count) ? Math.max(1, count) : 1
    const size = cover === 'auto' ? 0 : cover === 'full' ? total : clamp(whole(cover, 1), 1, total)
    // The offset and the cell fit in one row; an `auto` cell keeps at least one column.
    const empty = clamp(whole(skip, 0), 0, cover === 'auto' ? Math.max(0, total - 1) : total - size)

    const style: GridCellStyle = {}
    const nextWidth = cover === 'auto' ? 'auto' : percent(size, total)
    if (nextWidth !== width) {
      style.width = nextWidth
      // `auto` sizes to the content; never wider than the row.
      if (nextWidth === 'auto' && !capped) {
        style.maxWidth = '100%'
        capped = true
      }
      width = nextWidth
    }
    const nextMargin = empty ? percent(empty, total) : 0
    if (nextMargin !== margin) {
      style.marginInlineStart = nextMargin
      margin = nextMargin
    }

    if (key === 'base') Object.assign(layout, style)
    else if (Object.keys(style).length) layout[`$${key}`] = style
  }
  return layout
}

/** Joins the cell's media props with the item's own, so `$md={{ … }}` keeps the width. */
function mergeCellProps(cell: GridCellLayout, props: Omit<GridItemProps, 'children'>) {
  const merged: Record<string, unknown> = { ...cell }
  for (const [key, value] of Object.entries(props)) {
    const own = merged[key]
    merged[key] =
      key.startsWith('$') && own && typeof own === 'object' && value && typeof value === 'object'
        ? { ...own, ...value }
        : value
  }
  return merged as ViewProps
}

interface GridContextValue {
  columns: ResponsiveColumns
  /** Half the column gap: every cell's side padding, and the grid's negative margin. */
  half: number
}

const GridContext = createContext<GridContextValue>({ columns: 1, half: 0 })

/**
 * One cell of a Grid. It is the cell itself (no extra wrapper), so its side
 * padding is the column gap: put backgrounds, borders and padding on a child.
 */
export function GridItem({ children, span = 1, offset = 0, ...props }: GridItemProps) {
  const { columns, half } = useContext(GridContext)
  return (
    <View
      paddingHorizontal={half}
      {...mergeCellProps(gridCellLayout(columns, span, offset), props)}
    >
      {children}
    </View>
  )
}

/**
 * Responsive grid built on flex-wrap and percentage widths so it behaves
 * identically on web, iOS and Android (CSS grid is web-only in Tamagui and
 * dropped on native). Breakpoints compile to CSS media queries on web, so SSR
 * output is stable. Spans line up with equal columns because the column gap is
 * padding inside each cell, offset by a negative margin on the grid.
 */
function GridRoot({
  children,
  columns = 1,
  gap = '$4',
  rowGap = gap,
  columnGap = gap,
  ...props
}: GridProps) {
  const half = ((getTokenValue(columnGap as Token, 'space') as number | undefined) ?? 0) / 2

  return (
    <GridContext.Provider value={{ columns, half }}>
      <View flexDirection="row" flexWrap="wrap" marginHorizontal={-half} rowGap={rowGap} {...props}>
        {Children.toArray(children).map((child, index) =>
          // Other children keep their one-column cell, so existing grids render the same.
          isValidElement(child) && child.type === GridItem ? (
            child
          ) : (
            <GridItem key={isValidElement(child) && child.key != null ? child.key : index}>
              {child}
            </GridItem>
          ),
        )}
      </View>
    </GridContext.Provider>
  )
}

export const Grid = withStaticProperties(GridRoot, { Item: GridItem })
