import { type GetProps, Text as TamaguiText, createStyledHOC, isWeb, styled } from 'tamagui/unstyled'

const tones = {
  default: { color: 'foreground' },
  muted: { color: 'mutedForeground' },
  primary: { color: 'primaryText' },
  success: { color: 'successSoftForeground' },
  warning: { color: 'warningSoftForeground' },
  error: { color: 'errorSoftForeground' },
  info: { color: 'infoSoftForeground' },
  inherit: {},
} as const

/** The type scale, shared with Link so its sizes match. */
export const textSizes = {
  xs: { fontSize: '1', lineHeight: '1' },
  sm: { fontSize: '2', lineHeight: '2' },
  base: { fontSize: '3', lineHeight: '3' },
  lg: { fontSize: '4', lineHeight: '4' },
  xl: { fontSize: '5', lineHeight: '5' },
  '2xl': { fontSize: '6', lineHeight: '6' },
  '3xl': { fontSize: '7', lineHeight: '7' },
  '4xl': { fontSize: '8', lineHeight: '8' },
  '5xl': { fontSize: '9', lineHeight: '9' },
  '6xl': { fontSize: '10', lineHeight: '10' },
} as const

export const textWeights = {
  normal: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
} as const

const TextFrame = styled(TamaguiText, {
  displayName: 'Text',
  fontFamily: 'body',
  color: 'foreground',
  variants: {
    size: textSizes,
    weight: textWeights,
    tone: tones,
    // Web: one line with an ellipsis, in CSS. Native has no style for it
    // (`ellipsis` and `numberOfLines` are props there), so Text sets the props.
    truncate: {
      true: isWeb ? { ellipsis: true } : {},
    },
    mono: {
      true: {
        fontFamily: 'mono',
      },
    },
  } as const,
  defaultVariants: {
    size: 'base',
  },
})

/** Body text. Sizes follow the type scale; `tone` maps to semantic theme colors. */
export const Text = createStyledHOC(
  TextFrame,
  function Text(props: GetProps<typeof TextFrame>, ref) {
    // A Tamagui 3 variant holds styles only, so `truncate` cannot set
    // `numberOfLines` itself.
    return (
      <TextFrame
        ref={ref}
        {...(!isWeb && props.truncate && { numberOfLines: 1, ellipsizeMode: 'tail' })}
        {...props}
      />
    )
  },
)

export type TextProps = GetProps<typeof Text>
export type TextSize = keyof typeof textSizes
export type TextTone = keyof typeof tones
