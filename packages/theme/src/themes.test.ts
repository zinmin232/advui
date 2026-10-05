import { contrastRatio } from '@advui/utils'
import { describe, expect, it } from 'vitest'
import { generateScale, resolveScale, scales } from './palettes'
import { themePresetNames, themePresets } from './presets'
import { createUniversalConfig } from './config'
import { createMaterialThemes } from './material'
import { createThemeColors } from './themes'
import { createRadius } from './tokens'

const solidPairs = [
  ['primary', 'primaryForeground'],
  ['destructive', 'destructiveForeground'],
  ['success', 'successForeground'],
  ['error', 'errorForeground'],
  ['info', 'infoForeground'],
] as const

const textPairs = [
  ['background', 'foreground'],
  ['background', 'primaryText'],
  ['foreground', 'inversePrimary'],
  ['card', 'primaryText'],
  ['card', 'cardForeground'],
  ['popover', 'popoverForeground'],
  ['background', 'mutedForeground'],
  ['secondary', 'secondaryForeground'],
  ['primarySoft', 'primarySoftForeground'],
  ['successSoft', 'successSoftForeground'],
  ['warningSoft', 'warningSoftForeground'],
  ['errorSoft', 'errorSoftForeground'],
  ['infoSoft', 'infoSoftForeground'],
] as const

describe.each(themePresetNames)('preset "%s"', (name) => {
  const themes = createThemeColors(themePresets[name].colors)

  it.each(['light', 'dark'] as const)('meets WCAG AA text contrast in %s mode', (mode) => {
    const theme = themes[mode]
    for (const [bg, fg] of [...solidPairs, ...textPairs]) {
      expect(
        contrastRatio(theme[bg], theme[fg]),
        `${mode}: ${fg} on ${bg} (${theme[fg]} / ${theme[bg]})`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('has a visible focus ring (≥3:1 against the background)', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(contrastRatio(themes[mode].ring, themes[mode].background)).toBeGreaterThanOrEqual(3)
    }
  })

  it('designs dark mode separately instead of inverting', () => {
    expect(themes.light.background).not.toBe(themes.dark.background)
    expect(themes.dark.background).not.toBe(themes.light.foreground)
  })
})

describe('custom colors', () => {
  it('builds accessible themes from any brand color', () => {
    for (const brand of ['#ff5a1f', '#0ea5e9', '#a3e635', '#7c3aed', '#111827', '#facc15']) {
      const themes = createThemeColors({ primary: brand })
      for (const mode of ['light', 'dark'] as const) {
        const t = themes[mode]
        expect(
          contrastRatio(t.primary, t.primaryForeground),
          `${brand} ${mode}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('generates 12-step scales anchored on the input color', () => {
    const scale = generateScale('#6366f1')
    expect(scale.light).toHaveLength(12)
    expect(scale.dark).toHaveLength(12)
    expect(scale.light[8]).toBe('#6366f1')
    expect(scale.dark[8]).toBe('#6366f1')
  })

  it('resolves named scales and rejects unknown names', () => {
    expect(resolveScale('violet')).toBe(scales.violet)
    expect(() => resolveScale('not-a-color')).toThrow(/Unknown color/)
  })

  it('applies per-mode overrides last', () => {
    const themes = createThemeColors({ overrides: { dark: { background: '#000000' } } })
    expect(themes.dark.background).toBe('#000000')
    expect(themes.light.background).toBe('#ffffff')
  })
})

describe('radius tokens', () => {
  it('scale from a single base value', () => {
    expect(createRadius('none').lg).toBe(0)
    expect(createRadius('md').lg).toBe(8)
    expect(createRadius('lg').md).toBe(9)
    expect(createRadius(20).xl).toBe(30)
    expect(createRadius('sm').full).toBe(9999)
  })
})

describe('chart palette', () => {
  it('gives every preset and mode eight distinct series colors, stepped per mode', () => {
    for (const name of themePresetNames) {
      const themes = createThemeColors(themePresets[name].colors)
      const keys = [
        'chart1',
        'chart2',
        'chart3',
        'chart4',
        'chart5',
        'chart6',
        'chart7',
        'chart8',
      ] as const
      for (const mode of ['light', 'dark'] as const) {
        expect(new Set(keys.map((key) => themes[mode][key])).size).toBe(8)
      }
      // Dark mode has its own steps rather than reusing the light ones.
      expect(themes.dark.chart1).not.toBe(themes.light.chart1)
    }
  })
})

describe.each(themePresetNames)('sub-themes of preset "%s"', (name) => {
  const themes = createThemeColors(themePresets[name].colors)

  it.each(['light', 'dark'] as const)(
    'keeps text readable on a primary surface in %s mode',
    (mode) => {
      const theme = themes[`${mode}_primary`]
      expect(theme.background).toBe(themes[mode].primary)
      for (const [bg, fg] of [
        ['background', 'foreground'],
        ['background', 'mutedForeground'],
        ['background', 'primaryText'],
        ['card', 'cardForeground'],
        ['card', 'mutedForeground'],
        ['primary', 'primaryForeground'],
        ['primarySoft', 'primarySoftForeground'],
        ['foreground', 'inversePrimary'],
      ] as const) {
        expect(
          contrastRatio(theme[bg], theme[fg]),
          `${mode}_primary: ${fg} on ${bg} (${theme[fg]} / ${theme[bg]})`,
        ).toBeGreaterThanOrEqual(4.5)
      }
      expect(contrastRatio(theme.ring, theme.background)).toBeGreaterThanOrEqual(3)
    },
  )

  it('inverts light and dark', () => {
    expect(themes.light_inverse).toEqual(themes.dark)
    expect(themes.dark_inverse).toEqual(themes.light)
  })
})

describe('sub-themes from other sources', () => {
  it('derives readable primary sub-themes from Material themes', () => {
    const themes = createMaterialThemes()
    for (const mode of ['light', 'dark'] as const) {
      const theme = themes[`${mode}_primary`]
      expect(contrastRatio(theme.background, theme.foreground)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(theme.background, theme.mutedForeground)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('adds them to hand-made themes passed to the config', () => {
    const { light, dark } = createThemeColors({ primary: 'teal' })
    const config = createUniversalConfig({ themes: { light, dark } })
    expect(Object.keys(config.themes)).toEqual(
      expect.arrayContaining(['light_primary', 'dark_primary', 'light_inverse', 'dark_inverse']),
    )
  })
})
