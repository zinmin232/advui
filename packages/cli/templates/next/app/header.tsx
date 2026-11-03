'use client'

import { HStack, NavigationMenu, Text } from '@advui/core'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
  { href: '/login', label: 'Sign in' },
]

export function Header() {
  const pathname = usePathname()
  return (
    <HStack
      render="header"
      gap="4"
      flexWrap="wrap"
      paddingHorizontal="4 md:8"
      paddingVertical="3"
      borderBottomWidth={1}
      borderColor="border"
    >
      <Text weight="semibold">My app</Text>
      <NavigationMenu aria-label="Main">
        {links.map((link) => (
          // render keeps Next.js's client-side navigation.
          <NavigationMenu.Link
            key={link.href}
            render={<Link href={link.href} />}
            active={pathname === link.href}
          >
            {link.label}
          </NavigationMenu.Link>
        ))}
      </NavigationMenu>
    </HStack>
  )
}
