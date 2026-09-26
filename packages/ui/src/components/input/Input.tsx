import { forwardRef } from 'react'
import { type GetProps, Input as TamaguiInput, type TamaguiElement, styled } from 'tamagui'

/** Box styles shared by text fields and field-like triggers (Select). */
export const fieldBoxStyle = {
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$input',
  borderRadius: '$md',
  // No `transition` on fields: the native animation driver would pass animated
  // style objects to TextInput, which Android rejects.
  hoverStyle: { borderColor: '$borderStrong' },
  focusStyle: { borderColor: '$ring' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 0,
  },
} as const

export const inputBaseStyle = {
  ...fieldBoxStyle,
  fontFamily: '$body',
  color: '$foreground',
  placeholderTextColor: '$placeholderColor',
} as const

const InputFrame = styled(TamaguiInput, {
  name: 'Input',
  ...inputBaseStyle,

  variants: {
    size: {
      sm: { height: '$8', paddingHorizontal: '$2.5', fontSize: '$2' },
      md: { height: '$10', paddingHorizontal: '$3', fontSize: '$2' },
      lg: { height: '$12', paddingHorizontal: '$4', fontSize: '$3' },
    },
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
  } as const,

  defaultVariants: { size: 'md' },
})

export type InputProps = GetProps<typeof InputFrame>

/**
 * Single-line text field (`<input>` on web, `TextInput` on native).
 * Set `invalid` to mark errors — it sets `aria-invalid` and the error color.
 */
export const Input = forwardRef<TamaguiElement, InputProps>(function Input(
  { invalid, disabled, ...props },
  ref,
) {
  return (
    <InputFrame
      ref={ref}
      invalid={invalid}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      {...props}
    />
  )
})
