import { type GetProps, type TamaguiComponent, View, styled } from 'tamagui/unstyled'
import { type Responsive, responsiveStyle } from '../../utils/responsive'

/** The base layout primitive — a `View` that accepts every style prop and token. */
export const Box = styled(View, {
  displayName: 'Box',
})

export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackDistribute = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

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

/**
 * `direction`, `wrap`, `align` and `distribute`, each a value or a mobile-first
 * map. `styled.dynamic` keeps `styled(Stack, …)` working, and responsive maps
 * become conditional values, which compile to CSS media queries on web. Raw
 * style props (`flexDirection`, `items`, `"column md:row"`) are call-site
 * props, which Tamagui 3 applies above variants, so they win when both set
 * the same style.
 */
function flexVariants() {
  return {
    // The type argument, not an annotated parameter, keeps Tamagui's variant inference.
    direction: styled.dynamic<Responsive<StackDirection>>((value) =>
      textDirections.has(value as string)
        ? { direction: value }
        : responsiveStyle('flexDirection', value),
    ),
    wrap: styled.dynamic<Responsive<StackWrap>>((value) => responsiveStyle('flexWrap', value)),
    align: styled.dynamic<Responsive<StackAlign>>((value) =>
      responsiveStyle('alignItems', value, alignValues),
    ),
    distribute: styled.dynamic<Responsive<StackDistribute>>((value) =>
      responsiveStyle('justifyContent', value, distributeValues),
    ),
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
  displayName: 'Stack',
  flexDirection: 'column',
  variants: flexVariants(),
})

/**
 * Flex container (column by default). Lay it out with `direction`, `wrap`,
 * `align` and `distribute`, each a value or a map such as
 * `{ base: 'column', md: 'row' }`, or with the regular style props
 * (`flexDirection`, `alignItems`, `"column md:row"`, `items`…), which win when both
 * set the same style.
 */
export const Stack = StackFrame as WithoutDirectionStyle<typeof StackFrame>

/** Horizontal stack. Use `gap="2"` for spacing. */
export const HStack = styled(Stack, {
  displayName: 'HStack',
  flexDirection: 'row',
  alignItems: 'center',
  variants: flexVariants(),
})

/** Vertical stack. Use `gap="2"` for spacing. */
export const VStack = styled(Stack, {
  displayName: 'VStack',
  flexDirection: 'column',
})

/** A row that wraps onto new lines, for chips, tags and badges. */
export const Wrap = styled(Stack, {
  displayName: 'Wrap',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '2',
  variants: flexVariants(),
})

/** Centers its children on both axes. */
export const Center = styled(View, {
  displayName: 'Center',
  alignItems: 'center',
  justifyContent: 'center',
})

/** Flexible space that pushes siblings apart inside a stack. */
export const Spacer = styled(View, {
  displayName: 'Spacer',
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
