import { forwardRef } from 'react'
import {
  type GetProps,
  Label as TamaguiLabel,
  type TamaguiTextElement,
  Text,
  styled,
} from 'tamagui'

const LabelFrame = styled(TamaguiLabel, {
  name: 'Label',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  fontWeight: '500',
  color: '$foreground',
  height: 'auto',
  paddingHorizontal: 0,
  cursor: 'default',
  userSelect: 'none',

  variants: {
    disabled: {
      true: { opacity: 0.6 },
    },
  } as const,
})

const RequiredMark = styled(Text, {
  name: 'LabelRequired',
  color: '$error',
  fontSize: '$2',
})

export type LabelProps = GetProps<typeof LabelFrame> & {
  /** Appends a visual required marker (screen readers get `required` from the input). */
  required?: boolean
}

/**
 * Accessible label. Link it to a control with `htmlFor` = the control's `id`.
 * On web this renders `<label for>`; on native, pressing the label focuses or
 * toggles the linked control.
 */
export const Label = forwardRef<TamaguiTextElement, LabelProps>(function Label(
  { required, children, ...props },
  ref,
) {
  return (
    <LabelFrame ref={ref} {...props}>
      {children}
      {required ? <RequiredMark aria-hidden> *</RequiredMark> : null}
    </LabelFrame>
  )
})
