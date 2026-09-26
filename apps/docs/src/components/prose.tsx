'use client'

import { Alert, Heading, Text, VStack } from '@adv-ui/core'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { View } from 'tamagui'

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <VStack gap="$3" paddingBottom="$4">
      <Heading level={1} size="4xl" $max-sm={{ fontSize: '$7', lineHeight: '$7' }}>
        {title}
      </Heading>
      {description ? (
        <Text size="lg" tone="muted">
          {description}
        </Text>
      ) : null}
      {children}
    </VStack>
  )
}

export function H2({ children, id }: { children: string; id?: string }) {
  return (
    <Heading
      level={2}
      size="2xl"
      id={id ?? slugify(children)}
      marginTop="$8"
      paddingBottom="$2"
      borderBottomWidth={1}
      borderColor="$border"
    >
      {children}
    </Heading>
  )
}

export function H3({ children, id }: { children: string; id?: string }) {
  return (
    <Heading level={3} size="lg" id={id ?? slugify(children)} marginTop="$5">
      {children}
    </Heading>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <Text render="p" lineHeight="$4" marginVertical={0} color="$foreground">
      {children}
    </Text>
  )
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <View render="ul" gap="$2" paddingLeft="$5" marginVertical={0}>
      {children}
    </View>
  )
}

export function LI({ children }: { children: ReactNode }) {
  return (
    <Text render="li" lineHeight="$4" className="prose-li" color="$foreground">
      {children}
    </Text>
  )
}

export function C({ children }: { children: ReactNode }) {
  return (
    <Text
      render="code"
      mono
      size="sm"
      backgroundColor="$muted"
      paddingHorizontal="$1"
      borderRadius="$sm"
      color="$foreground"
    >
      {children}
    </Text>
  )
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http')
  return external ? (
    <a className="prose-link" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <Link className="prose-link" href={href}>
      {children}
    </Link>
  )
}

export function Callout({
  title,
  children,
  variant = 'info',
}: {
  title?: string
  children: ReactNode
  variant?: 'info' | 'warning' | 'success' | 'default'
}) {
  return (
    <Alert variant={variant}>
      {title ? <Alert.Title>{title}</Alert.Title> : null}
      <Alert.Description>{children}</Alert.Description>
    </Alert>
  )
}

export function Section({ children }: { children: ReactNode }) {
  return <VStack gap="$4">{children}</VStack>
}
