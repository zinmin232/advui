import { UniversalProvider, setRouter, useColorMode, useTheme } from '@advui/core'
import { BarChartIcon, HomeIcon, type IconComponent, SettingsIcon } from '@advui/icons'
import { Tabs, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { config } from '../tamagui.config'

// A path in href (Link, Sidebar, Menu…) opens that screen on iOS and Android.
setRouter(router)

/** Status bar icons follow the app's color mode (which may differ from the OS setting). */
function ThemedStatusBar() {
  const { resolvedColorMode } = useColorMode()
  return <StatusBar style={resolvedColorMode === 'dark' ? 'light' : 'dark'} />
}

/** A tab's icon, in the same theme colors as its label. */
const tabIcon =
  (Icon: IconComponent) =>
  ({ focused, size }: { focused: boolean; size: number }) => (
    <Icon color={focused ? 'primaryText' : 'mutedForeground'} size={size} />
  )

/** Expo Router's tabs and headers, in the theme's colors. */
function ThemedTabs() {
  const theme = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background.val },
        headerTintColor: theme.foreground.val,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: theme.background.val },
        tabBarStyle: { backgroundColor: theme.background.val, borderTopColor: theme.border.val },
        tabBarActiveTintColor: theme.primaryText.val,
        tabBarInactiveTintColor: theme.mutedForeground.val,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon(HomeIcon) }} />
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Dashboard', tabBarIcon: tabIcon(BarChartIcon) }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabIcon(SettingsIcon) }}
      />
    </Tabs>
  )
}

/** Reads safe-area insets, so it must render inside `SafeAreaProvider`. */
function Providers() {
  const insets = useSafeAreaInsets()
  return (
    <UniversalProvider config={config} insets={insets} toaster={{ position: 'bottom-center' }}>
      <ThemedStatusBar />
      <ThemedTabs />
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
