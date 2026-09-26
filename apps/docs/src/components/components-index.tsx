'use client'

import type { CategoryMeta, ComponentMeta, RoadmapItem } from '@advui/core/meta'
import { Badge, Card, Grid, HStack, Input, Text, VStack } from '@advui/core'
import { SearchIcon } from '@advui/icons'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { View } from 'tamagui'
import { DocPage } from './docs-shell'
import { H2, PageHeader } from './prose'
import { StatusDot, statusMeta } from './sidebar'

type Summary = Pick<
  ComponentMeta,
  'slug' | 'name' | 'description' | 'category' | 'status' | 'platforms'
>

export function ComponentsIndex({
  categories,
  components,
  roadmap,
}: {
  categories: CategoryMeta[]
  components: Summary[]
  roadmap: RoadmapItem[]
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () => components.filter((c) => !q || `${c.name} ${c.description}`.toLowerCase().includes(q)),
    [components, q],
  )
  const plannedFiltered = roadmap.filter((r) => !q || r.name.toLowerCase().includes(q))

  return (
    <DocPage>
      <PageHeader
        title="Components"
        description={`${components.length} components available across web, iOS and Android — ${roadmap.length} more on the roadmap.`}
      >
        <HStack gap="$3" flexWrap="wrap">
          {(['stable', 'beta', 'experimental', 'planned'] as const).map((s) => (
            <HStack key={s} gap="$1.5">
              <StatusDot status={s} />
              <Text size="sm" tone="muted">
                {statusMeta[s].label}
              </Text>
            </HStack>
          ))}
        </HStack>
      </PageHeader>
      <HStack
        gap="$2"
        borderWidth={1}
        borderColor="$input"
        borderRadius="$md"
        paddingHorizontal="$3"
      >
        <SearchIcon size={16} color="$mutedForeground" />
        <Input
          flex={1}
          borderWidth={0}
          paddingHorizontal="$0"
          focusVisibleStyle={{ outlineWidth: 0 }}
          placeholder="Filter components…"
          aria-label="Filter components"
          value={query}
          onChangeText={setQuery}
        />
      </HStack>
      {categories.map((category) => {
        const items = filtered.filter((c) => c.category === category.id)
        const planned = plannedFiltered.filter((r) => r.category === category.id)
        if (!items.length && !planned.length) return null
        return (
          <VStack key={category.id} gap="$3">
            <H2 id={category.id}>{category.label}</H2>
            <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="$3">
              {items.map((c) => (
                <Link key={c.slug} href={`/docs/components/${c.slug}`} className="plain-link">
                  <Card interactive height="100%">
                    <Card.Header>
                      <HStack justifyContent="space-between">
                        <Card.Title size="base">{c.name}</Card.Title>
                        {c.status !== 'stable' ? (
                          <Badge size="sm" variant={c.status === 'beta' ? 'warning' : 'info'}>
                            {statusMeta[c.status].label}
                          </Badge>
                        ) : null}
                      </HStack>
                    </Card.Header>
                    <Card.Content paddingTop="$2">
                      <Text size="sm" tone="muted">
                        {c.description}
                      </Text>
                    </Card.Content>
                  </Card>
                </Link>
              ))}
              {planned.map((r) => (
                <Link key={r.slug} href={`/docs/components/${r.slug}`} className="plain-link">
                  <View
                    height="100%"
                    borderWidth={1}
                    borderStyle="dashed"
                    borderColor="$border"
                    borderRadius="$xl"
                    padding="$4"
                    gap="$1"
                    hoverStyle={{ borderColor: '$borderStrong' }}
                  >
                    <Text weight="medium" tone="muted">
                      {r.name}
                    </Text>
                    <Text size="xs" tone="muted">
                      Planned · phase {r.phase}
                    </Text>
                  </View>
                </Link>
              ))}
            </Grid>
          </VStack>
        )
      })}
    </DocPage>
  )
}
