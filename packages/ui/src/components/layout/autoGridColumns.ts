import { type SpaceTokens, type Token, getTokenValue } from 'tamagui'

/**
 * How many columns at least `minChildWidth` wide fit in `width`, with `gap`
 * between them, capped by `maxColumns`, and never fewer than 1. It is the
 * count CSS grid's `repeat(auto-fill, minmax(…))` picks on web, so native
 * AutoGrids, which measure their width, get the same columns as web ones.
 */
export function autoGridColumns(
  width: number,
  minChildWidth: number,
  gap = 0,
  maxColumns?: number,
): number {
  const fit = Math.floor((width + gap) / (Math.max(minChildWidth, 1) + gap))
  const cap = maxColumns !== undefined && maxColumns >= 1 ? Math.floor(maxColumns) : Infinity
  const columns = Math.min(fit, cap)
  return Number.isFinite(columns) && columns > 1 ? columns : 1
}

/** A space token (or number) in px. */
export function spaceValue(gap: SpaceTokens | number): number {
  if (typeof gap === 'number') return gap
  return (getTokenValue(gap as Token, 'space') as number | undefined) ?? 0
}
