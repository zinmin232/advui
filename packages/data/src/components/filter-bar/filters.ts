import { plainSpaces, type DateRange } from '@advui/core'
import type { ReactNode } from 'react'

/** The value an option stands for. It is kept as given: a number stays a number. */
export type FilterOptionValue = string | number | boolean

export interface FilterOption<V extends FilterOptionValue = FilterOptionValue> {
  label: string
  value: V
  disabled?: boolean
}

/**
 * One filter's value. `null` is unset: Filter Bar reports an emptied text
 * field, an empty multi-select and a range with neither end as `null`.
 */
export type FilterValue =
  string | number | boolean | Date | DateRange | Array<string | number> | null

/** Each filter's value by its key. Keys that are not filters are kept as they are. */
export type FilterState = Record<string, FilterValue>

interface FilterBase {
  /** Unique and stable: the filter's key in the state. */
  key: string
  /** Names the control, and starts its chip ("Status: Active"). */
  label: string
  /** With `collapsible`, the filter sits in the panel behind "More filters". */
  advanced?: boolean
  disabled?: boolean
}

export interface SelectFilterDefinition extends FilterBase {
  type: 'select'
  options: FilterOption[]
  /** Shown while unset, and the label of the first option, which unsets it. Default "All". */
  placeholder?: string
  /** What Reset restores and what is not counted as active. Default `null`. */
  defaultValue?: FilterOptionValue | null
}

export interface MultiSelectFilterDefinition extends FilterBase {
  type: 'multi-select'
  options: FilterOption<string | number>[]
  placeholder?: string
  defaultValue?: Array<string | number> | null
}

export interface BooleanFilterDefinition extends FilterBase {
  type: 'boolean'
  /** Default "Yes". */
  trueLabel?: string
  /** Default "No". */
  falseLabel?: string
  /** The unset option. Default "All". */
  placeholder?: string
  defaultValue?: boolean | null
}

export interface DateFilterDefinition extends FilterBase {
  type: 'date'
  placeholder?: string
  defaultValue?: Date | null
}

export interface DateRangeFilterDefinition extends FilterBase {
  type: 'date-range'
  placeholder?: string
  defaultValue?: DateRange | null
}

export interface TextFilterDefinition extends FilterBase {
  type: 'text'
  placeholder?: string
  defaultValue?: string | null
}

// Methods, not function properties: a `CustomFilterDefinition<number[]>`
// then fits in a `FilterDefinition[]`.
export interface CustomFilterContext<V extends FilterValue = FilterValue> {
  /** The current value; `null` while unset. */
  value: V | null
  /** Sets the value; empty values (`''`, `[]`) become `null`. */
  onValueChange(value: V | null): void
  /** Sets the filter back to its default. */
  reset(): void
  size: 'sm' | 'md' | 'lg'
  disabled: boolean
  /** The filter's label while labels are hidden (`showLabels={false}`); name your control with it. */
  'aria-label'?: string
}

export interface CustomFilterDefinition<V extends FilterValue = FilterValue> extends FilterBase {
  type: 'custom'
  /** The control. Inside the filter's Field, core form controls take its label and id. */
  render(context: CustomFilterContext<V>): ReactNode
  /** How a value reads in its chip. Default: the value as text. */
  format?(value: V): string
  defaultValue?: V | null
}

export type FilterDefinition =
  | SelectFilterDefinition
  | MultiSelectFilterDefinition
  | BooleanFilterDefinition
  | DateFilterDefinition
  | DateRangeFilterDefinition
  | TextFilterDefinition
  | CustomFilterDefinition

export const isDateRange = (value: unknown): value is DateRange =>
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof Date) &&
  !Array.isArray(value) &&
  'start' in value &&
  'end' in value

export function isEmptyFilterValue(value: FilterValue | undefined): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (isDateRange(value)) return !value.start && !value.end
  return false
}

/** `null` for every empty value, so the state has one way to say "unset". */
export const normalizeFilterValue = (value: FilterValue | undefined): FilterValue =>
  isEmptyFilterValue(value) ? null : (value as FilterValue)

const sameDate = (a: Date | null, b: Date | null) =>
  a === b || (a !== null && b !== null && a.getTime() === b.getTime())

