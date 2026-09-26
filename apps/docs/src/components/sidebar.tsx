'use client'

import type { ComponentStatus } from '@adv-ui/core/meta'
import { HStack, Text, VStack } from '@adv-ui/core'
import { ChevronRightIcon } from '@adv-ui/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { View } from 'tamagui'
import { type NavCategory, type NavItem, type NavSection, sectionLinks } from '../lib/navigation'

const STORAGE_KEY = 'aui-sidebar-sections'

// `color` is used for small status dots (non-text); `text` meets 4.5:1 for labels.
export const statusMeta: Record<ComponentStatus, { label: string; color: string; text: string }> = {
  stable: { label: 'Stable', color: '$success', text: '$successSoftForeground' },
  beta: { label: 'Beta', color: '$warning', text: '$warningSoftForeground' },
  experimental: { label: 'Experimental', color: '$info', text: '$infoSoftForeground' },
  deprecated: { label: 'Deprecated', color: '$error', text: '$errorSoftForeground' },
  planned: { label: 'Planned', color: '$borderStrong', text: '$mutedForeground' },
}

export function StatusDot({ status }: { status: ComponentStatus }) {
  const meta = statusMeta[status]
  return (
    <View
      width="$1.5"
      height="$1.5"
      borderRadius="$full"
      backgroundColor={meta.color as never}
      role="img"
      aria-label={meta.label}
    />
  )
}

const badgeTones = {
  beta: { bg: '$warningSoft', border: '$warningBorder', text: '$warningSoftForeground' },
  experimental: { bg: '$infoSoft', border: '$infoBorder', text: '$infoSoftForeground' },
  deprecated: { bg: '$errorSoft', border: '$errorBorder', text: '$errorSoftForeground' },
} as const

function StatusBadge({ status }: { status: keyof typeof badgeTones }) {
  const tone = badgeTones[status]
  return (
    <View
      paddingHorizontal="$1.5"
      borderRadius="$full"
      borderWidth={1}
      borderColor={tone.border}
      backgroundColor={tone.bg}
    >
      <Text size="xs" weight="bold" textTransform="uppercase" letterSpacing={0.6} color={tone.text}>
        {statusMeta[status].label}
      </Text>
    </View>
  )
}

/**
 * Sections start open only when they contain the current page; a reader's
 * explicit open/close choice is remembered across visits.
 */
function useSectionState(sections: NavSection[], pathname: string) {
  const [choices, setChoices] = useState<Record<string, boolean>>({})

  const update = useCallback((next: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    setChoices((prev) => {
      const value = next(prev)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // storage unavailable (private mode): keep the choice for this visit only
      }
      return value
    })
  }, [])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setChoices(JSON.parse(stored) as Record<string, boolean>)
    } catch {
      // ignore unreadable storage
    }
  }, [])

  // Navigating into a section the reader closed earlier opens it again.
  useEffect(() => {
    const current = sections.find((s) => sectionLinks(s).some((i) => i.href === pathname))
    if (current)
      update((prev) => (prev[current.id] === false ? { ...prev, [current.id]: true } : prev))
  }, [pathname, sections, update])

  const isOpen = (section: NavSection) =>
    choices[section.id] ?? sectionLinks(section).some((item) => item.href === pathname)

  const toggle = (section: NavSection) => {
    const open = isOpen(section)
    update((prev) => ({ ...prev, [section.id]: !open }))
  }

  return { isOpen, toggle }
}

/** Keeps the current page visible in whichever element scrolls the sidebar. */
function useActiveItemInView(navRef: RefObject<HTMLElement | null>, pathname: string) {
  const firstRun = useRef(true)
  useEffect(() => {
    const isFirstRun = firstRun.current
    firstRun.current = false
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!nav || !active) return
    let scroller = nav.parentElement
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
      scroller = scroller.parentElement
    }
    if (!scroller) return
    // The first run happens after hydration; if the reader already scrolled
    // the sidebar by then, don't yank it back.
    if (isFirstRun && scroller.scrollTop > 0) return
    const box = scroller.getBoundingClientRect()
    const item = active.getBoundingClientRect()
    if (item.top < box.top || item.bottom > box.bottom) {
      scroller.scrollTop += item.top - box.top - (box.height - item.height) / 2
    }
  }, [navRef, pathname])
}

