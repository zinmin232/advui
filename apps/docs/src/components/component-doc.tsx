'use client'

import type { ComponentMeta, Platform, PartDoc } from '@advui/catalog'
import { Badge, Button, Card, Grid, HStack, Tabs, Text, VStack } from '@advui/core'
import { ExternalLinkIcon, GlobeIcon, SmartphoneIcon } from '@advui/icons'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { View } from 'tamagui'
import { CodeBlock } from './code-block'
import { ComponentPreview } from './component-preview'
import { Breadcrumbs, DocPage, PrevNext, type TocItem } from './docs-shell'
import { Playground } from './playground'
import { C, H2, LI, P, PageHeader, UL } from './prose'
import { statusMeta } from './sidebar'

export interface HighlightedCode {
  code: string
  html: string
}

export interface ComponentDocData {
  meta: ComponentMeta
  categoryLabel: string
  usage: HighlightedCode
  install: { pnpm: HighlightedCode; npm: HighlightedCode; cli: HighlightedCode }
  examples: Array<{ name: string; title: string; description?: string } & HighlightedCode>
  registryDependencies: string[]
  dependencies: string[]
  related: Array<{ slug: string; name: string; planned: boolean }>
  lastUpdated: string
  editUrl: string
  sourceUrl: string
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
}

const platformLabel: Record<Platform, string> = { web: 'Web', ios: 'iOS', android: 'Android' }

export function PlatformBadges({ platforms }: { platforms: Platform[] }) {
  return (
    <HStack gap="$1.5" flexWrap="wrap" role="list" aria-label="Supported platforms">
      {(['web', 'ios', 'android'] as const).map((p) => {
        const supported = platforms.includes(p)
        return (
          <Badge
            key={p}
            role="listitem"
            variant={supported ? 'secondary' : 'outline'}
            size="sm"
            icon={p === 'web' ? <GlobeIcon /> : <SmartphoneIcon />}
            opacity={supported ? 1 : 0.55}
            aria-label={`${platformLabel[p]}: ${supported ? 'supported' : 'not rendered'}`}
          >
            {platformLabel[p]}
          </Badge>
        )
      })}
    </HStack>
  )
}

