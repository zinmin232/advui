'use client'

import { Button, HStack, IconButton, Input, Label, Text, VStack, toast } from '@advui/core'
import { CheckIcon, CopyIcon, MonitorIcon, MoonIcon, SunIcon, XIcon } from '@advui/icons'
import {
  type FontScale,
  type RadiusScale,
  createThemeColors,
  themePresetNames,
  themePresets,
} from '@advui/theme'
import { MATERIAL_BASELINE_SEED } from '@advui/theme/material'
import { isValidColor, toHex } from '@advui/utils'
import { type ReactNode, useEffect, useId, useMemo, useRef } from 'react'
import { View } from 'tamagui'
import { useColorModeSetting } from '../lib/color-mode'
import {
  type CustomTheme,
  type DesignStyle,
  generateThemes,
  themeToCode,
  useThemeStore,
} from '../lib/theme-store'

const radii: Array<{ value: RadiusScale; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'XL' },
]
const fontScales: Array<{ value: FontScale; label: string }> = [
  { value: 'compact', label: 'Compact' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
]

/** Segmented control with radio semantics (arrow keys handled by native radios). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string; icon?: ReactNode }>
  onChange: (value: T) => void
}) {
  return (
    <VStack gap="$2">
      <Text size="sm" weight="medium" id={`seg-${label}`}>
        {label}
      </Text>
      <HStack role="radiogroup" aria-labelledby={`seg-${label}`} gap="$1" flexWrap="wrap">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Button
              key={option.value}
              size="sm"
              variant={selected ? 'default' : 'outline'}
              role="radio"
              aria-checked={selected}
              icon={option.icon}
              onPress={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          )
        })}
      </HStack>
    </VStack>
  )
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string
  value: string | undefined
  fallback: string
  onChange: (value: string | undefined) => void
}) {
  const id = useId()
  const current = value ?? fallback
  return (
    <VStack gap="$2" flex={1} minWidth="$40">
      <Label htmlFor={id}>{label}</Label>
      <HStack gap="$2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={toHex(current).slice(0, 7)}
          onChange={(event) => onChange(event.target.value)}
        />
        <Input
          id={id}
          size="sm"
          flex={1}
          value={value ?? ''}
          placeholder={toHex(fallback).slice(0, 7)}
          onChangeText={(text) => {
            if (!text) onChange(undefined)
            else if (isValidColor(text)) onChange(text)
          }}
          invalid={!!value && !isValidColor(value)}
          autoCapitalize="none"
        />
      </HStack>
    </VStack>
  )
}

export function CustomizerControls({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, reset, isDefault } = useThemeStore()
  const setting = useColorModeSetting()
  const generated = useMemo(() => generateThemes(theme), [theme])
  const material = theme.style === 'material'

  const choosePreset = (preset: CustomTheme['preset']) =>
    setTheme({ preset, primary: undefined, secondary: undefined, accent: undefined })

  return (
    <VStack gap="$5">
      <Segmented<DesignStyle>
        label="Style"
        value={theme.style}
        options={[
          { value: 'advui', label: 'Adv UI' },
          { value: 'material', label: 'Material 3' },
        ]}
        onChange={(style) =>
          setTheme({ style, primary: undefined, secondary: undefined, accent: undefined })
        }
      />

      {material ? (
        <Text size="sm" tone="muted">
          Google’s Material 3: every color role is generated from one seed color, with Material’s
          shapes (pill buttons, 28px dialogs) and Roboto.
        </Text>
      ) : null}

      <VStack gap="$2" display={material ? 'none' : 'flex'}>
        <Text size="sm" weight="medium" id="preset-label">
          Preset
        </Text>
        <HStack role="radiogroup" aria-labelledby="preset-label" flexWrap="wrap" gap="$2">
          {themePresetNames.map((name) => {
            const swatch = createThemeColors(themePresets[name].colors).light.primary
            const selected = theme.preset === name && !theme.primary
            return (
              <Button
                key={name}
                size="sm"
                variant="outline"
                role="radio"
                aria-checked={selected}
                borderColor={selected ? '$ring' : '$input'}
                borderWidth={selected ? 2 : 1}
                onPress={() => choosePreset(name)}
                icon={
                  <View
                    width="$3.5"
                    height="$3.5"
                    borderRadius="$full"
                    style={{ backgroundColor: swatch }}
                  />
                }
              >
                {themePresets[name].label}
              </Button>
            )
          })}
        </HStack>
      </VStack>

      <HStack gap="$3" flexWrap="wrap">
        <ColorField
          label={material ? 'Seed color' : 'Primary'}
          value={theme.primary}
          fallback={material ? MATERIAL_BASELINE_SEED : generated.light.primary}
          onChange={(primary) => setTheme({ primary })}
        />
        {material ? null : (
          <>
            <ColorField
              label="Secondary"
              value={theme.secondary}
              fallback={generated.light.secondaryForeground}
              onChange={(secondary) => setTheme({ secondary })}
            />
            <ColorField
              label="Accent"
              value={theme.accent}
              fallback={generated.light.accentForeground}
              onChange={(accent) => setTheme({ accent })}
            />
          </>
        )}
      </HStack>

      {material ? null : (
        <Segmented
          label="Radius"
          value={theme.radius}
          options={radii}
          onChange={(radius) => setTheme({ radius })}
        />
      )}
      <Segmented
        label="Font size"
        value={theme.fontScale}
        options={fontScales}
        onChange={(fontScale) => setTheme({ fontScale })}
      />
      <Segmented
        label="Mode"
        value={(setting.setting ?? 'system') as 'light' | 'dark' | 'system'}
        options={[
          { value: 'light', label: 'Light', icon: <SunIcon /> },
          { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
          { value: 'system', label: 'System', icon: <MonitorIcon /> },
        ]}
        onChange={(mode) => setting.setSetting(mode)}
      />

      <HStack gap="$2" flexWrap="wrap">
        <Button
          icon={<CopyIcon />}
          onPress={async () => {
            await navigator.clipboard.writeText(themeToCode(theme))
            toast.success('Theme copied', { description: 'Paste it into your tamagui.config.ts' })
          }}
        >
          Copy theme
        </Button>
        <Button variant="ghost" onPress={reset} disabled={isDefault}>
          Reset
        </Button>
      </HStack>
      {compact ? null : (
        <Text size="xs" tone="muted">
          Changes apply to the whole site instantly and are remembered in this browser. “Copy theme”
          gives you a config you can paste into any app.
        </Text>
      )}
    </VStack>
  )
}

/** Non-modal floating panel: the page stays visible and interactive while tweaking. */
export function CustomizerPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLElement | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>('button, input')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      returnFocus.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <View
      ref={panelRef as never}
      role="dialog"
      aria-modal={false}
      aria-labelledby="customizer-title"
      position="fixed"
      zIndex="$popover"
      top="$16"
      right="$3"
      left="$3"
      maxHeight="80vh"
      overflowY="auto"
      backgroundColor="$popover"
      borderWidth={1}
      borderColor="$border"
      borderRadius="$xl"
      padding="$5"
      gap="$4"
      shadowColor="$shadowColorStrong"
      shadowOffset={{ width: 0, height: 12 }}
      shadowOpacity={1}
      shadowRadius={32}
      $sm={{ left: 'auto', width: '$112' }}
    >
      <HStack justifyContent="space-between">
        <VStack>
          <Text id="customizer-title" weight="semibold" size="lg">
            Customize
          </Text>
          <Text size="sm" tone="muted">
            Pick a style and colors for your components.
          </Text>
        </VStack>
        <IconButton aria-label="Close customizer" size="sm" icon={<XIcon />} onPress={onClose} />
      </HStack>
      <CustomizerControls />
      <HStack gap="$1.5" alignItems="center">
        <CheckIcon size={14} color="$success" />
        <Text size="xs" tone="muted">
          Every preset meets WCAG AA contrast in light and dark mode.
        </Text>
      </HStack>
    </View>
  )
}
