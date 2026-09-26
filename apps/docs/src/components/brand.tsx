'use client'

import { HStack, Text, createIcon } from '@adv-ui/core'
import Link from 'next/link'
import { View } from 'tamagui'
import { siteConfig } from '../lib/site'

// GitHub mark (Simple Icons, CC0).
export const GithubIcon = createIcon('github', [
  [
    'path',
    {
      d: 'M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.04c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.42.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3',
      fill: 'currentColor',
      stroke: 'none',
    },
  ],
])

/** The short name ("aUI") set on a brand-colored tile. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <View
      height={size}
      minWidth={size}
      paddingHorizontal={size * 0.18}
      borderRadius="$md"
      backgroundColor="$primary"
      alignItems="center"
      justifyContent="center"
      aria-hidden
    >
      <Text
        color="$primaryForeground"
        weight="bold"
        fontSize={size * 0.5}
        lineHeight={size}
        letterSpacing={-0.3}
        userSelect="none"
      >
        {siteConfig.shortName}
      </Text>
    </View>
  )
}

export function Logo() {
  return (
    <Link href="/" className="plain-link" aria-label={`${siteConfig.name} home`}>
      <HStack gap="$2">
        <LogoMark />
        <Text weight="bold" size="base" letterSpacing={-0.3}>
          {siteConfig.name}
        </Text>
      </HStack>
    </Link>
  )
}
