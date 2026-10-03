import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, TextArea, isWeb, styled } from 'tamagui'
import { useFieldControl } from '../../hooks/useFieldControl'
import { inputBaseStyle } from '../input/Input'

const TextareaFrame = styled(TextArea, {
  name: 'Textarea',
  ...inputBaseStyle,
  minHeight: '$20',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  fontSize: '$2',
  lineHeight: '$2',
  textAlignVertical: 'top',

  variants: {
    invalid: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
        focusStyle: { borderColor: '$error' },
        focusVisibleStyle: { outlineColor: '$error' },
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
    resize: {
      none: { resize: 'none' },
      vertical: { resize: 'vertical' },
    },
  } as const,

  defaultVariants: { resize: 'vertical' },
})

export type TextareaProps = GetProps<typeof TextareaFrame>

/** Multi-line text field. Grows with `rows`/`minHeight`; set `invalid` for errors. */
export const Textarea = forwardRef<TamaguiElement, TextareaProps>(
  function Textarea(textareaProps, ref) {
    const { invalid, disabled, ...props } = useFieldControl(textareaProps)
    return (
      <TextareaFrame
        ref={ref}
        invalid={invalid}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-disabled={disabled || undefined}
        // Native: `disabled` stops at the variant above and never reaches the
        // TextInput through Tamagui's TextArea, which stayed editable.
        {...(!isWeb && disabled && { readOnly: true })}
        multiline
        {...props}
      />
    )
  },
)
