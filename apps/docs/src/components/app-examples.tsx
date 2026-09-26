'use client'

import { appExamples, getAppExample } from '@advui/examples'
import { Badge, Button, Card, Grid, HStack, Text, VStack } from '@advui/core'
import { ArrowLeftIcon, MonitorIcon, SmartphoneIcon } from '@advui/icons'
import Link from 'next/link'
import { useState } from 'react'
import { View } from 'tamagui'
import { SiteHeader } from './site-header'
import { withBasePath } from '../lib/site'

export function ExamplesGallery() {
  return (
    <View minHeight="100vh" backgroundColor="$background">
      <SiteHeader />
      <VStack
        render="main"
        id="main"
        gap="$6"
        padding="$4"
        maxWidth={1280}
        marginHorizontal="auto"
        width="100%"
        $md={{ padding: '$8' }}
      >
        <VStack gap="$2">
          <Text render="h1" size="4xl" weight="bold" margin={0}>
            Examples
          </Text>
          <Text size="lg" tone="muted">
            Real screens built only with Adv UI. The same code runs in the Expo app on iOS and
            Android.
          </Text>
        </VStack>
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="$4">
          {appExamples.map((example) => (
            <Link key={example.slug} href={`/examples/${example.slug}`} className="plain-link">
              <Card interactive height="100%">
                <Card.Header>
                  <HStack justifyContent="space-between">
                    <Card.Title>{example.title}</Card.Title>
                    {example.device === 'mobile' ? (
                      <SmartphoneIcon size={16} color="$mutedForeground" />
                    ) : (
                      <MonitorIcon size={16} color="$mutedForeground" />
                    )}
                  </HStack>
                  <Card.Description>{example.description}</Card.Description>
                </Card.Header>
                <Card.Content>
                  <HStack gap="$1" flexWrap="wrap">
                    {example.components.map((c) => (
                      <Badge key={c} variant="secondary" size="sm">
                        {c}
                      </Badge>
                    ))}
                  </HStack>
                </Card.Content>
              </Card>
            </Link>
          ))}
        </Grid>
      </VStack>
    </View>
  )
}

export function ExampleViewer({ slug }: { slug: string }) {
  const example = getAppExample(slug)
  const [device, setDevice] = useState<'desktop' | 'mobile'>(example?.device ?? 'desktop')
  if (!example) return null
  const { Component } = example
  return (
    <View minHeight="100vh" backgroundColor="$background">
      <SiteHeader />
      <VStack render="main" id="main" gap="$4" padding="$4" $md={{ padding: '$6' }}>
        <HStack
          justifyContent="space-between"
          flexWrap="wrap"
          gap="$3"
          maxWidth={1280}
          width="100%"
          marginHorizontal="auto"
        >
          <HStack gap="$3">
            <Link href="/examples" className="plain-link" aria-label="All examples">
              <ArrowLeftIcon />
            </Link>
            <VStack>
              <Text render="h1" size="xl" weight="bold" margin={0}>
                {example.title}
              </Text>
              <Text size="sm" tone="muted">
                {example.description}
              </Text>
            </VStack>
          </HStack>
          <HStack gap="$1" role="group" aria-label="Frame">
            <Button
              size="sm"
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              aria-pressed={device === 'desktop'}
              icon={<MonitorIcon />}
              onPress={() => setDevice('desktop')}
            >
              Desktop
            </Button>
            <Button
              size="sm"
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              aria-pressed={device === 'mobile'}
              icon={<SmartphoneIcon />}
              onPress={() => setDevice('mobile')}
            >
              Mobile
            </Button>
          </HStack>
        </HStack>
        {device === 'desktop' ? (
          <View
            borderWidth={1}
            borderColor="$border"
            borderRadius="$xl"
            overflow="hidden"
            maxWidth={1280}
            width="100%"
            marginHorizontal="auto"
            backgroundColor="$background"
          >
            <Component />
          </View>
        ) : (
          <View alignItems="center">
            <iframe
              title={`${example.title} on a phone`}
              src={withBasePath(`/examples/${example.slug}/frame`)}
              style={{
                width: 390,
                height: 780,
                border: '10px solid var(--foreground)',
                borderRadius: 40,
                background: 'var(--background)',
              }}
            />
          </View>
        )}
      </VStack>
    </View>
  )
}

export function ExampleFrame({ slug }: { slug: string }) {
  const example = getAppExample(slug)
  if (!example) return null
  const { Component } = example
  return (
    <View render="main" minHeight="100vh" backgroundColor="$background">
      <Component />
    </View>
  )
}
