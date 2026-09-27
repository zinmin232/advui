import type { ReactNode } from 'react'
import type { ColorTokens, GetProps, View } from 'tamagui'

type PressHandler = GetProps<typeof View>['onPressIn']

export interface RippleOptions {
  /** Color of the content on the surface, e.g. `$primaryForeground`. */
  color: ColorTokens
  /** No ripple, e.g. while disabled or when the element is not pressable. */
  disabled?: boolean
  /** Your own handlers. They still run. */
  onPressIn?: PressHandler
  onPressOut?: PressHandler
}

export interface Ripple {
  /**
   * The ripple replaces the pressed style, so drop your `pressStyle`
   * background while this is true. It is clipped inside the border, so drop
   * a transparent border too.
   */
  active: boolean
  /** Spread on the pressable element, after its other props. */
  props: { overflow?: 'hidden'; onPressIn?: PressHandler; onPressOut?: PressHandler }
  /** Render as the first child of the pressable element. */
  element: ReactNode
}

/**
 * The Android press ripple for your own pressables, drawn when the config has
 * `androidRipple` (as `material()` does). On web and iOS it does nothing.
 *
 * @example
 * const ripple = useRipple({ color: '$foreground', onPressIn, onPressOut })
 * <View onPress={open} {...ripple.props}>
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
