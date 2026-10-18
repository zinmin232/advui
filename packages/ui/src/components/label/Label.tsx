import { forwardRef } from 'react'
import {
  type GetProps,
  Label as TamaguiLabel,
  type TamaguiTextElement,
  Text,
  isWeb,
  styled,
} from 'tamagui'
import { usePublishLabel } from '../../hooks/useLabelFor'
import { plainText } from '../../utils/plainText'

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
 * toggles the linked control, and the label's text is the control's name.
 */
export const Label = forwardRef<TamaguiTextElement, LabelProps>(function Label(
  { required, children, ...props },
  ref,
) {
  // Native: a control without a name of its own takes this text as its name,
  // and the label is then hidden from screen readers so it is not read twice.
  // A control finds it by its own id (`htmlFor`), or by this label's id when
  // the control uses `aria-labelledby`, which iOS ignores.
  const text = plainText(children) || undefined
  const namedFor = usePublishLabel(isWeb ? undefined : props.htmlFor, text)
  const namedById = usePublishLabel(isWeb ? undefined : props.id, text)
  const named = namedFor || namedById
  return (
    <LabelFrame ref={ref} {...props} aria-hidden={props['aria-hidden'] ?? (named || undefined)}>
      {children}
      {required ? <RequiredMark aria-hidden> *</RequiredMark> : null}
    </LabelFrame>
  )
})
