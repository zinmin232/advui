import { describe, expect, it } from 'vitest'
import {
  accessibleSolid,
  adjustLightness,
  contrastRatio,
  ensureContrast,
  fromHsv,
  fromOklch,
  isValidColor,
  mix,
  parseColor,
  toHex,
  toHsv,
  toOklch,
  withAlpha,
} from './color'

describe('parseColor', () => {
  it('parses hex, rgb and hsl notations', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#6366f1')).toEqual({ r: 99, g: 102, b: 241, a: 1 })
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 })
    expect(toHex(parseColor('hsl(0, 100%, 50%)')!)).toBe('#ff0000')
  })

  it('rejects invalid input', () => {
    expect(parseColor('not-a-color')).toBeNull()
    expect(isValidColor('#12')).toBe(false)
  })
})

describe('hsv', () => {
  it('converts primaries, grays and translucent colors', () => {
    expect(toHsv('#ff0000')).toEqual({ h: 0, s: 1, v: 1, a: 1 })
    expect(toHsv('#00ff00').h).toBe(120)
    expect(toHsv('#0000ff').h).toBe(240)
    expect(toHsv('#ff00ff').h).toBe(300)
    expect(toHsv('#808080')).toEqual({ h: 0, s: 0, v: 128 / 255, a: 1 })
    expect(toHsv('#000000')).toEqual({ h: 0, s: 0, v: 0, a: 1 })
    expect(toHsv('#ff000080').a).toBeCloseTo(128 / 255)
  })

  it('round-trips through hex', () => {
    for (const hex of ['#6366f1', '#10b981', '#ef4444', '#0b0b0f', '#ffffff', '#3b82f680']) {
      expect(fromHsv(toHsv(hex))).toBe(hex)
    }
  })

  it('wraps the hue and clamps the other channels', () => {
    expect(fromHsv({ h: 360, s: 1, v: 1 })).toBe('#ff0000')
    expect(fromHsv({ h: -120, s: 1, v: 1 })).toBe('#0000ff')
    expect(fromHsv({ h: 0, s: 2, v: -1 })).toBe('#000000')
  })
})

describe('oklch round trip', () => {
  it('preserves colors that are inside the sRGB gamut', () => {
    for (const hex of ['#6366f1', '#10b981', '#ef4444', '#0b0b0f', '#ffffff']) {
      expect(fromOklch(toOklch(hex))).toBe(hex)
    }
  })

  it('maps out-of-gamut chroma back into sRGB', () => {
    expect(fromOklch({ l: 0.7, c: 0.9, h: 150 })).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('contrast helpers', () => {
  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
  })

  it('always returns an accessible solid pair', () => {
    for (const bg of ['#0090ff', '#3e63dd', '#ffc53d', '#30a46c', '#f76b15', '#e5484d']) {
      const pair = accessibleSolid(bg)
      expect(contrastRatio(pair.background, pair.foreground)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('keeps colors that already pass', () => {
    expect(accessibleSolid('#3e63dd').background).toBe('#3e63dd')
  })

  it('nudges a foreground until it reaches the requested contrast', () => {
    const fixed = ensureContrast('#218358', '#e6f6eb', 4.5)
    expect(contrastRatio(fixed, '#e6f6eb')).toBeGreaterThanOrEqual(4.5)
    expect(ensureContrast('#000000', '#ffffff')).toBe('#000000')
    const onDark = ensureContrast('#3a3a3a', '#111113', 4.5)
    expect(contrastRatio(onDark, '#111113')).toBeGreaterThanOrEqual(4.5)
  })
})

describe('manipulation', () => {
  it('mixes perceptually', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('adjusts lightness and alpha', () => {
    expect(toOklch(adjustLightness('#6366f1', 0.1)).l).toBeGreaterThan(toOklch('#6366f1').l)
    expect(withAlpha('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)')
  })
})
