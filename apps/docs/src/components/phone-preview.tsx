'use client'

import { Button, Popover, Text, VStack } from '@advui/core'
import { ExternalLinkIcon, SmartphoneIcon } from '@advui/icons'
import { View } from 'tamagui'
import type { PhonePreview } from '../lib/phone-preview'

/** A QR code that opens a component's screen in Expo Go on a phone. */
export function PhonePreviewButton({ name, preview }: { name: string; preview: PhonePreview }) {
  const { path, size, url } = preview

  return (
    <Popover align="end">
      <Popover.Trigger asChild>
        <Button size="sm" variant="ghost" icon={<SmartphoneIcon />}>
          Open on phone
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <VStack gap="1">
          <Popover.Title>Open {name} on your phone</Popover.Title>
          <Popover.Description>
            Scan this code with Expo Go on Android, or with the Camera app on iPhone.
          </Popover.Description>
        </VStack>
        {/* Scanners want dark modules on a light ground, whatever the color mode. */}
        <View width="48" alignSelf="center">
          <svg
            role="img"
            aria-label={`QR code for ${name} in Expo Go`}
            viewBox={`0 0 ${size} ${size}`}
            shapeRendering="crispEdges"
          >
            <rect width={size} height={size} fill="white" />
            <path d={path} fill="black" />
          </svg>
        </View>
        <Button
          size="sm"
          variant="outline"
          iconAfter={<ExternalLinkIcon />}
          role="link"
          render={<a href={url} />}
        >
          Open in Expo Go
        </Button>
        <Text size="xs" tone="muted">
          Needs the free{' '}
          <a href="https://expo.dev/go" className="prose-link" target="_blank" rel="noreferrer">
            Expo Go
          </a>{' '}
          app. The first time, it shows its developer menu: close it to reach the component.
        </Text>
      </Popover.Content>
    </Popover>
  )
}
