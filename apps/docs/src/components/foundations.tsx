'use client'

import { Card, Grid, HStack, Heading, Icon, Input, Text, VStack, useTheme } from '@adv-ui/core'
import { iconNames } from '@adv-ui/icons'
import { breakpoints, radiusScales, shadows, size, space, zIndex } from '@adv-ui/theme'
import { contrastRatio } from '@adv-ui/utils'
import { useMemo, useState } from 'react'
import { View } from 'tamagui'

const colorGroups: Array<{ title: string; tokens: Array<[string, string?]> }> = [
  {
    title: 'Surfaces',
    tokens: [
      ['background', 'foreground'],
      ['card', 'cardForeground'],
      ['popover', 'popoverForeground'],
      ['muted', 'mutedForeground'],
    ],
  },
  {
    title: 'Brand',
    tokens: [
      ['primary', 'primaryForeground'],
      ['primarySoft', 'primarySoftForeground'],
      ['secondary', 'secondaryForeground'],
      ['accent', 'accentForeground'],
    ],
  },
  {
    title: 'Intent',
    tokens: [
      ['destructive', 'destructiveForeground'],
      ['success', 'successForeground'],
      ['warning', 'warningForeground'],
      ['error', 'errorForeground'],
      ['info', 'infoForeground'],
      ['successSoft', 'successSoftForeground'],
      ['warningSoft', 'warningSoftForeground'],
      ['errorSoft', 'errorSoftForeground'],
      ['infoSoft', 'infoSoftForeground'],
    ],
  },
  { title: 'Lines', tokens: [['border'], ['borderStrong'], ['input'], ['ring']] },
]

function safeContrast(a: string, b: string): number | null {
  try {
    return contrastRatio(a, b)
  } catch {
    return null
  }
}

/** Live swatches of the current theme, with WCAG contrast for text pairs. */
export function ColorTokens() {
  const theme = useTheme() as unknown as Record<
    string,
    { val: string; get: () => string } | undefined
  >
  return (
    <VStack gap="$6">
      {colorGroups.map((group) => (
        <VStack key={group.title} gap="$3">
          <Heading level={3} size="lg">
            {group.title}
          </Heading>
          <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="$3">
            {group.tokens.map(([bg, fg]) => {
              const bgVal = theme[bg]?.val ?? ''
              const fgVal = fg ? (theme[fg]?.val ?? '') : ''
              const ratio = fg ? safeContrast(bgVal, fgVal) : null
              return (
                <View
                  key={bg}
                  borderWidth={1}
                  borderColor="$border"
                  borderRadius="$lg"
                  overflow="hidden"
                >
                  <View
                    height="$16"
                    style={{ backgroundColor: theme[bg]?.get() }}
                    justifyContent="center"
                    paddingHorizontal="$3"
                  >
                    {fg ? (
                      <Text weight="medium" style={{ color: theme[fg]?.get() }}>
                        Aa {fg}
                      </Text>
                    ) : null}
                  </View>
                  <VStack padding="$3" gap="$0.5">
                    <Text mono size="sm" weight="medium">
                      ${bg}
                    </Text>
                    <Text mono size="xs" tone="muted">
                      {bgVal}
                      {ratio ? ` · ${ratio.toFixed(1)}:1` : ''}
                    </Text>
                  </VStack>
                </View>
              )
            })}
          </Grid>
        </VStack>
      ))}
    </VStack>
  )
}

const typeScale = [
  ['xs', '$1'],
  ['sm', '$2'],
  ['base', '$3'],
  ['lg', '$4'],
  ['xl', '$5'],
  ['2xl', '$6'],
  ['3xl', '$7'],
  ['4xl', '$8'],
  ['5xl', '$9'],
  ['6xl', '$10'],
] as const

export function TypeScale() {
  return (
    <VStack gap="$3">
      {typeScale.map(([name, token]) => (
        <HStack
          key={name}
          gap="$4"
          alignItems="baseline"
          borderBottomWidth={1}
          borderColor="$border"
          paddingBottom="$2"
        >
          <Text mono size="xs" tone="muted" width="$20" flexShrink={0}>
            {name} · {token}
          </Text>
          <Text size={name} truncate>
            Cross-platform
          </Text>
        </HStack>
      ))}
    </VStack>
  )
}

