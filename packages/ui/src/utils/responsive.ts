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

type MediaKey = `$${Breakpoint}`

/** Style props for one property: the base value plus a media prop per breakpoint. */
export type ResponsiveStyle<P extends string, V> = Partial<Record<P, V>> &
  Partial<Record<MediaKey, Partial<Record<P, V>>>>

/**
 * Style props for a responsive value, mobile-first:
 * `responsiveStyle('flexDirection', { base: 'column', md: 'row' })` →
 * `{ flexDirection: 'column', $md: { flexDirection: 'row' } }`. Only the
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
  const style: Record<string, unknown> = {}
  for (const key of ['base', ...breakpointKeys] as const) {
    const given = responsiveValue(value, key)
    if (given === undefined) continue
    if (key === 'base') style[prop] = convert(given)
    else style[`$${key}`] = { [prop]: convert(given) }
  }
  return style as ResponsiveStyle<P, V>
}
