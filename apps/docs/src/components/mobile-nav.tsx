'use client'

import { Dialog, HStack, Text, VStack } from '@advui/core'
import Link from 'next/link'
import { useMemo } from 'react'
import { buildNavigation } from '../lib/navigation'
import { Logo } from './brand'
import { SidebarNav } from './sidebar'

const topLinks = [
  { href: '/docs/components', label: 'Components' },
  { href: '/examples', label: 'Examples' },
  { href: '/playground', label: 'Playground' },
]

/** On small screens the sidebar becomes a left drawer (modal, focus-trapped). */
export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const sections = useMemo(() => buildNavigation(), [])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        width="86%"
        maxWidth="$80"
        maxHeight="100%"
        borderRadius={0}
        borderWidth={0}
        borderRightWidth={1}
        padding="$4"
        enterStyle={{ x: -40, opacity: 0 }}
        exitStyle={{ x: -40, opacity: 0 }}
        overflowY="auto"
      >
        <Dialog.Title className="sr-only">Navigation</Dialog.Title>
        <HStack paddingBottom="$2">
          <Logo />
        </HStack>
        <VStack gap="$1" paddingBottom="$2">
          {topLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="plain-link"
              onClick={() => onOpenChange(false)}
            >
              <Text weight="medium" paddingVertical="$1.5">
                {link.label}
              </Text>
            </Link>
          ))}
        </VStack>
        <SidebarNav sections={sections} onNavigate={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog>
  )
}