const numericEntries = (record: Record<string, number>) =>
  Object.entries(record)
    .filter(([key]) => key !== 'true' && !key.startsWith('-'))
    .sort((a, b) => a[1] - b[1])

export function SpaceScale() {
  return (
    <VStack gap="$1.5">
      {numericEntries(space as unknown as Record<string, number>)
        .filter(([, v]) => v <= 128)
        .map(([key, value]) => (
          <HStack key={key} gap="$3">
            <Text mono size="xs" tone="muted" width="$16">
              ${key}
            </Text>
            <View height="$3" width={value} backgroundColor="$primary" borderRadius="$xs" />
            <Text mono size="xs" tone="muted">
              {value}px
            </Text>
          </HStack>
        ))}
    </VStack>
  )
}

export function SizeTable() {
  const entries = numericEntries(size as unknown as Record<string, number>).filter(
    ([, v]) => v >= 160,
  )
  return (
    <Text size="sm" tone="muted">
      Sizes reuse the spacing scale and add larger steps for layout boxes:{' '}
      {entries.map(([k, v]) => `$${k} = ${v}px`).join(' · ')}. `$true` = 40px (default control
      height).
    </Text>
  )
}

export function RadiusScale() {
  const keys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const
  return (
    <VStack gap="$3">
      <HStack gap="$4" flexWrap="wrap">
        {keys.map((key) => (
          <VStack key={key} gap="$2" alignItems="center">
            <View
              width="$16"
              height="$16"
              backgroundColor="$primarySoft"
              borderWidth={2}
              borderColor="$primary"
              borderRadius={`$${key}` as never}
            />
            <Text mono size="xs" tone="muted">
              ${key}
            </Text>
          </VStack>
        ))}
      </HStack>
      <Text size="sm" tone="muted">
        Radius presets (base value):{' '}
        {Object.entries(radiusScales)
          .map(([k, v]) => `${k} ${v}px`)
          .join(' · ')}
        . Try them in the customizer.
      </Text>
    </VStack>
  )
}

export function ShadowScale() {
  return (
    <Grid columns={{ base: 2, md: 4 }} gap="$4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((name) => (
        <View
          key={name}
          height="$24"
          borderRadius="$lg"
          backgroundColor="$card"
          alignItems="center"
          justifyContent="center"
          {...shadows[name]}
        >
          <Text mono size="sm">
            shadows.{name}
          </Text>
        </View>
      ))}
    </Grid>
  )
}

export function BreakpointsTable() {
  return (
    <View overflowX="auto" borderWidth={1} borderColor="$border" borderRadius="$lg">
      <table className="props-table">
        <thead>
          <tr>
            <th scope="col">Media key</th>
            <th scope="col">Min width</th>
            <th scope="col">Typical device</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(breakpoints).map(([key, value]) => (
            <tr key={key}>
              <td>
                <code className="prop-name">${key === 'xxl' ? 'xxl (2xl)' : key}</code>
              </td>
              <td>{value}px</td>
              <td>
                {
                  {
                    xs: 'Large phone',
                    sm: 'Small tablet',
                    md: 'Tablet',
                    lg: 'Laptop',
                    xl: 'Desktop',
                    xxl: 'Large desktop',
                  }[key]
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </View>
  )
}

export function ZIndexTable() {
  return (
    <Text size="sm" tone="muted">
      {Object.entries(zIndex)
        .filter(([k]) => Number.isNaN(Number(k)))
        .map(([k, v]) => `$${k} = ${v}`)
        .join(' · ')}
    </Text>
  )
}

export function IconGallery() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => iconNames.filter((name) => name.includes(query.trim().toLowerCase())),
    [query],
  )
  return (
    <VStack gap="$4">
      <Input
        aria-label="Filter icons"
        placeholder={`Filter ${iconNames.length} icons…`}
        value={query}
        onChangeText={setQuery}
      />
      <Grid columns={{ base: 3, sm: 4, md: 6 }} gap="$2">
        {filtered.map((name) => (
          <Card key={name} variant="filled" alignItems="center" paddingVertical="$4" gap="$2">
            <Icon name={name} size={22} />
            <Text size="xs" tone="muted" textAlign="center">
              {name}
            </Text>
          </Card>
        ))}
      </Grid>
    </VStack>
  )
}