function PropsTable({ part }: { part: PartDoc }) {
  return (
    <VStack gap="$2">
      <Text render="h3" size="base" weight="semibold" mono margin={0}>
        {part.name}
      </Text>
      {part.description ? (
        <Text size="sm" tone="muted">
          {part.description}
        </Text>
      ) : null}
      {part.props.length ? (
        <View
          overflowX="auto"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$lg"
          // Long types can overflow; a focusable region scrolls with the keyboard.
          tabIndex={0}
          role="region"
          aria-label={`${part.name} props`}
          focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
        >
          <table className="props-table">
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {part.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code className="prop-name">{prop.name}</code>
                    {prop.required ? <span className="prop-required"> required</span> : null}
                  </td>
                  <td>
                    <code className="prop-type">{prop.type}</code>
                  </td>
                  <td>{prop.default ? <code>{prop.default}</code> : '—'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </View>
      ) : null}
    </VStack>
  )
}

function SectionAnchor({ id, children }: { id: string; children: ReactNode }) {
  return (
    <VStack id={id} gap="$4">
      {children}
    </VStack>
  )
}

export function ComponentDoc({ data }: { data: ComponentDocData }) {
  const { meta } = data
  const [first] = data.examples
  const toc: TocItem[] = [
    { id: 'preview', title: meta.playground ? 'Playground' : 'Preview' },
    { id: 'installation', title: 'Installation' },
    { id: 'usage', title: 'Usage' },
    { id: 'examples', title: 'Examples' },
    ...data.examples.map((e) => ({ id: `example-${e.name}`, title: e.title, level: 3 as const })),
    { id: 'api', title: 'API reference' },
    { id: 'accessibility', title: 'Accessibility' },
    ...(meta.responsive ? [{ id: 'responsive', title: 'Responsive behavior' }] : []),
    ...(meta.platformNotes && Object.keys(meta.platformNotes).length
      ? [{ id: 'platforms', title: 'Platform notes' }]
      : []),
    ...(data.related.length ? [{ id: 'related', title: 'Related' }] : []),
  ]

  return (
    <DocPage toc={toc}>
      <Breadcrumbs
        items={[
          { title: 'Docs', href: '/docs/introduction' },
          { title: 'Components', href: '/docs/components' },
          { title: data.categoryLabel },
          { title: meta.name },
        ]}
      />
      <PageHeader title={meta.name} description={meta.description}>
        <HStack gap="$2" flexWrap="wrap" alignItems="center">
          <Badge
            variant={
              meta.status === 'stable' ? 'success' : meta.status === 'beta' ? 'warning' : 'info'
            }
            size="sm"
          >
            {statusMeta[meta.status].label}
          </Badge>
          <PlatformBadges platforms={meta.platforms} />
          <Button
            size="sm"
            variant="ghost"
            iconAfter={<ExternalLinkIcon />}
            render={<a href={data.sourceUrl} target="_blank" rel="noreferrer" />}
          >
            Source
          </Button>
        </HStack>
      </PageHeader>

      <SectionAnchor id="preview">
        {meta.playground ? (
          <Playground spec={meta.playground} />
        ) : first ? (
          <ComponentPreview
            slug={meta.slug}
            name={first.name}
            title={first.title}
            code={first.code}
            html={first.html}
          />
        ) : null}
      </SectionAnchor>

      <SectionAnchor id="installation">
        <H2 id="installation-heading">Installation</H2>
        <Tabs defaultValue="package">
          <Tabs.List aria-label="Installation method">
            <Tabs.Trigger value="package">Package</Tabs.Trigger>
            <Tabs.Trigger value="cli">CLI (copy source)</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="package" gap="$2">
            <CodeBlock {...data.install.pnpm} title="pnpm" />
            <CodeBlock {...data.install.npm} title="npm" />
          </Tabs.Content>
          <Tabs.Content value="cli" gap="$2">
            <CodeBlock {...data.install.cli} title="Terminal" />
            <Text size="sm" tone="muted">
              Copies the source into your project
              {data.registryDependencies.length ? (
                <>
                  {' '}
                  together with: <C>{data.registryDependencies.join(', ')}</C>
                </>
              ) : null}
              . You own the code — edit it freely.
            </Text>
          </Tabs.Content>
        </Tabs>
      </SectionAnchor>

      <SectionAnchor id="usage">
        <H2 id="usage-heading">Usage</H2>
        <CodeBlock {...data.usage} />
      </SectionAnchor>

      <SectionAnchor id="examples">
        <H2 id="examples-heading">Examples</H2>
        <VStack gap="$8">
          {data.examples.map((example) => (
            <ComponentPreview key={example.name} slug={meta.slug} {...example} />
          ))}
        </VStack>
      </SectionAnchor>

      <SectionAnchor id="api">
        <H2 id="api-heading">API reference</H2>
        <VStack gap="$6">
          {meta.parts.map((part) => (
            <PropsTable key={part.name} part={part} />
          ))}
        </VStack>
      </SectionAnchor>

      <SectionAnchor id="accessibility">
        <H2 id="accessibility-heading">Accessibility</H2>
        <UL>
          {meta.accessibility.map((line) => (
            <LI key={line}>{renderInlineCode(line)}</LI>
          ))}
        </UL>
        {meta.keyboard?.length ? (
          <View
            overflowX="auto"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$lg"
            tabIndex={0}
            role="region"
            aria-label="Keyboard interactions"
            focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
          >
            <table className="props-table">
              <caption className="sr-only">Keyboard interactions</caption>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {meta.keyboard.map((k) => (
                  <tr key={k.keys}>
                    <td>
                      <kbd>{k.keys}</kbd>
                    </td>
                    <td>{k.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </View>
        ) : null}
      </SectionAnchor>

      {meta.responsive ? (
        <SectionAnchor id="responsive">
          <H2 id="responsive-heading">Responsive behavior</H2>
          <P>{renderInlineCode(meta.responsive)}</P>
        </SectionAnchor>
      ) : null}

      {meta.platformNotes && Object.keys(meta.platformNotes).length ? (
        <SectionAnchor id="platforms">
          <H2 id="platforms-heading">Platform notes</H2>
          <Grid columns={{ base: 1, md: 3 }} gap="$3">
            {(['web', 'ios', 'android'] as const)
              .filter((p) => meta.platformNotes?.[p])
              .map((p) => (
                <Card key={p} variant="filled">
                  <Card.Header>
                    <Card.Title>{platformLabel[p]}</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <Text size="sm">{renderInlineCode(meta.platformNotes?.[p] ?? '')}</Text>
                  </Card.Content>
                </Card>
              ))}
          </Grid>
        </SectionAnchor>
      ) : null}

      {data.related.length ? (
        <SectionAnchor id="related">
          <H2 id="related-heading">Related components</H2>
          <HStack gap="$2" flexWrap="wrap">
            {data.related.map((r) => (
              <Link key={r.slug} href={`/docs/components/${r.slug}`} className="plain-link">
                <Badge variant="outline" size="md">
                  {r.planned ? `${r.name} (soon)` : r.name}
                </Badge>
              </Link>
            ))}
          </HStack>
        </SectionAnchor>
      ) : null}

      <HStack gap="$4" flexWrap="wrap" paddingTop="$6">
        <Text size="xs" tone="muted">
          Since v{meta.since}
        </Text>
        <Text size="xs" tone="muted">
          Last updated{' '}
          {new Date(data.lastUpdated).toLocaleDateString('en', { dateStyle: 'medium' })}
        </Text>
        <a href={data.editUrl} className="prose-link" target="_blank" rel="noreferrer">
          <Text size="xs" color="$primaryText">
            Edit this page on GitHub
          </Text>
        </a>
      </HStack>
      <PrevNext prev={data.prev} next={data.next} />
    </DocPage>
  )
}

/** Renders `code` spans written with backticks in metadata strings. */
export function renderInlineCode(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`)/g)
  return parts.map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <C key={i}>{part.slice(1, -1)}</C> : part,
  )
}
