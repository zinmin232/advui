import { Badge, Card, HStack, Text, VStack } from '@advui/core'
import { examples } from '@advui/catalog/examples'
import { getComponent } from '@advui/catalog'
import { Stack, useLocalSearchParams } from 'expo-router'
import { ScrollView } from 'react-native'

/** Renders every documented example of a component — the native counterpart of a docs page. */
export default function ComponentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const meta = getComponent(slug)
  if (!meta) return <Text padding="$4">Unknown component “{slug}”.</Text>
  const componentExamples = examples[meta.slug] ?? {}

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: meta.name }} />
      <VStack padding="$4" gap="$5" paddingBottom="$12">
        <VStack gap="$2">
          <Text tone="muted">{meta.description}</Text>
          <HStack gap="$1.5">
            <Badge size="sm" variant={meta.status === 'stable' ? 'success' : 'warning'}>
              {meta.status}
            </Badge>
            {meta.platforms.map((p) => (
              <Badge key={p} size="sm" variant="secondary">
                {p}
              </Badge>
            ))}
          </HStack>
          {!meta.platforms.includes('ios') ? (
            <Text size="sm" tone="warning">
              Not rendered on touch platforms — see the platform notes in the docs.
            </Text>
          ) : null}
        </VStack>
        {meta.examples.map((example) => {
          const Example = componentExamples[example.name]
          return (
            <VStack key={example.name} gap="$2">
              <Text weight="semibold">{example.title}</Text>
              {example.description ? (
                <Text size="sm" tone="muted">
                  {example.description}
                </Text>
              ) : null}
              <Card>
                <Card.Content>{Example ? <Example /> : null}</Card.Content>
              </Card>
            </VStack>
          )
        })}
      </VStack>
    </ScrollView>
  )
}
