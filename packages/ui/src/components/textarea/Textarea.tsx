import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, TextArea, isWeb, styled } from 'tamagui/unstyled'
import { useFieldControl, type ControlStateProps } from '../../hooks/useFieldControl'
import { inputBaseStyle } from '../input/Input'
import { ariaState } from '../../utils/ariaState'

const TextareaFrame = styled(TextArea, {
  displayName: 'Textarea',
  ...inputBaseStyle,
  minHeight: '20',
  paddingHorizontal: '3',
  paddingVertical: '2',
  fontSize: '2',
  lineHeight: '2',
  textAlignVertical: 'top',
  variants: {
    invalid: {
      true: {
        borderColor: 'error hover:error focus:error',
        outlineColor: 'focus-visible:error',
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

export type TextareaProps = Omit<GetProps<typeof TextareaFrame>, 'disabled' | 'invalid'> &
  ControlStateProps

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
        aria-disabled={ariaState(disabled)}
        // Native: `disabled` stops at the variant above and never reaches the
        // TextInput through Tamagui's TextArea, which stayed editable.
        {...(!isWeb && disabled && { readOnly: true })}
        multiline
        // Tamagui 3 fixes the height at `rows` times its guess of the line
        // height; auto lets `rows` and `minHeight` size it, as before.
        height="auto"
        {...props}
      />
    )
  },
)
