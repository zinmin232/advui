import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type SpaceTokens,
  type TamaguiElement,
  Theme,
  View,
  getConfig,
} from 'tamagui'
import {
  type Breakpoint,
  type Responsive,
  breakpointKeys,
  responsiveValue,
} from '../../utils/responsive'
import { Container, type ContainerProps } from '../layout/Container'

export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type SectionBackground =
  'none' | 'background' | 'card' | 'muted' | 'primary' | 'primarySoft' | 'inverse'
export type SectionContainer = NonNullable<ContainerProps['size']> | 'none'

/** Vertical padding of each spacing step: on phones, and from md. */
const spacingScale: Record<SectionSpacing, [SpaceTokens, SpaceTokens]> = {
  none: ['$0', '$0'],
  sm: ['$6', '$8'],
  md: ['$12', '$16'],
  lg: ['$16', '$24'],
  xl: ['$24', '$32'],
}

const fromMd = breakpointKeys.indexOf('md')

type PaddingStyle = { paddingVertical?: SpaceTokens } & Partial<
  Record<`$${Breakpoint}`, { paddingVertical: SpaceTokens }>
>

/**
 * Vertical padding for a spacing value or map. Each step grows at md, so the
 * padding at a breakpoint depends on both the step that applies there and
 * whether it is md or wider; only the breakpoints where it changes are emitted.
 */
export function sectionPadding(spacing: Responsive<SectionSpacing>): PaddingStyle {
  const style: PaddingStyle = {}
  let step: SectionSpacing = 'md'
  let current: SpaceTokens | undefined
  for (const [index, key] of (['base', ...breakpointKeys] as const).entries()) {
    step = responsiveValue(spacing, key) ?? step
    const padding = spacingScale[step][index - 1 >= fromMd ? 1 : 0]
    if (padding === current) continue
    current = padding
    if (key === 'base') style.paddingVertical = padding
    else style[`$${key}`] = { paddingVertical: padding }
  }
  return style
}

type SubTheme = 'primary' | 'inverse'

/**
 * Configs from `createUniversalConfig` have the sub-themes; a hand-built one
 * may not, and Tamagui's missing-theme warning crashes on native. Without
 * them, the band keeps the colors it can: the surface (`$primary`) or none.
 */
function hasSubTheme(name: SubTheme) {
  const themes = getConfig().themes as Record<string, unknown>
  return `light_${name}` in themes && `dark_${name}` in themes
}

const surfaces: Record<SectionBackground, { theme?: SubTheme; color?: string; fallback?: string }> =
  {
    none: {},
    background: { color: '$background' },
    card: { color: '$card' },
    muted: { color: '$muted' },
    primarySoft: { color: '$primarySoft' },
    // These change the text color too: the sub-theme's `$background` is the
    // surface and its `$foreground` reads on it, in light and dark mode.
    primary: { theme: 'primary', color: '$background', fallback: '$primary' },
    inverse: { theme: 'inverse', color: '$background' },
  }

export interface SectionProps extends Omit<GetProps<typeof View>, 'children'> {
  /** Vertical padding, a step or a mobile-first map. Default `md`. */
  spacing?: Responsive<SectionSpacing>
  /** The surface. `primary` and `inverse` switch to a sub-theme, so text stays readable. */
  background?: SectionBackground
  /** Wraps the children in a Container of this size; `none` doesn't. Default `xl`. */
  container?: SectionContainer
  children?: ReactNode
}

/**
 * A band of a page: a `<section>` on web with vertical padding, a surface and
 * a Container. Name it with `aria-labelledby` (its heading's id) or
 * `aria-label` so it is a region landmark, and give it an `id` for anchor
 * links such as `#features`.
 */
export const Section = forwardRef<TamaguiElement, SectionProps>(function Section(
  { spacing = 'md', background = 'none', container = 'xl', children, ...props },
  ref,
) {
  const preferred = surfaces[background]
  const surface =
    preferred.theme && !hasSubTheme(preferred.theme) ? { color: preferred.fallback } : preferred
  const content =
    container === 'none' ? children : <Container size={container}>{children}</Container>
  const section = (
    <View
      ref={ref}
      render="section"
      width="100%"
      {...(surface.color ? { backgroundColor: surface.color as never } : null)}
      {...sectionPadding(spacing)}
      {...props}
    >
      {content}
    </View>
  )
  return surface.theme ? <Theme name={surface.theme}>{section}</Theme> : section
})
