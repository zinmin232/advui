export interface KanbanItem {
  id: string
  /** The card's name: shown by default, and read by screen readers. */
  title: string
  /** Shown under the title by default. */
  description?: string
  /** Stays where it is: cannot be picked up. */
  disabled?: boolean
}

export interface KanbanColumn<T extends KanbanItem = KanbanItem> {
  id: string
  title: string
  items: T[]
}

export interface KanbanPlace {
  columnId: string
  /** Position in the column, from 0. */
  index: number
}

export interface KanbanMove {
  itemId: string
  from: KanbanPlace
  /** Where it is now: the index counts the column without the card in its old place. */
  to: KanbanPlace
}

/** Where an item is: its column and index. */
export function findItem<T extends KanbanItem>(
  columns: readonly KanbanColumn<T>[],
  itemId: string,
) {
  for (const column of columns) {
    const index = column.items.findIndex((item) => item.id === itemId)
    if (index !== -1) return { column, index, item: column.items[index]! }
  }
  return null
}

/**
 * The columns with one item moved to `index` in another (or the same)
 * column. Columns the move does not touch keep their identity.
 */
export function moveItem<T extends KanbanItem>(
  columns: readonly KanbanColumn<T>[],
  itemId: string,
  toColumnId: string,
  toIndex: number,
): KanbanColumn<T>[] {
  const found = findItem(columns, itemId)
  if (!found || !columns.some((column) => column.id === toColumnId)) return [...columns]
  return columns.map((column) => {
    let items = column.items
    if (column.id === found.column.id) items = items.filter((item) => item.id !== itemId)
    if (column.id === toColumnId) {
      const index = Math.max(0, Math.min(toIndex, items.length))
      items = [...items.slice(0, index), found.item, ...items.slice(index)]
    }
    return items === column.items ? column : { ...column, items }
  })
}
