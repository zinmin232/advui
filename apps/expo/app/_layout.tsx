import { UniversalProvider, setFilePicker, useColorMode, useTheme } from '@advui/core'
import * as DocumentPicker from 'expo-document-picker'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { registerMedia } from '../media'
import { config } from '../tamagui.config'

// File Upload and File Dropzone use the app's picker on iOS and Android.
setFilePicker(async ({ multiple, accept }) => {
  // The picker filters by MIME type; extensions (".pdf") are checked after picking.
  const mimeTypes = accept?.split(',').filter((rule) => rule.includes('/'))
  const result = await DocumentPicker.getDocumentAsync({
    multiple,
    type: mimeTypes?.length ? mimeTypes.map((rule) => rule.trim()) : '*/*',
  })
  if (result.canceled) return null
  return result.assets.map((asset) => ({
    name: asset.name,
    size: asset.size,
    type: asset.mimeType,
    uri: asset.uri,
  }))
})

// Video and Audio Player use expo-video and expo-audio on iOS and Android.
registerMedia()

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
