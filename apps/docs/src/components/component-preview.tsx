'use client'

import { Button, HStack, Tabs, Text, Tooltip, VStack } from '@adv-ui/core'
import { examples } from '@adv-ui/core/examples'
import { MonitorIcon, SmartphoneIcon } from '@adv-ui/icons'
import { useState } from 'react'
import { View } from 'tamagui'
import { CodeBlock } from './code-block'
import { withBasePath } from '../lib/site'

type Viewport = 'desktop' | 'tablet' | 'mobile'
const widths: Record<Exclude<Viewport, 'desktop'>, number> = { tablet: 768, mobile: 375 }

export function ExampleRenderer({ slug, name }: { slug: string; name: string }) {
  const Example = examples[slug]?.[name]
  if (!Example) return <Text tone="error">Example “{name}” not found.</Text>
  return <Example />
}

/** Preview surface shared by examples and the playground. */
export function PreviewSurface({
  children,
  minHeight = '$56',
}: {
  children: React.ReactNode
  minHeight?: '$40' | '$56' | '$72'
}) {
  return (
    <View
      minHeight={minHeight}
      alignItems="center"
      justifyContent="center"
      padding="$6"
      $sm={{ padding: '$10' }}
      backgroundColor="$background"
      backgroundImage="radial-gradient(var(--border) 1px, transparent 1px)"
      backgroundSize="16px 16px"
    >
      <View width="100%" alignItems="center">
        {children}
      </View>
    </View>
  )
}

export function ComponentPreview({
  slug,
  name,
  title,
  description,
  code,
  html,
}: {
  slug: string
  name: string
  title: string
  description?: string
  code: string
  html: string
}) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  return (
    <VStack gap="$3" id={`example-${name}`}>
      <VStack gap="$1">
        <Text render="h3" size="lg" weight="semibold" margin={0}>
          {title}
        </Text>
        {description ? (
          <Text size="sm" tone="muted">
            {description}
          </Text>
        ) : null}
      </VStack>
      <Tabs defaultValue="preview" gap="$2">
        <HStack justifyContent="space-between" flexWrap="wrap" gap="$2">
          <Tabs.List aria-label={`${title} example`}>
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
          </Tabs.List>
          <HStack gap="$1" role="group" aria-label="Preview width">
            {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
              <Tooltip key={v} content={v === 'desktop' ? 'Full width' : `${widths[v]}px`}>
                <Button
                  size="sm"
                  variant={viewport === v ? 'secondary' : 'ghost'}
                  aria-pressed={viewport === v}
                  aria-label={`${v} width`}
                  icon={v === 'mobile' ? <SmartphoneIcon /> : <MonitorIcon />}
                  onPress={() => setViewport(v)}
                >
                  {v === 'tablet' ? 'Tablet' : null}
                </Button>
              </Tooltip>
            ))}
          </HStack>
        </HStack>
        <Tabs.Content value="preview">
          <View borderWidth={1} borderColor="$border" borderRadius="$lg" overflow="hidden">
            {viewport === 'desktop' ? (
              <PreviewSurface>
                <ExampleRenderer slug={slug} name={name} />
              </PreviewSurface>
            ) : (
              <View
                alignItems="center"
                backgroundColor="$muted"
                paddingVertical="$4"
                overflowX="auto"
              >
                <iframe
                  title={`${title} at ${widths[viewport]}px`}
                  src={withBasePath(`/preview/${slug}/${name}`)}
                  style={{
                    width: widths[viewport],
                    maxWidth: '100%',
                    height: 480,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: 'var(--background)',
                  }}
                />
              </View>
            )}
          </View>
        </Tabs.Content>
        <Tabs.Content value="code">
          <CodeBlock html={html} code={code} maxHeight={520} />
        </Tabs.Content>
      </Tabs>
    </VStack>
  )
}
