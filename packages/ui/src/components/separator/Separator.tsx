import type { ReactNode } from 'react'
import { type GetProps, View, isWeb, styled } from 'tamagui'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

const SeparatorFrame = styled(View, {
  name: 'Separator',
  backgroundColor: '$border',
  flexShrink: 0,

  variants: {
    orientation: {
      horizontal: { height: 1, width: '100%' },
      vertical: { width: 1, alignSelf: 'stretch' },
    },
  } as const,

  defaultVariants: { orientation: 'horizontal' },
})

/** The row that holds the two lines and the label. */
const LabelledFrame = styled(View, {
  name: 'SeparatorLabelled',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$3',
  width: '100%',
})

/** One line of a labelled separator; `short` is the 16px end at the start or end. */
const Line = styled(View, {
  name: 'SeparatorLine',
  height: 1,
  backgroundColor: '$border',

  variants: {
    short: {
      true: { width: '$4', flexShrink: 0 },
      false: { flexGrow: 1, flexBasis: 0 },
    },
  } as const,

  defaultVariants: { short: false },
})

export type SeparatorLabelPosition = 'start' | 'center' | 'end'

export type SeparatorProps = Omit<GetProps<typeof SeparatorFrame>, 'children'> & {
  /**
   * Purely visual separators are hidden from assistive technology (default).
   * Set `false` when the line separates meaningful sections.
   */
  decorative?: boolean
  /** Text between two lines, such as "or". Horizontal separators only. */
  label?: string
  /** Where the label sits. Default `center`. */
  labelPosition?: SeparatorLabelPosition
  /** Richer content in place of `label`. Text is styled like the label. */
  children?: ReactNode
}

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

let warnedVertical = false

/** A thin line that visually (and optionally semantically) divides content. */
export function Separator({
  decorative = true,
  orientation = 'horizontal',
  label,
  labelPosition = 'center',
  children,
  ...props
}: SeparatorProps) {
  const content = children ?? label
  const hasContent = content !== undefined && content !== null && content !== ''

  if (hasContent && orientation === 'vertical') {
    if (process.env.NODE_ENV !== 'production' && !warnedVertical) {
      warnedVertical = true
      console.warn('Separator: a label needs orientation="horizontal"; it is ignored here.')
    }
  }

  if (!hasContent || orientation === 'vertical') {
    return (
      <SeparatorFrame
        orientation={orientation}
        {...(decorative
          ? { 'aria-hidden': true, role: 'none' as const }
          : { role: 'separator' as const, 'aria-orientation': orientation ?? 'horizontal' })}
        {...props}
      />
    )
  }

  // The lines are decoration either way. A decorative separator leaves its
  // label as plain text; a semantic one is a named separator, read once.
  const name = label ?? (isTextContent(content) ? [content].flat().join('') : undefined)
  return (
    <LabelledFrame
      {...(decorative
        ? null
        : {
            role: 'separator' as const,
            'aria-orientation': 'horizontal' as const,
            'aria-label': name,
            // Native: one element named by the label, not three.
            ...(isWeb ? null : { accessible: true }),
          })}
      {...props}
    >
      <Line short={labelPosition === 'start'} aria-hidden />
      {isTextContent(content) ? (
        <Text size="sm" tone="muted" flexShrink={1} textAlign="center">
          {content}
        </Text>
      ) : (
        content
      )}
      <Line short={labelPosition === 'end'} aria-hidden />
    </LabelledFrame>
  )
}