function NavLink({
  item,
  active,
  emphasis = false,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  /** Landing links ("All components") sit on a subtle surface. */
  emphasis?: boolean
  onNavigate?: () => void
}) {
  const badge =
    item.status === 'beta' || item.status === 'experimental' || item.status === 'deprecated' ? (
      <StatusBadge status={item.status} />
    ) : item.planned ? (
      <Text size="xs" tone="muted">
        Soon
      </Text>
    ) : null

  return (
    <Link
      href={item.href}
      className="plain-link nav-link"
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <HStack
        position="relative"
        alignItems="center"
        gap="$2"
        paddingLeft="$8"
        paddingRight="$2"
        paddingVertical="$1.5"
        borderRadius="$md"
        backgroundColor={active ? '$primarySoft' : emphasis ? '$muted' : 'transparent'}
        hoverStyle={{ backgroundColor: active ? '$primarySoftHover' : '$accent' }}
      >
        {active ? (
          // Accent bar drawn over the section's guide line.
          <View
            aria-hidden
            position="absolute"
            left="$4"
            marginLeft={-1}
            top="$1"
            bottom="$1"
            width={3}
            borderRadius="$full"
            backgroundColor="$primary"
          />
        ) : null}
        <Text
          size="sm"
          flex={1}
          weight={active || emphasis ? 'semibold' : 'normal'}
          color={
            active ? '$primarySoftForeground' : item.planned ? '$mutedForeground' : '$foreground'
          }
        >
          {item.title}
        </Text>
        {badge}
      </HStack>
    </Link>
  )
}

function CategoryLinks({
  category,
  sectionLabelId,
  pathname,
  onNavigate,
}: {
  category: NavCategory
  sectionLabelId: string
  pathname: string
  onNavigate?: () => void
}) {
  const headingId = `nav-category-${category.id}`
  return (
    <VStack gap="$0.5" paddingTop={category.title ? '$3' : 0}>
      {category.title ? (
        <HStack position="relative" alignItems="center" paddingLeft="$8" paddingVertical="$1.5">
          {/* Marker sitting on the guide line. */}
          <View
            aria-hidden
            position="absolute"
            left="$3"
            top="50%"
            marginTop="$-1"
            width="$2"
            height="$2"
            borderRadius="$xs"
            borderWidth={1}
            borderColor="$borderStrong"
            backgroundColor="$muted"
          />
          <Text
            id={headingId}
            size="xs"
            weight="semibold"
            tone="muted"
            textTransform="uppercase"
            letterSpacing={1.2}
          >
            {category.title}
          </Text>
        </HStack>
      ) : null}
      <VStack
        render="ul"
        aria-labelledby={category.title ? headingId : sectionLabelId}
        margin={0}
        padding={0}
        gap="$0.5"
      >
        {category.items.map((item) => (
          <View key={item.href} render="li" className="plain-list-item">
            <NavLink item={item} active={pathname === item.href} onNavigate={onNavigate} />
          </View>
        ))}
      </VStack>
    </VStack>
  )
}

export function SidebarNav({
  sections,
  onNavigate,
}: {
  sections: NavSection[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const { isOpen, toggle } = useSectionState(sections, pathname)
  useActiveItemInView(navRef, pathname)

  return (
    <VStack
      ref={navRef as never}
      render="nav"
      aria-label="Documentation"
      gap="$1"
      paddingBottom="$10"
    >
      {sections.map((section) => {
        const open = isOpen(section)
        const listId = `nav-${section.id}`
        const labelId = `nav-${section.id}-label`
        return (
          <VStack key={section.id}>
            <HStack
              render="button"
              id={labelId}
              aria-expanded={open}
              aria-controls={listId}
              onPress={() => toggle(section)}
              alignItems="center"
              gap="$2"
              paddingHorizontal="$2"
              paddingVertical="$2"
              borderRadius="$md"
              borderWidth={0}
              backgroundColor="transparent"
              cursor="pointer"
              hoverStyle={{ backgroundColor: '$accent' }}
              focusVisibleStyle={{ outlineColor: '$ring', outlineWidth: 2, outlineStyle: 'solid' }}
            >
              <View transition="quick" rotate={open ? '90deg' : '0deg'}>
                <ChevronRightIcon size={16} color="$primaryText" />
              </View>
              <Text size="base" weight="semibold">
                {section.title}
              </Text>
            </HStack>
            {open ? (
              <VStack id={listId} position="relative" gap="$0.5" paddingTop="$1" paddingBottom="$3">
                {/* Guide line connecting the section's links. */}
                <View
                  aria-hidden
                  position="absolute"
                  left="$4"
                  top={0}
                  bottom="$3"
                  width={1}
                  backgroundColor="$border"
                />
                {section.overview ? (
                  <NavLink
                    item={section.overview}
                    active={pathname === section.overview.href}
                    emphasis
                    onNavigate={onNavigate}
                  />
                ) : null}
                {section.categories.map((category) => (
                  <CategoryLinks
                    key={category.id}
                    category={category}
                    sectionLabelId={labelId}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </VStack>
            ) : null}
          </VStack>
        )
      })}
    </VStack>
  )
}

export function DesktopSidebar({ sections }: { sections: NavSection[] }) {
  return (
    <View
      render="aside"
      className="sidebar-scroll"
      display="none"
      $lg={{ display: 'flex' }}
      width="$64"
      flexShrink={0}
      position="sticky"
      top="$14"
      height="calc(100vh - 56px)"
      overflowY="auto"
      paddingVertical="$5"
      paddingHorizontal="$2"
      borderRightWidth={1}
      borderColor="$border"
    >
      <SidebarNav sections={sections} />
    </View>
  )
}
