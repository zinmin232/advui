import { updateTheme } from '@tamagui/theme'
import { Button, Card, HStack, Text, VStack, useColorMode } from '@advui/core'
import {
  type ThemePresetName,
  createThemeColors,
  themePresetNames,
  themePresets,
} from '@advui/theme'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import { View } from 'tamagui'

/**
 * Runtime theming on native: `updateTheme` swaps the generated light/dark
 * themes in place — the same mechanism the web customizer uses.
 */
export default function ThemeScreen() {
  const { colorMode, setColorMode, resolvedColorMode } = useColorMode()
  const [preset, setPreset] = useState<ThemePresetName>('indigo')

  const applyPreset = (name: ThemePresetName) => {
    const themes = createThemeColors(themePresets[name].colors)
    updateTheme({ name: 'light', theme: themes.light })
    updateTheme({ name: 'dark', theme: themes.dark })
    setPreset(name)
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: 'Theme' }} />
      <VStack padding="$4" gap="$6">
        <VStack gap="$3">
          <Text weight="semibold">Color mode</Text>
          <HStack gap="$2" flexWrap="wrap">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={colorMode === mode ? 'default' : 'outline'}
                role="radio"
                aria-checked={colorMode === mode}
                onPress={() => setColorMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </HStack>
          <Text size="sm" tone="muted">
            Resolved: {resolvedColorMode}
          </Text>
        </VStack>
        <VStack gap="$3">
          <Text weight="semibold">Preset</Text>
          <HStack gap="$2" flexWrap="wrap">
            {themePresetNames.map((name) => (
              <Button
                key={name}
                size="sm"
                variant="outline"
                role="radio"
                aria-checked={preset === name}
                borderColor={preset === name ? '$ring' : '$input'}
                borderWidth={preset === name ? 2 : 1}
                onPress={() => applyPreset(name)}
                icon={
                  <View
                    width="$3.5"
                    height="$3.5"
                    borderRadius="$full"
                    backgroundColor={
                      createThemeColors(themePresets[name].colors).light.primary as never
                    }
                  />
                }
              >
                {themePresets[name].label}
              </Button>
            ))}
          </HStack>
        </VStack>
        <Card>
          <Card.Header>
            <Card.Title>Preview</Card.Title>
            <Card.Description>Components pick up the new theme instantly.</Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </Card.Footer>
        </Card>
      </VStack>
    </ScrollView>
  )
}
