import { Hct, SchemeTonalSpot, argbFromHex, hexFromArgb } from '@material/material-color-utilities'
import { contrastRatio } from '@advui/utils'
import { describe, expect, it } from 'vitest'
import { createUniversalConfig, getUniversalSettings } from './config'
import { MATERIAL_BASELINE_SEED, createMaterialThemes, material, materialShape } from './material'
import { createRadius } from './tokens'

// Same pairs every preset must pass (see themes.test.ts).
const pairs = [
  ['primary', 'primaryForeground'],
  ['destructive', 'destructiveForeground'],
  ['success', 'successForeground'],
  ['error', 'errorForeground'],
  ['info', 'infoForeground'],
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

describe('Material 3 themes', () => {
  it('maps Material roles from the seed onto Adv UI roles', () => {
    const themes = createMaterialThemes()
    const scheme = (dark: boolean) =>
      new SchemeTonalSpot(Hct.fromInt(argbFromHex(MATERIAL_BASELINE_SEED)), dark, 0)
    for (const [mode, s] of [
      ['light', scheme(false)],
      ['dark', scheme(true)],
    ] as const) {
      const t = themes[mode]
      expect(t.primary).toBe(hexFromArgb(s.primary))
      expect(t.primaryForeground).toBe(hexFromArgb(s.onPrimary))
      expect(t.primarySoft).toBe(hexFromArgb(s.primaryContainer))
      expect(t.primarySoftForeground).toBe(hexFromArgb(s.onPrimaryContainer))
      expect(t.secondary).toBe(hexFromArgb(s.secondaryContainer))
      expect(t.background).toBe(hexFromArgb(s.surface))
      expect(t.foreground).toBe(hexFromArgb(s.onSurface))
      expect(t.card).toBe(hexFromArgb(s.surfaceContainerLow))
      expect(t.input).toBe(hexFromArgb(s.outline))
      expect(t.border).toBe(hexFromArgb(s.outlineVariant))
      expect(t.destructive).toBe(hexFromArgb(s.error))
    }
  })

  it.each([MATERIAL_BASELINE_SEED, '#0061a4', '#b3261e', '#386a20', '#ffd600', '#000000'])(
    'meets WCAG AA text contrast from seed %s',
    (seed) => {
      const themes = createMaterialThemes({ seed })
      for (const mode of ['light', 'dark'] as const) {
        const t = themes[mode]
        for (const [bg, fg] of pairs) {
          expect(
            contrastRatio(t[bg], t[fg]),
            `${mode}: ${fg} on ${bg} (${t[fg]} / ${t[bg]})`,
          ).toBeGreaterThanOrEqual(4.5)
        }
        expect(contrastRatio(t.ring, t.background)).toBeGreaterThanOrEqual(3)
      }
    },
  )

  it('designs dark mode from the same seed, not by inverting', () => {
    const { light, dark } = createMaterialThemes({ seed: '#0061a4' })
    expect(dark.background).not.toBe(light.background)
    expect(dark.primary).not.toBe(light.primary)
  })

  it('applies per-mode overrides last', () => {
    const themes = createMaterialThemes({ overrides: { dark: { primary: '#ff0000' } } })
    expect(themes.dark.primary).toBe('#ff0000')
    expect(themes.light.primary).not.toBe('#ff0000')
  })
})

describe('material()', () => {
  it('gives createUniversalConfig Material colors, shapes and fonts', () => {
    const options = material({ seed: '#0061a4' })
    expect(options.radius).toBe(materialShape)
    const config = createUniversalConfig(options)
    expect(config.themes.light.primary?.val).toBe(options.themes?.light.primary)
    expect(config.tokens.radius.button?.val).toBe(9999)
    expect(config.tokens.radius.dialog?.val).toBe(28)
    expect(config.tokens.radius.md?.val).toBe(4)
  })

  it('turns on the Android ripple unless asked not to', () => {
    expect(getUniversalSettings(createUniversalConfig(material())).androidRipple).toBe(true)
    const off = createUniversalConfig(material({ androidRipple: false }))
    expect(getUniversalSettings(off).androidRipple).toBe(false)
  })

  it('leaves the default shapes unchanged for other presets', () => {
    const radius = createRadius('md')
    expect(radius.button).toBe(radius.md)
    expect(radius.buttonLg).toBe(radius.lg)
    expect(radius.dialog).toBe(radius.xl)
  })
})
