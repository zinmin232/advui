import { Text } from '@advui/core'
import { getAppExample } from '@advui/examples'
import { Stack, useLocalSearchParams } from 'expo-router'
import { ScreenScrollView } from '../../ScreenScrollView'

export default function ExampleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const example = getAppExample(slug)
  if (!example) return <Text padding="4">Unknown example “{slug}”.</Text>
  const { Component } = example
  return (
    <ScreenScrollView>
      <Stack.Screen options={{ title: example.title }} />
      <Component />
    </ScreenScrollView>
  )
}
