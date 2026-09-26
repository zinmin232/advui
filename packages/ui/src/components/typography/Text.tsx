import { type GetProps, Text as TamaguiText, styled } from 'tamagui'

const tones = {
  default: { color: '$foreground' },
  muted: { color: '$mutedForeground' },
  primary: { color: '$primaryText' },
  success: { color: '$successSoftForeground' },
  warning: { color: '$warningSoftForeground' },
  error: { color: '$errorSoftForeground' },
  info: { color: '$infoSoftForeground' },
  inherit: {},
} as const

const sizes = {
  xs: { fontSize: '$1', lineHeight: '$1' },
  sm: { fontSize: '$2', lineHeight: '$2' },
  base: { fontSize: '$3', lineHeight: '$3' },
  lg: { fontSize: '$4', lineHeight: '$4' },
  xl: { fontSize: '$5', lineHeight: '$5' },
  '2xl': { fontSize: '$6', lineHeight: '$6' },
  '3xl': { fontSize: '$7', lineHeight: '$7' },
  '4xl': { fontSize: '$8', lineHeight: '$8' },
  '5xl': { fontSize: '$9', lineHeight: '$9' },
  '6xl': { fontSize: '$10', lineHeight: '$10' },
} as const

const weights = {
  normal: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
} as const

/** Body text. Sizes follow the type scale; `tone` maps to semantic theme colors. */
export const Text = styled(TamaguiText, {
  name: 'Text',
  fontFamily: '$body',
  color: '$foreground',

  variants: {
    size: sizes,
    weight: weights,
    tone: tones,
    truncate: {
      true: { numberOfLines: 1, ellipsis: true },
    },
    mono: {
      true: { fontFamily: '$mono' },
    },
  } as const,

  defaultVariants: {
    size: 'base',
  },
})

export type TextProps = GetProps<typeof Text>
export type TextSize = keyof typeof sizes
export type TextTone = keyof typeof tones
