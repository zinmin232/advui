import { Dimensions } from 'react-native'
import { getTokenValue, useConfiguration, useWindowDimensions } from 'tamagui'

/**
 * The tallest a bottom sheet's frame may be. Tamagui grows a `fit` sheet to
 * its content, up to the whole screen, so a long menu or list (or a short one
 * on a phone in landscape) slid under the status bar. Capped at the screen less
 * the top inset (from UniversalProvider) and room for the handle, the sheet's
 * ScrollView scrolls instead. Call it in the component that renders the Sheet:
 * the frame itself renders in a portal, which drops context.
 */
export function useSheetMaxHeight(): number | undefined {
  // Re-renders when the phone turns. The sheet covers the screen, while the
  // window can leave out the system bars, so the screen is what it is measured
  // against (as Tamagui does).
  useWindowDimensions()
  const top = useConfiguration().insets?.top ?? 0
  return Dimensions.get('screen').height - top - (getTokenValue('8', 'space') as number)
}
