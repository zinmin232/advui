import { shorthands } from '@advui/theme'
import { type GetProps, type TamaguiComponent, View, styled } from 'tamagui'
import { type Responsive, breakpointKeys, responsiveStyle } from '../../utils/responsive'

/** The base layout primitive — a `View` that accepts every style prop and token. */
export const Box = styled(View, {
  name: 'Box',
})

export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackDistribute = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

type FlexKey = 'flexDirection' | 'flexWrap' | 'alignItems' | 'justifyContent'
type FlexDefaults = Partial<Record<FlexKey, string>>
type StyleProps = Record<string, unknown>

const alignValues = { start: 'flex-start', end: 'flex-end' } as const
// Before 0.9.0 `direction` was React Native's text-direction style; those
// values still set it, so existing `direction="rtl"` keeps working.
const textDirections = new Set(['ltr', 'rtl', 'inherit'])
const distributeValues = {
  start: 'flex-start',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const

/** Every prop name that sets a flex key: the key and its shorthands, such as `items`. */
const propNames = (key: FlexKey) => [
  key,
  ...Object.entries(shorthands)
    .filter(([, longhand]) => longhand === key)
    .map(([shorthand]) => shorthand),
]

/**
 * The style for one responsive flex prop, minus what the raw style props set:
 * `flexDirection` (or its shorthand) wins at the base, and `$md={{ … }}` wins
 * at md. A variant can't tell a raw prop from the component's own default
 * (both are in `props`), so a raw value equal to that default doesn't count.
 * Dropping the overlap, rather than relying on prop order, keeps web and
 * native the same: a repeated media style wins last on web but first on native.
 */
function flexStyle<T extends string>(
  key: FlexKey,
  value: Responsive<T> | undefined,
  props: StyleProps,
  defaults: FlexDefaults,
  map?: Partial<Record<T, string>>,
) {
  const style: StyleProps = responsiveStyle(key, value, map)
  const names = propNames(key)
  const raw = names.map((name) => props[name]).find((v) => v !== undefined)
  if (raw !== undefined && raw !== defaults[key]) delete style[key]
  for (const breakpoint of breakpointKeys) {
    const media = props[`$${breakpoint}`] as StyleProps | undefined
    if (media && names.some((name) => media[name] !== undefined)) delete style[`$${breakpoint}`]
  }
  return style
}

/**
 * `direction`, `wrap`, `align` and `distribute`, each a value or a mobile-first
 * map. Function variants keep `styled(Stack, …)` working and compile media
 * props to CSS media queries on web. `defaults` are the component's own base
 * styles, so its default is not mistaken for a raw prop.
 */
function flexVariants(defaults: FlexDefaults) {
  return {
    direction: (value: Responsive<StackDirection>, { props }: { props: StyleProps }) =>
      textDirections.has(value as string)
        ? { direction: value }
        : flexStyle('flexDirection', value, props, defaults),
    wrap: (value: Responsive<StackWrap>, { props }: { props: StyleProps }) =>
      flexStyle('flexWrap', value, props, defaults),
    align: (value: Responsive<StackAlign>, { props }: { props: StyleProps }) =>
      flexStyle('alignItems', value, props, defaults, alignValues),
    distribute: (value: Responsive<StackDistribute>, { props }: { props: StyleProps }) =>
      flexStyle('justifyContent', value, props, defaults, distributeValues),
  } as const
}

/**
 * React Native's `direction` style (ltr / rtl) has the same name as the
 * `direction` prop, so its type would intersect with the prop's. The prop
 * replaces it, as in Chakra; right-to-left layout comes from the app's
 * `I18nManager` or the page's `dir`, not from a style.
 */
type WithoutDirectionStyle<C> = C extends {
  __tama: [infer P, infer R, infer N, infer B extends object, infer V, infer S]
}
  ? TamaguiComponent<P, R, N, Omit<B, 'direction'>, V, S>
  : never

const StackFrame = styled(View, {
  name: 'Stack',
  flexDirection: 'column',
  variants: flexVariants({ flexDirection: 'column' }),
})

/**
 * Flex container (column by default). Lay it out with `direction`, `wrap`,
 * `align` and `distribute`, each a value or a map such as
 * `{ base: 'column', md: 'row' }`, or with the regular style props
 * (`flexDirection`, `alignItems`, `$md={{ … }}`, `items`…), which win when both
 * set the same style.
 */
export const Stack = StackFrame as WithoutDirectionStyle<typeof StackFrame>

/** Horizontal stack. Use `gap="$2"` for spacing. */
export const HStack = styled(Stack, {
  name: 'HStack',
  flexDirection: 'row',
  alignItems: 'center',
  variants: flexVariants({ flexDirection: 'row', alignItems: 'center' }),
})

/** Vertical stack. Use `gap="$2"` for spacing. */
export const VStack = styled(Stack, {
  name: 'VStack',
  flexDirection: 'column',
})

/** A row that wraps onto new lines, for chips, tags and badges. */
export const Wrap = styled(Stack, {
  name: 'Wrap',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '$2',
  variants: flexVariants({ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }),
})

/** Centers its children on both axes. */
export const Center = styled(View, {
  name: 'Center',
  alignItems: 'center',
  justifyContent: 'center',
})

/** Flexible space that pushes siblings apart inside a stack. */
export const Spacer = styled(View, {
  name: 'Spacer',
  flex: 1,
  alignSelf: 'stretch',
  'aria-hidden': true,
})

export type BoxProps = GetProps<typeof Box>
export type StackProps = GetProps<typeof Stack>
export type HStackProps = GetProps<typeof HStack>
export type VStackProps = GetProps<typeof VStack>
export type WrapProps = GetProps<typeof Wrap>
export type CenterProps = GetProps<typeof Center>
export type SpacerProps = GetProps<typeof Spacer>
