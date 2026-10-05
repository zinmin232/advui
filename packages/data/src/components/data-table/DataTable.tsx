import { SearchIcon } from '@advui/icons'
import type { ReactNode } from 'react'
import { type GetProps, View, XStack, isWeb } from 'tamagui'
import { Checkbox, Input, Pagination, Skeleton, Text, useControllableState } from '@advui/core'
import { Table, type TableAlign, type TableProps } from '../table/Table'

export type DataTableValue = string | number | boolean | Date | null | undefined

export interface DataTableColumn<T> {
  /** Unique key; also the row field read when there is no `accessor`. */
  id: string
  header: ReactNode
  /** The value used to sort, search and (without `cell`) display. Default: `row[id]`. */
  accessor?: (row: T) => DataTableValue
  /** Custom cell content, e.g. a Badge. */
  cell?: (row: T) => ReactNode
  sortable?: boolean
  /** Also used by `searchable`. Default: true. */
  searchable?: boolean
  align?: TableAlign
  /** Share of the width, like CSS `flex-grow`. Default: 1. */
  flex?: number
  width?: GetProps<typeof Table.Cell>['width']
}

export interface DataTableSort {
  column: string
  direction: 'ascending' | 'descending'
}

export interface DataTableLabels {
  search: string
  selectAll: string
  selectRow: (rowLabel: string) => string
  empty: string
  /** Rows shown, e.g. "11–20 of 87". */
  range: (first: number, last: number, total: number) => string
  selected: (count: number) => string
}

const defaultLabels: DataTableLabels = {
  search: 'Search',
  selectAll: 'Select all rows on this page',
  selectRow: (rowLabel) => `Select ${rowLabel}`,
  empty: 'No results.',
  range: (first, last, total) => `${first}–${last} of ${total}`,
  selected: (count) => `${count} selected`,
}

export interface DataTableProps<T> extends Omit<TableProps, 'children' | 'onSort' | 'caption'> {
  data: T[]
  columns: DataTableColumn<T>[]
  /** Stable id of a row. Default: `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string
  /** Names a row for its checkbox ("Select INV-001"). Default: its id. */
  getRowLabel?: (row: T) => string
  caption?: ReactNode

  /** Sorted column (controlled). `null` keeps the data's order. */
  sort?: DataTableSort | null
  defaultSort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort | null) => void

  /** Rows per page. Without it every row is shown. */
  pageSize?: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void

  /** Adds a checkbox column. */
  selectable?: boolean
  selectedIds?: string[]
  defaultSelectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void

  /** Adds a search field that filters rows on their searchable columns. */
  searchable?: boolean
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void
  /** Custom filter. Default: any searchable column contains the text, ignoring case and accents. */
  filterRow?: (row: T, search: string) => boolean

  /** Controls next to the search field, such as an "Add" button. */
  toolbar?: ReactNode
  /** Shown when no row matches. Default: "No results." */
  empty?: ReactNode
  /** Placeholder rows and `aria-busy`. */
  loading?: boolean
  /** Text for screen readers and the status line, for translation. */
  labels?: Partial<DataTableLabels>
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const valueOf = <T,>(column: DataTableColumn<T>, row: T): DataTableValue =>
  column.accessor ? column.accessor(row) : ((row as Record<string, unknown>)[column.id] as never)

const display = (value: DataTableValue) =>
  value == null ? '' : value instanceof Date ? value.toLocaleDateString() : String(value)

