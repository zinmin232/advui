import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { useModalLayerOpen } from '../hooks/modalLayer'

/**
 * Native: the app below the portals. While a dialog, sheet or drawer is open
 * it is hidden from TalkBack and VoiceOver, which otherwise move on to the
 * screen behind the overlay (Tamagui's portal host is a sibling of this view,
 * so the overlay stays readable).
 */
export function AppLayer({ children }: { children: ReactNode }) {
  const hidden = useModalLayerOpen()
  return (
    <View
      style={styles.fill}
      importantForAccessibility={hidden ? 'no-hide-descendants' : 'auto'}
      accessibilityElementsHidden={hidden}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({ fill: { flex: 1 } })
