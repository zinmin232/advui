import { forwardRef } from 'react'
import type { TamaguiTextElement } from 'tamagui'
import { Text, type TextProps, type TextSize } from './Text'

type Level = 1 | 2 | 3 | 4 | 5 | 6

const defaultSizes: Record<Level, TextSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'base',
}

export type HeadingProps = TextProps & {
  /** Semantic level (h1–h6). Visual size can be changed independently with `size`. */
  level?: Level
}

/**
 * Semantic heading: renders `<h1>`–`<h6>` on web and exposes the `header`
 * role with its level to VoiceOver/TalkBack on native.
 */
export const Heading = forwardRef<TamaguiTextElement, HeadingProps>(function Heading(
  { level = 2, size, weight = 'semibold', ...props },
  ref,
) {
  return (
    <Text
      ref={ref}
      role="heading"
      aria-level={level}
      render={`h${level}`}
      fontFamily="$heading"
      size={size ?? defaultSizes[level]}
      weight={weight}
      margin={0}
      {...props}
    />
  )
})
