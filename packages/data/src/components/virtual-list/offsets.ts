/** Row height in pixels: one for every row, or one per row. */
export type ItemHeight = number | ((index: number) => number)

export const heightOf = (itemHeight: ItemHeight, index: number) =>
  typeof itemHeight === 'number' ? itemHeight : itemHeight(index)

/** Where each row starts, plus the total height as the last entry. */
export function itemOffsets(count: number, itemHeight: ItemHeight) {
  const offsets = new Array<number>(count + 1)
  offsets[0] = 0
  for (let i = 0; i < count; i++) offsets[i + 1] = offsets[i]! + heightOf(itemHeight, i)
  return offsets
}

/** The row at `y` pixels from the top, found by halving: lists can be long. */
export function indexAt(offsets: readonly number[], y: number) {
  let low = 0
  let high = offsets.length - 2
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (offsets[mid]! <= y) low = mid
    else high = mid - 1
  }
  return Math.max(0, low)
}