/** Equal by content: dates by time, multi-select values as sets, ranges by both ends. */
export function sameFilterValue(a: FilterValue | undefined, b: FilterValue | undefined): boolean {
  if (isEmptyFilterValue(a) || isEmptyFilterValue(b))
    return isEmptyFilterValue(a) && isEmptyFilterValue(b)
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date && sameDate(a, b)
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    const set = new Set<string | number>(a)
    return new Set<string | number>(b).size === set.size && b.every((item) => set.has(item))
  }
  if (isDateRange(a) || isDateRange(b))
    return isDateRange(a) && isDateRange(b) && sameDate(a.start, b.start) && sameDate(a.end, b.end)
  return Object.is(a, b)
}

export const defaultOf = (filter: FilterDefinition): FilterValue =>
  normalizeFilterValue(filter.defaultValue ?? null)

/**
 * Every filter's value (its default where the state has no key for it) and
 * the search text, normalized; other keys as given. A new object: the
 * state passed in is never changed.
 */
export function resolveFilterState(
  filters: readonly FilterDefinition[],
  state: FilterState,
  searchKey: string | undefined,
): FilterState {
  const resolved: FilterState = { ...state }
  for (const filter of filters) {
    const value = state[filter.key]
    resolved[filter.key] = value === undefined ? defaultOf(filter) : normalizeFilterValue(value)
  }
  if (searchKey !== undefined) resolved[searchKey] = normalizeFilterValue(state[searchKey])
  return resolved
}

export function sameFilterState(a: FilterState, b: FilterState): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) if (!sameFilterValue(a[key], b[key])) return false
  return true
}

/** Set, and not its default. A multi-select or a range counts once. */
export const isFilterActive = (filter: FilterDefinition, value: FilterValue | undefined) =>
  !isEmptyFilterValue(value) && !sameFilterValue(value, defaultOf(filter))

const dayOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** A range whose end comes before its start is invalid; it is never swapped. */
export function isFilterValueValid(filter: FilterDefinition, value: FilterValue | undefined) {
  if (filter.type !== 'date-range' || !isDateRange(value) || !value.start || !value.end) return true
  return dayOf(value.end).getTime() >= dayOf(value.start).getTime()
}

/** The texts a chip needs that Filter Bar's `labels` can translate. */
export interface FilterFormatLabels {
  yes: string
  no: string
  from: (date: string) => string
  until: (date: string) => string
  more: (count: number) => string
}

/** How a value reads after its filter's label in a chip: "Active", "Engineering, Finance +2". */
export function formatFilterValue(
  filter: FilterDefinition,
  value: FilterValue,
  labels: FilterFormatLabels,
  formatter: Intl.DateTimeFormat,
): string {
  const dates = {
    format: (date: Date) => plainSpaces(formatter.format(date)),
    formatRange: (start: Date, end: Date) =>
      // Hermes may lack formatRange, and older engines throw on a reversed range.
      typeof formatter.formatRange === 'function' && start <= end
        ? plainSpaces(formatter.formatRange(start, end))
        : `${dates.format(start)} – ${dates.format(end)}`,
  }
  const optionLabel = (item: FilterValue) =>
    'options' in filter
      ? (filter.options.find((option) => sameFilterValue(option.value, item))?.label ??
        String(item))
      : String(item)
  switch (filter.type) {
    case 'custom':
      if (filter.format && value !== null) return filter.format(value)
      break
    case 'select':
      return optionLabel(value)
    case 'multi-select': {
      const items = Array.isArray(value) ? value.map(optionLabel) : [optionLabel(value)]
      const shown = items.slice(0, 2).join(', ')
      return items.length > 2 ? `${shown} ${labels.more(items.length - 2)}` : shown
    }
    case 'boolean':
      return value ? (filter.trueLabel ?? labels.yes) : (filter.falseLabel ?? labels.no)
  }
  if (value instanceof Date) return dates.format(value)
  if (isDateRange(value)) {
    const { start, end } = value
    if (start && end) return dates.formatRange(start, end)
    return start ? labels.from(dates.format(start)) : labels.until(dates.format(end as Date))
  }
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
