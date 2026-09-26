import type { UniversalConfig } from '@advui/theme'

// Registers Adv UI's tokens and themes with Tamagui so props like
// `backgroundColor="$primary"` and `padding="$4"` are type-checked.
declare module 'tamagui' {
  // Module augmentation requires an interface; the empty body is intentional.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends UniversalConfig {}
}

export type ColorModePreference = 'light' | 'dark' | 'system'
export type ResolvedColorMode = 'light' | 'dark'
