import type { ReactNode } from 'react'
import { XStack, YStack, isWeb } from 'tamagui'
import { plainText, sentences } from '../../utils/plainText'
import { Text } from '../typography/Text'
import { Label } from './Label'

export interface ChoiceText {
  /** Text beside the control. Pressing it checks the control. */
  label?: ReactNode
  /** Smaller text under the label. */
  description?: ReactNode
}

/** The accessibility props a control can set itself, which win over the texts. */
interface OwnProps {
  'aria-label'?: string
  'aria-describedby'?: string
  accessibilityHint?: string
}

const hasContent = (node: ReactNode) => node != null && node !== false && node !== ''

const textOf = (node: ReactNode) => (hasContent(node) ? plainText(node) || undefined : undefined)

/**
 * What a checkbox or radio takes from the label and description beside it. Web
 * links the description by id. Native has no links, so the control is named by
 * the label's text, and the description and its group's name and help text
 * (`groupHint`) are its hint.
 */
export function choiceProps(
  id: string,
  { label, description }: ChoiceText,
  own: OwnProps,
  groupHint?: string,
): OwnProps {
  if (isWeb) {
    const describedBy = [
      hasContent(description) ? `${id}-description` : '',
      own['aria-describedby'],
    ]
      .filter(Boolean)
      .join(' ')
    return describedBy ? { 'aria-describedby': describedBy } : {}
  }
  return {
    'aria-label': own['aria-label'] ?? textOf(label),
    accessibilityHint: own.accessibilityHint ?? sentences(textOf(description), groupHint),
  }
}

/** True when the control has a label or description to show beside it. */
export const hasChoiceText = ({ label, description }: ChoiceText) =>
  hasContent(label) || hasContent(description)

/**
 * A checkbox or radio (`children`) with its label and description beside it,
 * top-aligned so long labels wrap under themselves. Give the control the `id`
 * and `choiceProps`.
 */
export function ChoiceRow({
  id,
  label,
  description,
  disabled,
  children,
}: ChoiceText & { id: string; disabled?: boolean; children: ReactNode }) {
  // Native: the control already carries these texts as its name and hint.
  const hideLabel = !isWeb && textOf(label) !== undefined
  const hideDescription = !isWeb && textOf(description) !== undefined
  return (
    <XStack gap="2" alignItems="flex-start">
      {children}
      <YStack flexShrink={1} gap="0-5" opacity={disabled ? 0.6 : 1}>
        {hasContent(label) ? (
          <Label
            // Native: a disabled control is not registered to be focused, and
            // pressing a label that targets it logs a warning.
            htmlFor={!isWeb && disabled ? undefined : id}
            aria-hidden={hideLabel || undefined}
          >
            {label}
          </Label>
        ) : null}
        {hasContent(description) ? (
          <Text
            id={`${id}-description`}
            size="sm"
            tone="muted"
            aria-hidden={hideDescription || undefined}
          >
            {description}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  )
}

/** Style for the control in a ChoiceRow: it keeps its size and lines up with the label's first line. */
export const choiceControlStyle = (
  size: 'sm' | 'md',
): { flexShrink: number; marginTop?: '0.5' } =>
  size === 'sm' ? { flexShrink: 0, marginTop: '0.5' } : { flexShrink: 0 }
