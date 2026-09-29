import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { ScrollView, View, XStack, isWeb, styled } from 'tamagui'
import { Input, Text, useControllableState } from '@advui/core'

export type DataGridValue = string | number | null | undefined

export interface DataGridColumn<T> {
  /** Unique key; also the row field read and written when there is no `accessor`. */
  id: string
  header: string
  /** The cell's value. Default: `row[id]`. */
  accessor?: (row: T) => DataGridValue
  /** Writes an edited value back. Default: `{ ...row, [id]: value }`. */
  setValue?: (row: T, value: DataGridValue) => T
  /** Display text. Default: the value as text. */
  format?: (value: DataGridValue, row: T) => string
  /** Custom display content, e.g. a Badge. Editing still uses the value. */
  cell?: (row: T) => ReactNode
  /** `number` right-aligns, opens the number keyboard and parses the input. */
  type?: 'text' | 'number'
  editable?: boolean
  /** Return a message to reject an edit, e.g. "Must be 0 or more". */
  validate?: (value: DataGridValue, row: T) => string | null | undefined
  /** Pixels. Default: 160. */
  width?: number
  align?: 'start' | 'center' | 'end'
}

export interface DataGridCellChange<T> {
  row: T
  rowId: string
  rowIndex: number
  columnId: string
  value: DataGridValue
  previousValue: DataGridValue
}

export interface DataGridLabels {
  /** Read on native after an editable cell's name. */
  editHint: string
  /** Error when a number column gets text. */
  notANumber: string
  /** The status line after a rejected edit: "Reached, Hakha: Enter a number." */
  error: (cell: string, message: string) => string
}

const defaultLabels: DataGridLabels = {
  editHint: 'Double-tap to edit.',
  notANumber: 'Enter a number.',
  error: (cell, message) => `${cell}: ${message}`,
}

export interface DataGridProps<T> {
  /** Rows (controlled). Edits come back through `onDataChange`. */
  data?: T[]
  defaultData?: T[]
  onDataChange?: (data: T[]) => void
  /** Called for each accepted edit. */
  onCellChange?: (change: DataGridCellChange<T>) => void
  columns: DataGridColumn<T>[]
  /** Stable id of a row. Default: `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string
  /** Names a row in cell names and errors ("Hakha"). Default: the first column. */
  getRowLabel?: (row: T) => string
  /** Required: names the grid. */
  'aria-label': string
  /** Turns all editing off. */
  readOnly?: boolean
  size?: 'sm' | 'md'
  labels?: Partial<DataGridLabels>
}

