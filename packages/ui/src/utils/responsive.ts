import type { breakpoints as themeBreakpoints } from '@advui/theme'

/** A min-width breakpoint from `@advui/theme`: `xs` 460 … `xxl` 1536. */
export type Breakpoint = keyof typeof themeBreakpoints

/** The breakpoints, smallest first: the order a mobile-first value cascades in. */
export const breakpointKeys: readonly Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

/** A responsive map: a value for phones (`base`) and from each breakpoint up. */
export type ResponsiveMap<T> = { base?: T } & Partial<Record<Breakpoint, T>>

/** A value, or a mobile-first map such as `{ base: 'column', md: 'row' }`. */
export type Responsive<T> = T | ResponsiveMap<T>

/**
 * True for a map such as `{ base: 1, md: 2 }`, false for a plain value.
 * Responsive values are strings, numbers or booleans, so any object is a map.
 */
export function isResponsiveMap<T>(value: Responsive<T> | undefined): value is ResponsiveMap<T> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The value given for exactly this key: a plain value counts as `base`. */
export function responsiveValue<T>(
  value: Responsive<T> | undefined,
  key: 'base' | Breakpoint,
): T | undefined {
  if (isResponsiveMap(value)) return value[key]
  return key === 'base' ? (value as T | undefined) : undefined
}

/**
 * The value that applies at a breakpoint (`'base'` below `xs`): the nearest
 * one given at or below it, mobile-first. `undefined` when none is.
 */
export function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  at: 'base' | Breakpoint,
): T | undefined {
  let current = responsiveValue(value, 'base')
  if (at === 'base') return current
  for (const key of breakpointKeys) {
    current = responsiveValue(value, key) ?? current
    if (key === at) break
  }
  return current
}

/** Turns a value into the one the style needs, such as `'start'` → `'flex-start'`. */
export type ValueMap<T, V> = ((value: T) => V) | Partial<Record<T & PropertyKey, V>>

/**
 * A Tamagui 3 conditional style value: `default` below the first breakpoint,
 * then one entry per media key. Later keys win, so breakpoints go smallest
 * first.
 */
export type ConditionalValue<V> = { default?: V } & Partial<Record<Breakpoint, V>>

/** Style props for one property: a plain value, or a conditional value. */
export type ResponsiveStyle<P extends string, V> = Partial<Record<P, V | ConditionalValue<V>>>

/**
 * Style props for a responsive value, mobile-first:
 * `responsiveStyle('flexDirection', { base: 'column', md: 'row' })` →
 * `{ flexDirection: { default: 'column', md: 'row' } }`. Only the
 * breakpoints given are emitted (a map without `base` has no base value), so
 * on web they compile to plain CSS media queries. `map` converts each value.
 */
export function responsiveStyle<P extends string, T, V = T>(
  prop: P,
  value: Responsive<T> | undefined,
  map?: ValueMap<T, V>,
): ResponsiveStyle<P, V> {
  const convert = (input: T): V => {
    if (typeof map === 'function') return map(input)
    const mapped = map?.[input as T & PropertyKey]
    return (mapped === undefined ? input : mapped) as V
  }
  const conditional: Record<string, V> = {}
  let hasBreakpoint = false
  for (const key of ['base', ...breakpointKeys] as const) {
    const given = responsiveValue(value, key)
    if (given === undefined) continue
    conditional[key === 'base' ? 'default' : key] = convert(given)
    if (key !== 'base') hasBreakpoint = true
  }
  if (!hasBreakpoint && 'default' in conditional) {
    return { [prop]: conditional.default } as ResponsiveStyle<P, V>
  }
  return (Object.keys(conditional).length ? { [prop]: conditional } : {}) as ResponsiveStyle<P, V>
}

/**
 * Merges style props whose values may be conditional, key by key, so two
 * helpers that set the same property under different conditions both apply.
 * A plain value followed by a conditional one without `default` becomes its
 * `default`; a later plain value replaces the property.
 */
export function mergeResponsiveStyles(
  ...styles: (Record<string, unknown> | undefined | null | false)[]
): Record<string, unknown> {
  const merged: Record<string, unknown> = {}
  for (const style of styles) {
    if (!style) continue
    for (const [prop, value] of Object.entries(style)) {
      const previous = merged[prop]
      if (isConditional(value) && isConditional(previous)) {
        merged[prop] = { ...previous, ...value }
      } else if (isConditional(value) && previous !== undefined && !('default' in value)) {
        merged[prop] = { default: previous, ...value }
      } else {
        merged[prop] = value
      }
    }
  }
  return merged
}

/**
 * A style object that applies only under one condition — a media query
 * (`max-xs`) or a state (`hover`, `press`, `focus-visible`) — as conditional
 * values: `when('hover', { opacity: 1 })` → `{ opacity: { hover: 1 } }`.
 * Merge it with the base style through `mergeResponsiveStyles` so the base
 * values stay in place.
 */
export function when(condition: string, style: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(style).map(([prop, value]) => [prop, { [condition]: value }]),
  )
}

/**
 * A flat style value from parts, skipping the empty ones:
 * `flatValue('transparent', !disabled && 'hover:muted')` → `'transparent hover:muted'`.
 */
export function flatValue(...parts: (string | false | null | undefined)[]): FlatString | undefined {
  const value = parts.filter(Boolean).join(' ')
  return (value || undefined) as FlatString | undefined
}

/**
 * The string shape Tamagui's style props take beyond a single token: a base
 * and clauses (`'a hover:b'`) or a clause alone (`'hover:b'`).
 */
export type FlatString = `${string} ${string}` | `${string}:${string}`

// A `{ width, height }` shadow offset is a structured value, not conditions.
function isConditional(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !('width' in value) &&
    !('height' in value)
  )
}
