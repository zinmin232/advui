'use client'

import { HStack, Text, VStack } from '@advui/core'
import { ChevronLeftIcon, ChevronRightIcon } from '@advui/icons'
import Link from 'next/link'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { View } from 'tamagui'
import { buildNavigation } from '../lib/navigation'
import { DesktopSidebar } from './sidebar'
import { SiteHeader } from './site-header'

export function DocsShell({ children }: { children: ReactNode }) {
  const sections = useMemo(() => buildNavigation(), [])
  return (
    <View minHeight="100vh" backgroundColor="$background">
      <SiteHeader />
      <HStack alignItems="flex-start" maxWidth={1440} marginHorizontal="auto" width="100%">
        <DesktopSidebar sections={sections} />
        <View render="main" id="main" flex={1} minWidth={0} tabIndex={-1}>
          {children}
        </View>
      </HStack>
    </View>
  )
}

export interface TocItem {
  id: string
  title: string
  level?: 2 | 3
}

/** "On this page" list with scroll-spy (desktop only). */
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null
  return (
    <View
      render="nav"
      aria-label="On this page"
      display="none"
      $xl={{ display: 'flex' }}
      width="$56"
      flexShrink={0}
      position="sticky"
      top="$14"
      paddingVertical="$8"
      paddingRight="$4"
      gap="$2"
    >
      <Text size="xs" weight="semibold" tone="muted" textTransform="uppercase" letterSpacing={0.6}>
        On this page
      </Text>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="plain-link"
          aria-current={active === item.id ? 'location' : undefined}
        >
          <Text
            size="sm"
            paddingLeft={item.level === 3 ? '$3' : 0}
            color={active === item.id ? '$primaryText' : '$mutedForeground'}
            hoverStyle={{ color: '$foreground' }}
          >
            {item.title}
          </Text>
        </a>
      ))}
    </View>
  )
}

export function Breadcrumbs({ items }: { items: Array<{ title: string; href?: string }> }) {
  return (
    <View render="nav" aria-label="Breadcrumb">
      <HStack render="ol" gap="$1.5" flexWrap="wrap" margin={0} padding={0}>
        {items.map((item, index) => (
          <HStack key={item.title} render="li" gap="$1.5" className="plain-list-item">
            {item.href ? (
              <Link href={item.href} className="plain-link">
                <Text size="sm" tone="muted" hoverStyle={{ color: '$foreground' }}>
                  {item.title}
                </Text>
              </Link>
            ) : (
              <Text size="sm" aria-current="page">
                {item.title}
              </Text>
            )}
            {index < items.length - 1 ? (
              <ChevronRightIcon size={14} color="$mutedForeground" />
            ) : null}
          </HStack>
        ))}
      </HStack>
    </View>
  )
}

export function PrevNext({
  prev,
  next,
}: {
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
}) {
  return (
    <HStack
      justifyContent="space-between"
      gap="$3"
      paddingTop="$8"
      marginTop="$8"
      borderTopWidth={1}
      borderColor="$border"
    >
      {prev ? (
        <Link href={prev.href} className="plain-link">
          <HStack gap="$2" paddingVertical="$2">
            <ChevronLeftIcon size={16} color="$mutedForeground" />
            <VStack>
              <Text size="xs" tone="muted">
                Previous
              </Text>
              <Text weight="medium">{prev.title}</Text>
            </VStack>
          </HStack>
        </Link>
      ) : (
        <View />
      )}
      {next ? (
        <Link href={next.href} className="plain-link">
          <HStack gap="$2" paddingVertical="$2">
            <VStack alignItems="flex-end">
              <Text size="xs" tone="muted">
                Next
              </Text>
              <Text weight="medium">{next.title}</Text>
            </VStack>
            <ChevronRightIcon size={16} color="$mutedForeground" />
          </HStack>
        </Link>
      ) : null}
    </HStack>
  )
}

/** Standard doc page body: centered article + optional table of contents. */
export function DocPage({ children, toc }: { children: ReactNode; toc?: TocItem[] }) {
  return (
    <HStack alignItems="flex-start" width="100%">
      <VStack
        render="article"
        flex={1}
        minWidth={0}
        maxWidth={860}
        marginHorizontal="auto"
        paddingHorizontal="$4"
        paddingVertical="$8"
        gap="$4"
        $md={{ paddingHorizontal: '$8' }}
      >
        {children}
      </VStack>
      {toc ? <TableOfContents items={toc} /> : null}
    </HStack>
  )
}
