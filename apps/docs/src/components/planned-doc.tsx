'use client'

import type { RoadmapItem } from '@advui/catalog'
import { Alert, Button, Text } from '@advui/core'
import { siteConfig } from '../lib/site'
import { Breadcrumbs, DocPage } from './docs-shell'
import { PageHeader } from './prose'

export function PlannedDoc({ item, categoryLabel }: { item: RoadmapItem; categoryLabel: string }) {
  return (
    <DocPage>
      <Breadcrumbs
        items={[
          { title: 'Docs', href: '/docs/introduction' },
          { title: 'Components', href: '/docs/components' },
          { title: categoryLabel },
          { title: item.name },
        ]}
      />
      <PageHeader
        title={item.name}
        description={`${item.name} is on the roadmap for phase ${item.phase}.`}
      />
      <Alert variant="info">
        <Alert.Title>Not available yet</Alert.Title>
        <Alert.Description>
          This component is planned but not implemented. Components ship only when they meet the
          full definition of done: web + iOS + Android, light/dark, accessibility, tests, docs and a
          registry entry.
        </Alert.Description>
      </Alert>
      <Text tone="muted">
        Want it sooner? Scaffold it with <Text mono>pnpm create-component {item.slug}</Text> and
        follow the component guidelines.
      </Text>
      <Button
        alignSelf="flex-start"
        variant="outline"
        render={
          <a
            href={`${siteConfig.github}/blob/${siteConfig.githubBranch}/COMPONENT_GUIDELINES.md`}
          />
        }
      >
        Read the component guidelines
      </Button>
    </DocPage>
  )
}
