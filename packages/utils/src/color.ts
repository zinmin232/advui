/**
 * Small, dependency-free color toolkit used by the theme generator and the
 * docs theme customizer. Perceptual operations (mixing, lightness changes)
 * happen in OKLab/OKLCH; contrast uses the WCAG 2.x relative-luminance formula.
 */

export type RGBA = { r: number; g: number; b: number; a: number }
export type OKLCH = { l: number; c: number; h: number; a: number }

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FN_RE = /^(rgba?|hsla?)\(\s*([^)]+)\)$/i

/** Parses hex, rgb[a]() and hsl[a]() strings into 0–255 RGB channels + 0–1 alpha. */
export function parseColor(input: string): RGBA | null {
  const value = input.trim()
  const hex = HEX_RE.exec(value)?.[1]
  if (hex) {
    const full =
      hex.length <= 4
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    const n = (i: number) => Number.parseInt(full.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 }
  }

  const fn = FN_RE.exec(value)
  if (!fn) return null
  const kind = fn[1]!.toLowerCase()
  const parts = fn[2]!
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) => part.trim())
  if (parts.length < 3) return null

  const num = (part: string, scale: number) =>
    part.endsWith('%') ? (Number.parseFloat(part) / 100) * scale : Number.parseFloat(part)
  const alpha = parts[3] === undefined ? 1 : clamp(num(parts[3], 1))

  if (kind.startsWith('rgb')) {
    const [r, g, b] = parts.slice(0, 3).map((p) => clamp(num(p, 255), 0, 255))
    if ([r, g, b].some((c) => Number.isNaN(c))) return null
    return { r: r!, g: g!, b: b!, a: alpha }
  }

  const h = Number.parseFloat(parts[0]!)
  const s = clamp(num(parts[1]!, 1) / (parts[1]!.endsWith('%') ? 1 : 100))
  const l = clamp(num(parts[2]!, 1) / (parts[2]!.endsWith('%') ? 1 : 100))
  if ([h, s, l].some((c) => Number.isNaN(c))) return null
  return { ...hslToRgb(h, s, l), a: alpha }
}

function hslToRgb(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 }
}

export function isValidColor(input: string): boolean {
  return parseColor(input) !== null
}

/** Formats a color as `#rrggbb` (or `#rrggbbaa` when translucent). */
export function toHex(color: RGBA | string): string {
  const rgba = typeof color === 'string' ? parseColor(color) : color
  if (!rgba) throw new Error(`Invalid color: ${String(color)}`)
  const h = (n: number) =>
    Math.round(clamp(n, 0, 255))
      .toString(16)
      .padStart(2, '0')
  const alpha = rgba.a < 1 ? h(rgba.a * 255) : ''
  return `#${h(rgba.r)}${h(rgba.g)}${h(rgba.b)}${alpha}`
}

/** Returns an `rgba()` string with the given alpha — works on web and native. */
export function withAlpha(color: string, alpha: number): string {
  const rgba = parseColor(color)
  if (!rgba) throw new Error(`Invalid color: ${color}`)
  const round = (n: number) => Math.round(n)
  return `rgba(${round(rgba.r)}, ${round(rgba.g)}, ${round(rgba.b)}, ${clamp(alpha)})`
}

// --- OKLab / OKLCH (Björn Ottosson) -------------------------------------------------

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

function rgbToOklab({ r, g, b }: RGBA) {
  const lr = toLinear(r / 255)
  const lg = toLinear(g / 255)
  const lb = toLinear(b / 255)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    A: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    B: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

function oklabToLinearRgb(L: number, A: number, B: number) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  }
}

export function toOklch(color: string | RGBA): OKLCH {
  const rgba = typeof color === 'string' ? parseColor(color) : color
  if (!rgba) throw new Error(`Invalid color: ${String(color)}`)
  const { L, A, B } = rgbToOklab(rgba)
  const c = Math.sqrt(A * A + B * B)
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c, h, a: rgba.a }
}

const inGamut = ({ r, g, b }: { r: number; g: number; b: number }) =>
  [r, g, b].every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** Converts OKLCH to hex, reducing chroma (keeping lightness + hue) until it fits sRGB. */