const Cell = styled(View, {
  name: 'DataGridCell',
  position: 'relative',
  justifyContent: 'center',
  flexShrink: 0,
  borderRightWidth: 1,
  borderBottomWidth: 1,
  borderColor: '$border',
  paddingHorizontal: '$3',
  outlineStyle: 'none',

  variants: {
    size: {
      sm: { height: '$8' },
      md: { height: '$10', $touchable: { height: '$11' } },
    },
    header: {
      true: { backgroundColor: '$muted' },
    },
    editing: {
      true: { paddingHorizontal: 0 },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const valueOf = <T,>(column: DataGridColumn<T>, row: T): DataGridValue =>
  column.accessor ? column.accessor(row) : ((row as Record<string, unknown>)[column.id] as never)

const textOf = <T,>(column: DataGridColumn<T>, row: T) => {
  const value = valueOf(column, row)
  return column.format ? column.format(value, row) : value == null ? '' : String(value)
}

const justify = { start: 'flex-start', center: 'center', end: 'flex-end' } as const

type Position = { row: number; col: number }
type KeyEvent = {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  preventDefault: () => void
  stopPropagation?: () => void
}

/**
 * A spreadsheet-like grid: move between cells with the arrow keys, and edit
 * a cell in place with Enter, F2 or by typing.
 */
export function DataGrid<T>({
  data: dataProp,
  defaultData = [],
  onDataChange,
  onCellChange,
  columns,
  getRowId = (row, index) => String((row as { id?: unknown }).id ?? index),
  getRowLabel,
  'aria-label': ariaLabel,
  readOnly = false,
  size = 'md',
  labels: labelsProp,
}: DataGridProps<T>) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [data, setData] = useControllableState<T[]>({
    value: dataProp,
    defaultValue: defaultData,
    onChange: onDataChange,
  })
  const [active, setActive] = useState<Position>({ row: 0, col: 0 })
  const [editing, setEditing] = useState<Position | null>(null)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const baseId = useId()
  const statusId = `${baseId}-status`
  const cellId = (row: number, col: number) => `${baseId}-${row}-${col}`
  const refocus = useRef(false)
  const [gridFocused, setGridFocused] = useState(false)

  const rowCount = data.length
  const colCount = columns.length
  const widths = columns.map((column) => column.width ?? 160)
  const totalWidth = widths.reduce((sum, width) => sum + width, 0)
  const rowLabel = (row: T) =>
    getRowLabel ? getRowLabel(row) : columns[0] ? textOf(columns[0], row) : ''
  const cellName = (row: number, col: number) => `${columns[col]!.header}, ${rowLabel(data[row]!)}`
  const canEdit = (col: number) => !readOnly && columns[col]?.editable === true

  const focusCell = (position: Position) => {
    if (isWeb) document.getElementById(cellId(position.row, position.col))?.focus()
  }

  // After an edit ends, focus goes back to its cell (web).
  useEffect(() => {
    if (editing || !refocus.current) return
    refocus.current = false
    focusCell(active)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const move = (row: number, col: number) => {
    const next = {
      row: Math.max(0, Math.min(rowCount - 1, row)),
      col: Math.max(0, Math.min(colCount - 1, col)),
    }
    setActive(next)
    focusCell(next)
  }

  const startEdit = (position: Position, initial?: string) => {
    if (!canEdit(position.col)) return
    const row = data[position.row]!
    setActive(position)
    setError(null)
    setDraft(initial ?? String(valueOf(columns[position.col]!, row) ?? ''))
    setEditing(position)
  }

  const cancelEdit = () => {
    refocus.current = true
    setError(null)
    setEditing(null)
  }

  /** Validates and saves the draft. Returns false (and keeps editing) when rejected. */
  const commit = (): boolean => {
    if (!editing) return true
    const column = columns[editing.col]!
    const row = data[editing.row]!
    const text = draft.trim()
    let value: DataGridValue = text
    if (column.type === 'number') {
      value = text === '' ? null : Number(text.replace(/,/g, ''))
      if (typeof value === 'number' && Number.isNaN(value)) {
        setError(labels.error(cellName(editing.row, editing.col), labels.notANumber))
        return false
      }
    }
    const message = column.validate?.(value, row)
    if (message) {
      setError(labels.error(cellName(editing.row, editing.col), message))
      return false
    }
    const previousValue = valueOf(column, row)
    if (value !== previousValue) {
      const nextRow = column.setValue
        ? column.setValue(row, value)
        : ({ ...row, [column.id]: value } as T)
      setData(data.map((r, i) => (i === editing.row ? nextRow : r)))
      onCellChange?.({
        row: nextRow,
        rowId: getRowId(nextRow, editing.row),
        rowIndex: editing.row,
        columnId: column.id,
        value,
        previousValue,
      })
    }
    refocus.current = true
    setError(null)
    setEditing(null)
    return true
  }

  const onGridKeyDown = (event: KeyEvent) => {
    if (editing || rowCount === 0) return
    const { row, col } = active
    const ctrl = event.ctrlKey || event.metaKey
    const moves: Record<string, Position> = {
      ArrowUp: { row: row - 1, col },
      ArrowDown: { row: row + 1, col },
      ArrowLeft: { row, col: col - 1 },
      ArrowRight: { row, col: col + 1 },
      Home: ctrl ? { row: 0, col: 0 } : { row, col: 0 },
      End: ctrl ? { row: rowCount - 1, col: colCount - 1 } : { row, col: colCount - 1 },
      PageUp: { row: row - 5, col },
      PageDown: { row: row + 5, col },
    }
    const target = moves[event.key]
    if (target) {
      event.preventDefault()
      move(target.row, target.col)
    } else if ((event.key === 'Enter' || event.key === 'F2') && canEdit(col)) {
      event.preventDefault()
      startEdit(active)
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && canEdit(col)) {
      event.preventDefault()
      startEdit(active, '')
    } else if (event.key.length === 1 && !ctrl && !event.altKey && canEdit(col)) {
      // Typing replaces the value, as in a spreadsheet.
      event.preventDefault()
      startEdit(active, event.key)
    }
  }

  const onEditorKeyDown = (event: KeyEvent) => {
    event.stopPropagation?.()
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelEdit()
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const from = editing!
      if (!commit()) return
      const next =
        event.key === 'Enter'
          ? { row: Math.min(rowCount - 1, from.row + (event.shiftKey ? -1 : 1)), col: from.col }
          : {
              row: from.row,
              col: Math.max(0, Math.min(colCount - 1, from.col + (event.shiftKey ? -1 : 1))),
            }
      setActive({ row: Math.max(0, next.row), col: next.col })
    }
  }

  return (
    <View gap="$2" width="100%">
      <ScrollView
        horizontal
        // Hugs the columns when they are narrower than the page; scrolls when wider.
        alignSelf="flex-start"
        maxWidth="100%"
        borderWidth={1}
        borderColor="$border"
        borderRadius="$md"
        keyboardShouldPersistTaps="handled"
      >
        <View
          width={totalWidth}
          {...(isWeb
            ? {
                role: 'grid',
                'aria-label': ariaLabel,
                'aria-rowcount': rowCount + 1,
                'aria-colcount': colCount,
                ...(readOnly && { 'aria-readonly': true }),
                onKeyDown: onGridKeyDown,
                onFocus: () => setGridFocused(true),
                onBlur: (event: { currentTarget: HTMLElement; relatedTarget: unknown }) =>
                  setGridFocused(event.currentTarget.contains(event.relatedTarget as Node | null)),
              }
            : { 'aria-label': ariaLabel })}
        >
          <XStack {...(isWeb && { role: 'row', 'aria-rowindex': 1 })}>
            {columns.map((column, col) => (
              <Cell
                key={column.id}
                size={size}
                header
                width={widths[col]}
                alignItems={justify[column.align ?? (column.type === 'number' ? 'end' : 'start')]}
                {...(col === colCount - 1 && { borderRightWidth: 0 })}
                {...(isWeb
                  ? { role: 'columnheader' as never, 'aria-colindex': col + 1 }
                  : { accessible: true, accessibilityRole: 'header' as const })}
              >
                <Text size="xs" weight="semibold" tone="muted" numberOfLines={1}>
                  {column.header}
                </Text>
              </Cell>
            ))}
          </XStack>
          {data.map((row, r) => (
            <XStack key={getRowId(row, r)} {...(isWeb && { role: 'row', 'aria-rowindex': r + 2 })}>
              {columns.map((column, c) => {
                const isActive = active.row === r && active.col === c
                const isEditing = editing?.row === r && editing.col === c
                const align = column.align ?? (column.type === 'number' ? 'end' : 'start')
                const editable = canEdit(c)
                const text = textOf(column, row)
                return (
                  <Cell
                    key={column.id}
                    id={cellId(r, c)}
                    size={size}
                    editing={isEditing}
                    width={widths[c]}
                    alignItems={justify[align]}
                    {...(c === colCount - 1 && { borderRightWidth: 0 })}
                    {...(r === rowCount - 1 && { borderBottomWidth: 0 })}
                    cursor={editable ? 'cell' : 'default'}
                    // The active cell's ring, while the grid has focus (a click is not :focus-visible).
                    {...(isActive &&
                      gridFocused &&
                      !isEditing && {
                        outlineColor: '$ring',
                        outlineStyle: 'solid',
                        outlineWidth: 2,
                        outlineOffset: -2,
                      })}
                    {...(isWeb
                      ? {
                          role: 'gridcell' as never,
                          'aria-colindex': c + 1,
                          tabIndex: isActive && !isEditing ? 0 : -1,
                          ...(editable ? {} : { 'aria-readonly': true }),
                          onFocus: () => !isActive && setActive({ row: r, col: c }),
                          onPress: () => setActive({ row: r, col: c }),
                          onDoubleClick: () => startEdit({ row: r, col: c }),
                        }
                      : isEditing
                        ? {}
                        : {
                            accessible: true,
                            ...(editable && { role: 'button' }),
                            'aria-label': `${cellName(r, c)}: ${text}`,
                            ...(editable && { accessibilityHint: labels.editHint }),
                            onPress: () =>
                              editable
                                ? startEdit({ row: r, col: c })
                                : setActive({ row: r, col: c }),
                          })}
                  >
                    {isEditing ? (
                      <Input
                        autoFocus
                        unstyled
                        size={size}
                        height="100%"
                        width="100%"
                        borderRadius={0}
                        borderWidth={2}
                        borderColor={error ? '$error' : '$ring'}
                        backgroundColor="$background"
                        textAlign={
                          align === 'end' ? 'right' : align === 'center' ? 'center' : 'left'
                        }
                        aria-label={cellName(r, c)}
                        invalid={error != null}
                        {...(isWeb && error && { 'aria-describedby': statusId })}
                        keyboardType={column.type === 'number' ? 'numeric' : 'default'}
                        value={draft}
                        onChangeText={(next: string) => {
                          setDraft(next)
                          setError(null)
                        }}
                        {...(isWeb
                          ? { onKeyDown: onEditorKeyDown }
                          : { onSubmitEditing: () => commit(), returnKeyType: 'done' as const })}
                        onBlur={() => {
                          // Clicking elsewhere saves; an invalid value is dropped.
                          if (!commit()) cancelEdit()
                        }}
                      />
                    ) : column.cell ? (
                      column.cell(row)
                    ) : (
                      <Text size="sm" numberOfLines={1}>
                        {text}
                      </Text>
                    )}
                  </Cell>
                )
              })}
            </XStack>
          ))}
        </View>
      </ScrollView>
      <Text id={statusId} size="sm" tone="error" aria-live="polite" minHeight="$5">
        {error ?? ''}
      </Text>
    </View>
  )
}
