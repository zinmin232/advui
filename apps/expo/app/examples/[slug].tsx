import { Text } from '@advui/core'
import { getAppExample } from '@advui/examples'
import { Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenScrollView } from '../../ScreenScrollView'

export default function ExampleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const example = getAppExample(slug)
  const insets = useSafeAreaInsets()
  if (!example) return <Text padding="4">Unknown example “{slug}”.</Text>
  const { Component } = example
  if (example.fill) {
    return (
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>
        <Stack.Screen options={{ title: example.title }} />
        <Component />
      </View>
    )
  }
  return (
    <ScreenScrollView>
      <Stack.Screen options={{ title: example.title }} />
      <Component />
    </ScreenScrollView>
  )
}
