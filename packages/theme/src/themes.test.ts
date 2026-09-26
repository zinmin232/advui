import { contrastRatio } from '@advui/utils'
import { describe, expect, it } from 'vitest'
import { generateScale, resolveScale, scales } from './palettes'
import { themePresetNames, themePresets } from './presets'
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
