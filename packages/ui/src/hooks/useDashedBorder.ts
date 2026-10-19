import type { ViewStyle } from 'react-native'

/**
 * The style that keeps a rounded dashed border dashed on native (see
 * `useDashedBorder.native.ts`). Web needs none: its border is already dashed.
 */
export function useDashedBorder(_color: `$${string}` | null): ViewStyle | undefined {
  return undefined
}