export function fromOklch({
  l,
  c,
  h,
  a = 1,
}: Partial<OKLCH> & { l: number; c: number; h: number }) {
  const L = clamp(l)
  const rad = (h * Math.PI) / 180
  const build = (chroma: number) =>
    oklabToLinearRgb(L, chroma * Math.cos(rad), chroma * Math.sin(rad))

  let rgb = build(c)
  if (!inGamut(rgb)) {
    let lo = 0
    let hi = c
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(build(mid))) lo = mid
      else hi = mid
    }
    rgb = build(lo)
  }
  return toHex({
    r: fromLinear(clamp(rgb.r)) * 255,
    g: fromLinear(clamp(rgb.g)) * 255,
    b: fromLinear(clamp(rgb.b)) * 255,
    a,
  })
}

/** Perceptual mix in OKLab. `amount` = 0 returns `a`, 1 returns `b`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = parseColor(a)
  const cb = parseColor(b)
  if (!ca || !cb) throw new Error(`Invalid color: ${!ca ? a : b}`)
  const la = rgbToOklab(ca)
  const lb = rgbToOklab(cb)
  const t = clamp(amount)
  const rgb = oklabToLinearRgb(
    la.L + (lb.L - la.L) * t,
    la.A + (lb.A - la.A) * t,
    la.B + (lb.B - la.B) * t,
  )
  return toHex({
    r: fromLinear(clamp(rgb.r)) * 255,
    g: fromLinear(clamp(rgb.g)) * 255,
    b: fromLinear(clamp(rgb.b)) * 255,
    a: ca.a + (cb.a - ca.a) * t,
  })
}

/** Shifts OKLCH lightness by `delta` (−1…1). */
export function adjustLightness(color: string, delta: number): string {
  const lch = toOklch(color)
  return fromOklch({ ...lch, l: lch.l + delta })
}

// --- WCAG contrast ---------------------------------------------------------------

export function relativeLuminance(color: string): number {
  const rgba = parseColor(color)
  if (!rgba) throw new Error(`Invalid color: ${color}`)
  return (
    0.2126 * toLinear(rgba.r / 255) +
    0.7152 * toLinear(rgba.g / 255) +
    0.0722 * toLinear(rgba.b / 255)
  )
}

/** WCAG 2.x contrast ratio between two opaque colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export type SolidPair = { background: string; foreground: string }

/**
 * Picks an accessible foreground for a solid surface. White text is preferred
 * (it reads as "brand" on colored buttons); very light colors get dark text;
 * mid-tones are darkened just enough to reach `minContrast` against white.
 */
export function accessibleSolid(
  background: string,
  {
    light = '#ffffff',
    dark = '#0b0b0f',
    minContrast = 4.5,
    darkTextThreshold = 8.5,
  }: { light?: string; dark?: string; minContrast?: number; darkTextThreshold?: number } = {},
): SolidPair {
  if (contrastRatio(background, light) >= minContrast) return { background, foreground: light }
  if (contrastRatio(background, dark) >= darkTextThreshold) return { background, foreground: dark }

  const lch = toOklch(background)
  let adjusted = background
  for (let l = lch.l; l > 0; l -= 0.01) {
    adjusted = fromOklch({ ...lch, l })
    if (contrastRatio(adjusted, light) >= minContrast) break
  }
  return { background: adjusted, foreground: light }
}

/**
 * Nudges `foreground`'s lightness away from `background` (keeping hue and
 * chroma) until the pair reaches `minContrast`. Returns the input unchanged
 * when it already passes.
 */
export function ensureContrast(foreground: string, background: string, minContrast = 4.5): string {
  if (contrastRatio(foreground, background) >= minContrast) return foreground
  const fg = toOklch(foreground)
  const direction = relativeLuminance(background) > 0.18 ? -1 : 1
  let candidate = foreground
  for (let step = 1; step <= 100; step++) {
    candidate = fromOklch({ ...fg, l: fg.l + direction * step * 0.01 })
    if (contrastRatio(candidate, background) >= minContrast) return candidate
  }
  return candidate
}

/** Returns whichever of `light` / `dark` has more contrast against `background`. */
export function readableForeground(
  background: string,
  light = '#ffffff',
  dark = '#0b0b0f',
): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark
}
