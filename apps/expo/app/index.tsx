import { Badge, Card, HStack, Text, VStack } from '@adv-ui/core'
import { categories, components } from '@adv-ui/core/meta'
import { appExamples } from '@adv-ui/examples/meta'
import { ChevronRightIcon, PaletteIcon, SmartphoneIcon } from '@adv-ui/icons'
import { Link, Stack } from 'expo-router'
import { ScrollView } from 'react-native'

function Row({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <HStack gap="$3" paddingVertical="$3" paddingHorizontal="$4" minHeight="$12">
      <VStack flex={1}>
        <Text weight="medium">{title}</Text>
        {subtitle ? (
          <Text size="sm" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </VStack>
      {badge ? (
        <Badge size="sm" variant="warning">
          {badge}
        </Badge>
      ) : null}
      <ChevronRightIcon size={18} color="$mutedForeground" />
    </HStack>
  )
}

export default function Home() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: 'Adv UI' }} />
      <VStack padding="$4" gap="$6" paddingBottom="$12">
        <VStack gap="$2">
          <Text size="3xl" weight="bold">
            Adv UI
          </Text>
          <Text tone="muted">The same components as the web docs, rendered natively.</Text>
        </VStack>

        <Link href="/theme" asChild>
          <Card interactive role="button" aria-label="Theme settings">
            <HStack gap="$3" padding="$4">
              <PaletteIcon color="$primary" />
              <VStack flex={1}>
                <Text weight="semibold">Theme</Text>
                <Text size="sm" tone="muted">
                  Presets and light / dark / system mode
                </Text>
              </VStack>
              <ChevronRightIcon size={18} color="$mutedForeground" />
            </HStack>
          </Card>
        </Link>

        <VStack gap="$2">
          <HStack gap="$2">
            <SmartphoneIcon size={16} color="$mutedForeground" />
            <Text size="sm" weight="semibold" tone="muted">
              APP EXAMPLES
            </Text>
          </HStack>
          <Card>
            {appExamples.map((example) => (
              <Link key={example.slug} href={`/examples/${example.slug}`} asChild>
                <Card.Content padding={0} role="button" aria-label={example.title}>
                  <Row title={example.title} subtitle={example.description} />
                </Card.Content>
              </Link>
            ))}
          </Card>
        </VStack>

        {categories
          .filter((category) => components.some((c) => c.category === category.id))
          .map((category) => (
            <VStack key={category.id} gap="$2">
              <Text size="sm" weight="semibold" tone="muted">
                {category.label.toUpperCase()}
              </Text>
              <Card>
                {components
                  .filter((c) => c.category === category.id)
                  .map((c) => (
                    <Link key={c.slug} href={`/components/${c.slug}`} asChild>
                      <Card.Content padding={0} role="button" aria-label={c.name}>
                        <Row
                          title={c.name}
                          subtitle={c.description}
                          badge={c.status === 'stable' ? undefined : c.status}
                        />
                      </Card.Content>
                    </Link>
                  ))}
              </Card>
            </VStack>
          ))}
      </VStack>
    </ScrollView>
  )
}
