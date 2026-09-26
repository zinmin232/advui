import { Text } from '@advui/core'
import { getAppExample } from '@advui/examples'
import { Stack, useLocalSearchParams } from 'expo-router'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

export default function ExampleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const example = getAppExample(slug)
  if (!example) return <Text padding="$4">Unknown example “{slug}”.</Text>
  const { Component } = example
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: example.title }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
        <Component />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
