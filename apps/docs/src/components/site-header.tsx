'use client'

import { Button, HStack, IconButton, Kbd, Text, Tooltip } from '@adv-ui/core'
import { MenuIcon, MonitorIcon, MoonIcon, PaletteIcon, SearchIcon, SunIcon } from '@adv-ui/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { View } from 'tamagui'
import { useColorModeSetting } from '../lib/color-mode'
import { siteConfig } from '../lib/site'
import { GithubIcon, Logo } from './brand'
import { useCommandPalette } from './command-palette'
import { CustomizerPanel } from './customizer-panel'
import { MobileNav } from './mobile-nav'

const links = [
  { href: '/docs/introduction', label: 'Docs', match: /^\/docs(?!\/components)/ },
  { href: '/docs/components', label: 'Components', match: /^\/docs\/components/ },
  { href: '/examples', label: 'Examples', match: /^\/examples/ },
  { href: '/playground', label: 'Playground', match: /^\/playground/ },
]

export function ThemeToggle() {
  const setting = useColorModeSetting()
  const current = setting.setting ?? 'system'
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
  const icon =
    current === 'light' ? <SunIcon /> : current === 'dark' ? <MoonIcon /> : <MonitorIcon />
  const label = `Color mode: ${current}. Switch to ${next}`
  return (
    <Tooltip content={label}>
      <IconButton aria-label={label} icon={icon} onPress={() => setting.setSetting(next)} />
    </Tooltip>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const palette = useCommandPalette()
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <View
        render="header"
        position="sticky"
        top={0}
        zIndex="$sticky"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderColor="$border"
      >
        <HStack
          height="$14"
          paddingHorizontal="$4"
          gap="$2"
          maxWidth={1440}
          marginHorizontal="auto"
          width="100%"
        >
          <View display="flex" $lg={{ display: 'none' }}>
            <IconButton
              aria-label="Open navigation"
              icon={<MenuIcon />}
              onPress={() => setNavOpen(true)}
            />
          </View>
          <Logo />
          <HStack
            render="nav"
            aria-label="Main"
            gap="$1"
            marginLeft="$6"
            display="none"
            $md={{ display: 'flex' }}
          >
            {links.map((link) => {
              const active = link.match.test(pathname)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="plain-link"
                  aria-current={active ? 'page' : undefined}
                >
                  <Text
                    size="sm"
                    weight="medium"
                    paddingHorizontal="$3"
                    paddingVertical="$1.5"
                    borderRadius="$md"
                    color={active ? '$foreground' : '$mutedForeground'}
                    hoverStyle={{ color: '$foreground', backgroundColor: '$accent' }}
                  >
                    {link.label}
                  </Text>
                </Link>
              )
            })}
          </HStack>
          <View flex={1} />
          <Button
            variant="outline"
            size="sm"
            icon={<SearchIcon />}
            onPress={() => palette.setOpen(true)}
            aria-label="Search documentation"
            aria-keyshortcuts="Control+K Meta+K"
            justifyContent="flex-start"
            display="none"
            $sm={{ display: 'flex', width: '$56' }}
          >
            <Text size="sm" tone="muted" flex={1}>
              Search…
            </Text>
            <Kbd>Ctrl K</Kbd>
          </Button>
          <View $sm={{ display: 'none' }}>
            <IconButton
              aria-label="Search documentation"
              icon={<SearchIcon />}
              onPress={() => palette.setOpen(true)}
            />
          </View>
          <Tooltip content="Customize theme">
            <IconButton
              aria-label="Customize theme"
              aria-expanded={customizerOpen}
              icon={<PaletteIcon />}
              onPress={() => setCustomizerOpen((v) => !v)}
            />
          </Tooltip>
          <ThemeToggle />
          <Tooltip content="GitHub">
            <IconButton
              aria-label="GitHub repository"
              icon={<GithubIcon />}
              render={<a href={siteConfig.github} target="_blank" rel="noreferrer" />}
            />
          </Tooltip>
        </HStack>
      </View>
      <CustomizerPanel open={customizerOpen} onClose={() => setCustomizerOpen(false)} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} />
    </>
  )
}
