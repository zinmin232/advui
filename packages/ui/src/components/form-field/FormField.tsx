import { type ReactElement, type ReactNode, cloneElement, forwardRef, useId } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { Label } from '../label/Label'
import { Text } from '../typography/Text'

const FormFieldFrame = styled(View, {
  name: 'FormField',
  gap: '$2',
})

type ControlProps = {
  id?: string
  invalid?: boolean
  disabled?: boolean
  'aria-describedby'?: string
  'aria-required'?: boolean
  'aria-label'?: string
  accessibilityHint?: string
}

export interface FormFieldProps extends Omit<GetProps<typeof FormFieldFrame>, 'children'> {
  /** Visible label, linked to the control. */
  label: ReactNode
  /** Help text under the control. */
  description?: ReactNode
  /** Error message. Shows under the control and marks it invalid. */
  error?: ReactNode
  /** Adds a required marker to the label and `aria-required` to the control. */
  required?: boolean
  /** Dims the label and disables the control. */
  disabled?: boolean
  /** One control: Input, Textarea, Password Input, Number Input… */
  children: ReactElement<ControlProps>
}

/**
 * Label, control, help text and error message wired together: the label
 * targets the control, and the help and error text describe it.
 */
export const FormField = forwardRef<TamaguiElement, FormFieldProps>(function FormField(
  { label, description, error, required = false, disabled = false, children, ...props },
  ref,
) {
  const generatedId = useId()
  const id = children.props.id ?? generatedId
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const hasError = error != null && error !== false
  const describedBy = [hasError ? errorId : '', description ? descriptionId : '']
    .filter(Boolean)
    .join(' ')

  // Only set what the field decides, so the control's own defaults stay intact.
  const control = cloneElement(children, {
    id,
    ...(hasError && { invalid: true }),
    ...(disabled && { disabled: true }),
    ...(required && { 'aria-required': true }),
    // Native: a Label's htmlFor only moves focus, so name the control directly.
    ...(!isWeb &&
      typeof label === 'string' &&
      children.props['aria-label'] === undefined && { 'aria-label': label }),
    ...(describedBy &&
      (isWeb
        ? { 'aria-describedby': describedBy }
        : // Native has no aria-describedby; the hint is read after the label.
          {
            accessibilityHint: [error, description].filter((t) => typeof t === 'string').join(' '),
          })),
  })

  return (
    <FormFieldFrame ref={ref} {...props}>
      <Label htmlFor={id} required={required} disabled={disabled}>
        {label}
      </Label>
      {control}
      {description ? (
        <Text id={descriptionId} size="sm" tone="muted">
          {description}
        </Text>
      ) : null}
      {hasError ? (
        <Text id={errorId} size="sm" tone="error">
          {error}
        </Text>
      ) : null}
    </FormFieldFrame>
  )
})
