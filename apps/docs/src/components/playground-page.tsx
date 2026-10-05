'use client'

import type { ComponentMeta } from '@advui/catalog'
import { Card, HStack, Text, VStack } from '@advui/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { View } from 'tamagui'
import { CustomizerControls, Segmented } from './customizer-panel'
import { Playground } from './playground'
import { SiteHeader } from './site-header'

type Playable = Pick<ComponentMeta, 'slug' | 'name' | 'playground'>

export function PlaygroundPage({ components }: { components: Playable[] }) {
  const params = useSearchParams()
  const router = useRouter()
  const requested = params.get('component')
  const selected = components.find((c) => c.playground?.component === requested) ?? components[0]!
  const spec = selected.playground!
  const initial = Object.fromEntries(
    spec.controls
      .filter((c) => params.has(c.prop))
      .map((c) => {
        const raw = params.get(c.prop)!
        return [
          c.prop,
          c.type === 'boolean' ? raw === 'true' : c.type === 'number' ? Number(raw) : raw,
        ]
      }),
  )

  return (
    <View minHeight="100vh" backgroundColor="$background">
      <SiteHeader />
      <VStack
        render="main"
        id="main"
        gap="$6"
        padding="$4"
        maxWidth={1440}
        marginHorizontal="auto"
        width="100%"
        $md={{ padding: '$8' }}
      >
        <VStack gap="$2">
          <Text render="h1" size="4xl" weight="bold" margin={0}>
            Playground
          </Text>
          <Text size="lg" tone="muted">
            Explore props and theme together, then copy the JSX and theme config.
          </Text>
        </VStack>
        <Segmented
          label="Component"
          value={spec.component}
          options={components.map((c) => ({ value: c.playground!.component, label: c.name }))}
          onChange={(component) => router.replace(`/playground?component=${component}`)}
        />
        <View gap="$6" $xl={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* flex only beside the theme card; in a column its 0px basis collapses it. */}
          <View minWidth={0} $xl={{ flex: 1 }}>
            {/* key resets state when switching components */}
            <Playground key={spec.component} spec={spec} initial={initial} showOpenLink={false} />
          </View>
          <Card width="100%" $xl={{ width: '$96' }}>
            <Card.Header>
              <Card.Title>Theme</Card.Title>
              <Card.Description>Preset, colors, radius, font size and mode.</Card.Description>
            </Card.Header>
            <Card.Content>
              <CustomizerControls compact />
            </Card.Content>
          </Card>
        </View>
        <HStack>
          <Text size="sm" tone="muted">
            Tip: every component page embeds this playground; “Open in Playground” carries your
            props here.
          </Text>
        </HStack>
      </VStack>
    </View>
  )
}
