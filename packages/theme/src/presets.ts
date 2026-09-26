import type { ThemeColorsInput } from './themes'

export interface ThemePreset {
  name: string
  label: string
  colors: ThemeColorsInput
}

export const themePresets = {
  indigo: {
    name: 'indigo',
    label: 'Indigo',
    colors: { primary: 'indigo', neutral: 'slate' },
  },
  blue: {
    name: 'blue',
    label: 'Blue',
    colors: { primary: 'blue', neutral: 'slate' },
  },
  violet: {
    name: 'violet',
    label: 'Violet',
    colors: { primary: 'violet', neutral: 'mauve' },
  },
  green: {
    name: 'green',
    label: 'Green',
    colors: { primary: 'green', neutral: 'sage' },
  },
  emerald: {
    name: 'emerald',
    label: 'Emerald',
    colors: { primary: 'teal', neutral: 'sage' },
  },
  orange: {
    name: 'orange',
    label: 'Orange',
    colors: { primary: 'orange', neutral: 'sand' },
  },
  rose: {
    name: 'rose',
    label: 'Rose',
    colors: { primary: 'crimson', neutral: 'mauve' },
  },
  red: {
    name: 'red',
    label: 'Red',
    colors: { primary: 'red', neutral: 'gray' },
  },
  slate: {
    name: 'slate',
    label: 'Slate',
    colors: { neutral: 'slate', monochrome: true },
  },
  neutral: {
    name: 'neutral',
    label: 'Neutral',
    colors: { neutral: 'gray', monochrome: true },
  },
} as const satisfies Record<string, ThemePreset>

export type ThemePresetName = keyof typeof themePresets

export const themePresetNames = Object.keys(themePresets) as ThemePresetName[]
