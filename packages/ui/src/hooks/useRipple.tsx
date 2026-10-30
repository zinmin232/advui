import type { ReactNode } from 'react'
import type { ColorTokens, GetProps, View } from 'tamagui/unstyled'

type ViewProps = GetProps<typeof View>
type PressHandler = ViewProps['onPressIn']

/** The corner props the ripple reads from `radius`. */
export type RippleRadiusKey =
  | 'borderRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomLeftRadius'
  | 'borderTopStartRadius'
  | 'borderTopEndRadius'
  | 'borderBottomStartRadius'
  | 'borderBottomEndRadius'

export type RippleRadius = ViewProps['borderRadius'] | Pick<ViewProps, RippleRadiusKey>

export interface RippleOptions {
  /** Color of the content on the surface, e.g. `primaryForeground`. */
  color: ColorTokens
  /**
   * The pressable's corners, which the ripple stays inside: a radius such as
   * `md`, or props that set them (`borderRadius`, `borderTopLeftRadius`…).
   * Other keys are ignored, so you can pass the element's own props. Square
   * when omitted.
   */
  radius?: RippleRadius
  /** No ripple, e.g. while disabled or when the element is not pressable. */
  disabled?: boolean
  /** Your own handlers. They still run. */
  onPressIn?: PressHandler
  onPressOut?: PressHandler
}

export interface Ripple {
  /**
   * The ripple replaces the pressed style, so drop your `press:`
   * background while this is true. It is drawn inside the border, so drop
   * a transparent border too.
   */
  active: boolean
  /** Spread on the pressable element, after its other props. */
  props: { onPressIn?: PressHandler; onPressOut?: PressHandler }
  /**
   * Render as the first child of the pressable element. It clips only
   * itself, so other children can still overflow the element's edge.
   */
  element: ReactNode
}

/**
 * The Android press ripple for your own pressables, drawn when the config has
 * `androidRipple` (as `material()` does). On web and iOS it does nothing.
 *
 * @example
 * const ripple = useRipple({ color: 'foreground', radius: 'md', onPressIn, onPressOut })
 * <View borderRadius="md" onPress={open} {...ripple.props}>
 *   {ripple.element}
 *   <Text>Inbox</Text>
 * </View>
 */
export function useRipple({ onPressIn, onPressOut }: RippleOptions): Ripple {
  return {
    active: false,
    props: { ...(onPressIn && { onPressIn }), ...(onPressOut && { onPressOut }) },
    element: null,
  }
}
