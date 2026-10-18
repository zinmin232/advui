import { UniversalProvider, setClipboard, setFilePicker, useColorMode, useTheme } from '@advui/core'
import * as Clipboard from 'expo-clipboard'
import * as DocumentPicker from 'expo-document-picker'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { registerMedia } from '../media'
import { config } from '../tamagui.config'

// File Upload and File Dropzone use the app's picker on iOS and Android.
setFilePicker(async ({ multiple, accept }) => {
  // The picker filters by MIME type only. Extensions (".pdf") are checked
  // after picking, so a list with one opens the picker unfiltered: filtering
  // by the rest ("image/*,.pdf") would hide the PDFs.
  const rules = accept?.split(',').map((rule) => rule.trim()) ?? []
  const result = await DocumentPicker.getDocumentAsync({
    multiple,
    type: rules.length && rules.every((rule) => rule.includes('/')) ? rules : '*/*',
  })
  if (result.canceled) return null
  return result.assets.map((asset) => ({
    name: asset.name,
    size: asset.size,
    type: asset.mimeType,
    uri: asset.uri,
  }))
})

// Copy Button and Code Block copy with expo-clipboard on iOS and Android.
setClipboard(Clipboard.setStringAsync)

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
