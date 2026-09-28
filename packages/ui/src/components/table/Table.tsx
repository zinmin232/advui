import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from '@advui/icons'
import {
  Children,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
} from 'react'
import {
  type GetProps,
  ScrollView,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

export type TableSize = 'sm' | 'md'
export type TableAlign = 'start' | 'center' | 'end'
export type TableSortDirection = 'ascending' | 'descending' | 'none'

const TableContext = createStyledContext<{ size: TableSize }>({ size: 'md' })

// Where a body row sits, for stripes and the last row's missing divider.
const RowPosition = createContext<{ index: number; last: boolean; striped: boolean } | null>(null)
const StripedContext = createContext(false)

const TableFrame = styled(View, {
  name: 'Table',
  context: TableContext,
  role: 'table',
  flexDirection: 'column',
  width: '100%',

  variants: {
    variant: {
      plain: {},
      outline: {
        borderWidth: 1,
        borderColor: '$border',
        borderRadius: '$lg',
        overflow: 'hidden',
        backgroundColor: '$card',
      },
    },
    size: {
      sm: {},
      md: {},
    },
  } as const,

  defaultVariants: { variant: 'plain', size: 'md' },
})

const TableHeader = styled(View, {
  name: 'TableHeader',
  role: 'rowgroup',
  borderBottomWidth: 1,
  borderColor: '$border',
})

const TableFooterFrame = styled(View, {
  name: 'TableFooter',
  role: 'rowgroup',
  borderTopWidth: 1,
  borderColor: '$border',
  backgroundColor: '$muted',
})

const TableRowFrame = styled(View, {
  name: 'TableRow',
  role: 'row',
  flexDirection: 'row',
  alignItems: 'stretch',

  variants: {
    divider: {
      true: { borderBottomWidth: 1, borderColor: '$border' },
    },
    striped: {
      true: { backgroundColor: '$muted' },
    },
    selected: {
      true: { backgroundColor: '$accent' },
    },
    interactive: {
      true: { hoverStyle: { backgroundColor: '$accent' } },
    },
  } as const,
})

const cellBase = {
  context: TableContext,
  flexBasis: 0,
  flexGrow: 1,
  minWidth: 0,
  justifyContent: 'center',

  variants: {
    size: {
      sm: { paddingHorizontal: '$2', paddingVertical: '$1.5', minHeight: '$9' },
      md: { paddingHorizontal: '$4', paddingVertical: '$3', minHeight: '$12' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
    },
  },
} as const

const TableCellFrame = styled(View, { name: 'TableCell', role: 'cell', ...cellBase })
const TableHeadFrame = styled(View, { name: 'TableHead', role: 'columnheader', ...cellBase })

const textAlign = { start: 'left', center: 'center', end: 'right' } as const

export interface TableProps extends Omit<GetProps<typeof TableFrame>, 'minWidth'> {
  /** Names the table. Shown under it and linked with `aria-labelledby`. */
  caption?: ReactNode
  /** Stripes every other body row. */
  striped?: boolean
  /**
   * Below this width the table scrolls sideways instead of squeezing its
   * columns, e.g. `640`.
   */
  minWidth?: number
}

const TableImpl = forwardRef<TamaguiElement, TableProps>(function Table(
  {
    caption,
    striped = false,
    minWidth,
    variant = 'plain',
    size = 'md',
    children,
    'aria-label': ariaLabel,
    ...props
  },
  ref,
) {
  const captionId = useId()
  const hasCaption = caption != null && !ariaLabel
  const table = (
    <StripedContext.Provider value={striped}>
      <TableFrame
        ref={ref}
        variant={variant}
        size={size}
        aria-label={ariaLabel}
        {...(hasCaption && { 'aria-labelledby': captionId })}
        {...(minWidth != null && { minWidth })}
        {...props}
      >
        {children}
      </TableFrame>
    </StripedContext.Provider>
  )
  return (
    <View gap="$2" width="100%">
      {minWidth != null ? (
        <ScrollView
          horizontal
          width="100%"
          contentContainerStyle={{ minWidth: '100%' }}
          // Keyboard users scroll it with the arrow keys once it has focus.
          {...(isWeb && { tabIndex: 0 })}
          focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
        >
          {table}
        </ScrollView>
      ) : (
        table
      )}
      {caption != null ? (
        <Text id={captionId} size="sm" tone="muted" textAlign="center">
          {caption}
        </Text>
      ) : null}
    </View>
  )
})

/** The body rows. Draws dividers between rows (and stripes, with `striped`). */
const TableBody = forwardRef<TamaguiElement, GetProps<typeof View>>(function TableBody(
  { children, ...props },
  ref,
) {
  const striped = useContext(StripedContext)
  const rows = Children.toArray(children)
  return (
    <View ref={ref} role="rowgroup" {...props}>
      {rows.map((row, index) => (
        <RowPosition.Provider
          key={isValidElement(row) && row.key != null ? row.key : index}
          value={{ index, last: index === rows.length - 1, striped }}
        >
          {row}
        </RowPosition.Provider>
      ))}
    </View>
  )
})

const TableFooter = forwardRef<TamaguiElement, GetProps<typeof TableFooterFrame>>(
  function TableFooter(props, ref) {
    return <TableFooterFrame ref={ref} {...props} />
  },
)

export interface TableRowProps extends GetProps<typeof TableRowFrame> {
  /** Highlights the row, e.g. when it is checked. Pair with `aria-selected` in a grid. */
  selected?: boolean
}

const TableRow = forwardRef<TamaguiElement, TableRowProps>(function TableRow(
  { selected = false, ...props },
  ref,
) {
  const position = useContext(RowPosition)
  return (
    <TableRowFrame
      ref={ref}
      // Header and footer rows sit inside a bordered group; body rows divide each other.
      divider={position ? !position.last : false}
      striped={!!position?.striped && position.index % 2 === 1}
      selected={selected}
      interactive={!!props.onPress}
      {...props}
    />
  )
})

export interface TableCellProps extends Omit<GetProps<typeof TableCellFrame>, 'align'> {
  /** Horizontal alignment. Use `end` for numbers. */
  align?: TableAlign
}

function CellContent({ children, align }: { children: ReactNode; align: TableAlign }) {
  return isTextContent(children) ? (
    <Text size="sm" textAlign={textAlign[align]}>
      {children}
    </Text>
  ) : (
    <>{children}</>
  )
}

/** A data cell. Plain text is wrapped in body text; pass `width` or `flex` to size the column. */
const TableCell = forwardRef<TamaguiElement, TableCellProps>(function TableCell(
  { align = 'start', children, ...props },
  ref,
) {
  return (
    <TableCellFrame ref={ref} align={align} {...props}>
      <CellContent align={align}>{children}</CellContent>
    </TableCellFrame>
  )
})

export interface TableHeadProps extends Omit<GetProps<typeof TableHeadFrame>, 'align'> {
  align?: TableAlign
  /**
   * Makes the header a sort button and sets `aria-sort`. `none` shows the
   * sortable icon; leave it out for a column that does not sort.
   */
  sortDirection?: TableSortDirection
  /** Called when the sort button is pressed. */
  onSort?: () => void
}

const sortIcons = {
  ascending: ChevronUpIcon,
  descending: ChevronDownIcon,
  none: ChevronsUpDownIcon,
} as const

/** A column header. Give it the same `width` or `flex` as the column's cells. */
const TableHead = forwardRef<TamaguiElement, TableHeadProps>(function TableHead(
  { align = 'start', sortDirection, onSort, children, ...props },
  ref,
) {
  const label = (
    <Text size="sm" weight="medium" tone="muted" textAlign={textAlign[align]}>
      {children}
    </Text>
  )
  const sortable = sortDirection != null
  const SortIcon = sortable ? sortIcons[sortDirection] : null
  return (
    <TableHeadFrame
      ref={ref}
      align={align}
      {...(sortable && isWeb && { 'aria-sort': sortDirection })}
      {...props}
    >
      {SortIcon ? (
        <View
          {...(isWeb ? { render: 'button', type: 'button' } : { accessible: true, role: 'button' })}
          // Native has no aria-sort, so the button says how the column is sorted.
          {...(!isWeb &&
            isTextContent(children) && {
              'aria-label': `${[children].flat().join('')}${
                sortDirection === 'none' ? '' : `, sorted ${sortDirection}`
              }`,
            })}
          flexDirection={align === 'end' ? 'row-reverse' : 'row'}
          alignItems="center"
          gap="$1"
          padding="$1"
          margin="$-1"
          borderWidth={0}
          borderRadius="$sm"
          backgroundColor="transparent"
          cursor="pointer"
          hoverStyle={{ backgroundColor: '$accent' }}
          focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
          onPress={onSort}
        >
          {label}
          <View aria-hidden>
            <SortIcon
              size={14}
              color={sortDirection === 'none' ? '$mutedForeground' : '$foreground'}
            />
          </View>
        </View>
      ) : (
        label
      )}
    </TableHeadFrame>
  )
})

/**
 * Rows and columns of data. Compose with `Table.Header`, `Table.Body`,
 * `Table.Footer`, `Table.Row`, `Table.Head` and `Table.Cell`. Columns share
 * the width equally unless a cell sets `width` or `flex`.
 */
export const Table = withStaticProperties(TableImpl, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
})

export { TableFrame, TableRowFrame, TableCellFrame, TableHeadFrame }
export type TableHeaderProps = GetProps<typeof TableHeader>
export type TableBodyProps = GetProps<typeof View>
export type TableFooterProps = GetProps<typeof TableFooterFrame>
