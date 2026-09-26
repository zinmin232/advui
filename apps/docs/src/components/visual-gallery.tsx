'use client'

import { Text, VStack } from '@adv-ui/core'
import { View } from 'tamagui'
import { ExampleRenderer } from './component-preview'

export function VisualGallery({
  items,
}: {
  items: Array<{ slug: string; name: string; title: string }>
}) {
  return (
    <VStack
      render="main"
      id="main"
      padding="$4"
      gap="$4"
      backgroundColor="$background"
      minHeight="100vh"
    >
      {items.map((item) => (
        <VStack
          key={`${item.slug}-${item.name}`}
          gap="$2"
          data-visual={`${item.slug}--${item.name}`}
          testID={`${item.slug}--${item.name}`}
        >
          <Text size="xs" tone="muted" mono>
            {item.title}
          </Text>
          <View
            padding="$4"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$lg"
            alignItems="flex-start"
          >
            <ExampleRenderer slug={item.slug} name={item.name} />
          </View>
        </VStack>
      ))}
    </VStack>
  )
}
