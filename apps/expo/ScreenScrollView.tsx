import { useHeaderHeight } from 'expo-router/react-navigation'
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from 'react-native'

/**
 * A screen's scrolling content that keeps the focused field above the keyboard.
 *
 * iOS insets the scroll view by the keyboard and scrolls the focused text
 * input into view (`automaticallyAdjustKeyboardInsets`). On Android the app
 * draws edge-to-edge, so the window no longer resizes for the keyboard: a
 * KeyboardAvoidingView pads the screen instead, and Android's
 * ScrollView scrolls its focused view (a text field or a WebView) into the
 * shorter viewport. Its offset is the header, as it measures itself from the
 * top of the screen's content while the keyboard reports a window position.
 */
export function ScreenScrollView(props: ScrollViewProps) {
  const headerHeight = useHeaderHeight()
  const scrollView = (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  )
  if (Platform.OS !== 'android') return scrollView
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}
    >
      {scrollView}
    </KeyboardAvoidingView>
  )
}
