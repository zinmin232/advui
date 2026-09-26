import { UniversalProvider, useColorMode, useTheme } from '@adv-ui/core'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { config } from '../tamagui.config'

/** Status bar icons follow the app's color mode (which may differ from the OS setting). */
function ThemedStatusBar() {
  const { resolvedColorMode } = useColorMode()
  return <StatusBar style={resolvedColorMode === 'dark' ? 'light' : 'dark'} />
}

function ThemedStack() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background.val },
        headerTintColor: theme.foreground.val,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background.val },
      }}
    />
  )
}

/** Reads safe-area insets, so it must render inside `SafeAreaProvider`. */
function Providers() {
  const insets = useSafeAreaInsets()
  return (
    <UniversalProvider config={config} insets={insets} toaster={{ position: 'bottom-center' }}>
      <ThemedStatusBar />
      <ThemedStack />
    </UniversalProvider>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Providers />
    </SafeAreaProvider>
  )
}