function compareValues(a: DataTableValue, b: DataTableValue): number {
  // Empty values sort last in either direction.
  if (a == null || a === '') return b == null || b === '' ? 0 : 1
  if (b == null || b === '') return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * A Table driven by data and column definitions, with sorting, a search
 * field, row selection and pagination built in.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId = (row, index) => String((row as { id?: unknown }).id ?? index),
  getRowLabel,
  caption,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  pageSize,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  selectable = false,
  selectedIds: selectedProp,
  defaultSelectedIds = [],
  onSelectedIdsChange,
  searchable = false,
  search: searchProp,
  defaultSearch = '',
  onSearchChange,
  filterRow,
  toolbar,
  empty,
  loading = false,
  labels: labelsProp,
  size = 'md',
  ...tableProps
}: DataTableProps<T>) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [sort, setSort] = useControllableState<DataTableSort | null>({
    value: sortProp,
    defaultValue: defaultSort,
    onChange: onSortChange,
  })
  const [rawPage, setPage] = useControllableState({
    value: pageProp,
    defaultValue: defaultPage,
    onChange: onPageChange,
  })
  const [selected, setSelected] = useControllableState<string[]>({
    value: selectedProp,
    defaultValue: defaultSelectedIds,
    onChange: onSelectedIdsChange,
  })
  const [search, setSearch] = useControllableState({
    value: searchProp,
    defaultValue: defaultSearch,
    onChange: onSearchChange,
  })

  const rows = (() => {
    const indexed = data.map((row, index) => ({ row, id: getRowId(row, index) }))
    const query = normalize(search.trim())
    const filtered = !query
      ? indexed
      : indexed.filter(({ row }) =>
          filterRow
            ? filterRow(row, search)
            : columns.some(
                (column) =>
                  column.searchable !== false &&
                  normalize(display(valueOf(column, row))).includes(query),
              ),
        )
    const column = sort && columns.find((c) => c.id === sort.column)
    if (!column || !sort) return filtered
    const sign = sort.direction === 'ascending' ? 1 : -1
    // Array.prototype.sort is stable, so equal values keep the data's order.
    return [...filtered].sort((a, b) => {
      const order = compareValues(valueOf(column, a.row), valueOf(column, b.row))
      // Empty values stay last when descending too.
      const empty = valueOf(column, a.row) == null || valueOf(column, b.row) == null
      return empty ? order : order * sign
    })
  })()

  const pageCount = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1
  const page = Math.min(Math.max(1, rawPage), pageCount)
  const first = pageSize ? (page - 1) * pageSize : 0
  const visible = pageSize ? rows.slice(first, first + pageSize) : rows

  const visibleIds = visible.map((r) => r.id)
  const selectedSet = new Set(selected)
  const selectedOnPage = visibleIds.filter((id) => selectedSet.has(id)).length
  const allChecked =
    selectedOnPage === 0 ? false : selectedOnPage === visibleIds.length ? true : 'indeterminate'

  const toggleSort = (id: string) => {
    // Ascending, then descending, then the data's own order.
    const next: DataTableSort | null =
      sort?.column !== id
        ? { column: id, direction: 'ascending' }
        : sort.direction === 'ascending'
          ? { column: id, direction: 'descending' }
          : null
    setSort(next)
    setPage(1)
  }

  const toggleRow = (id: string, checked: boolean) =>
    setSelected(checked ? [...selected, id] : selected.filter((s) => s !== id))

  const toggleAll = () =>
    setSelected(
      allChecked === true
        ? selected.filter((id) => !visibleIds.includes(id))
        : [...selected, ...visibleIds.filter((id) => !selectedSet.has(id))],
    )

  const checkboxCell = { flexGrow: 0, flexShrink: 0, width: size === 'sm' ? '$10' : '$12' } as const
  const placeholderRows = Math.min(pageSize ?? 5, 5)

  return (
    <View
      gap="$3"
      width="100%"
      // Web only: Android has no busy state for an unnamed view and would read
      // "busy" on it for good.
      {...(isWeb && { 'aria-busy': loading || undefined })}
    >
      {searchable || toolbar ? (
        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          {searchable ? (
            <XStack position="relative" flex={1} minWidth="$48" maxWidth="$80" alignItems="center">
              <View position="absolute" left="$3" zIndex={1} pointerEvents="none" aria-hidden>
                <SearchIcon size={16} color="$mutedForeground" />
              </View>
              <Input
                flex={1}
                size={size === 'sm' ? 'sm' : 'md'}
                paddingLeft="$9"
                role="searchbox"
                aria-label={labels.search}
                placeholder={labels.search}
                value={search}
                onChangeText={(text: string) => {
                  setSearch(text)
                  setPage(1)
                }}
              />
            </XStack>
          ) : null}
          {toolbar ? (
            <XStack gap="$2" marginLeft="auto" alignItems="center">
              {toolbar}
            </XStack>
          ) : null}
        </XStack>
      ) : null}

      <Table caption={caption} size={size} {...tableProps}>
        <Table.Header>
          <Table.Row>
            {selectable ? (
              <Table.Head {...checkboxCell} align="center">
                <Checkbox
                  size="sm"
                  aria-label={labels.selectAll}
                  checked={allChecked}
                  disabled={loading || visibleIds.length === 0}
                  onCheckedChange={toggleAll}
                />
              </Table.Head>
            ) : null}
            {columns.map((column) => (
              <Table.Head
                key={column.id}
                align={column.align}
                flex={column.flex}
                {...(column.width != null && { width: column.width, flexGrow: 0 })}
                {...(column.sortable && {
                  sortDirection: sort?.column === column.id ? sort.direction : 'none',
                  onSort: () => toggleSort(column.id),
                })}
              >
                {column.header}
              </Table.Head>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            Array.from({ length: placeholderRows }, (_, index) => (
              <Table.Row key={`placeholder-${index}`}>
                {selectable ? <Table.Cell {...checkboxCell} /> : null}
                {columns.map((column) => (
                  <Table.Cell
                    key={column.id}
                    align={column.align}
                    flex={column.flex}
                    {...(column.width != null && { width: column.width, flexGrow: 0 })}
                  >
                    <Skeleton height="$3" width="70%" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : visible.length === 0 ? (
            <Table.Row>
              <Table.Cell align="center" paddingVertical="$8">
                {empty ?? (
                  <Text size="sm" tone="muted">
                    {labels.empty}
                  </Text>
                )}
              </Table.Cell>
            </Table.Row>
          ) : (
            visible.map(({ row, id }) => {
              const checked = selectedSet.has(id)
              return (
                <Table.Row key={id} selected={checked}>
                  {selectable ? (
                    <Table.Cell {...checkboxCell} align="center">
                      <Checkbox
                        size="sm"
                        aria-label={labels.selectRow(getRowLabel?.(row) ?? id)}
                        checked={checked}
                        onCheckedChange={(next) => toggleRow(id, next === true)}
                      />
                    </Table.Cell>
                  ) : null}
                  {columns.map((column) => (
                    <Table.Cell
                      key={column.id}
                      align={column.align}
                      flex={column.flex}
                      {...(column.width != null && { width: column.width, flexGrow: 0 })}
                    >
                      {column.cell ? column.cell(row) : display(valueOf(column, row))}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )
            })
          )}
        </Table.Body>
      </Table>

      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        minHeight="$8"
      >
        <Text size="sm" tone="muted" aria-live="polite">
          {loading
            ? ''
            : [
                selectable && selected.length > 0 ? labels.selected(selected.length) : null,
                rows.length > 0
                  ? labels.range(first + 1, first + visible.length, rows.length)
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
        </Text>
        {pageSize && pageCount > 1 ? (
          <Pagination count={pageCount} page={page} onPageChange={setPage} size="sm" />
        ) : null}
      </XStack>
    </View>
  )
}
