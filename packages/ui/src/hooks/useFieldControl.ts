import { createContext, useContext } from 'react'
import { isWeb } from 'tamagui'

/** What a Field tells the control inside it. */
export interface FieldState {
  /** The control's id; the field's label targets it. */
  id: string
  /** The label's id, for controls a `<label for>` cannot name, such as a radio group. */
  labelId?: string
  /** The label's text: the control's name on native. */
  label?: string
  /** Ids of the error and help text (web). */
  describedBy?: string
  /** The text of the error and help text: the control's hint on native. */
  hint?: string
  invalid: boolean
  required: boolean
  disabled: boolean
}

/** Set by Field. A control that renders other controls inside resets it to null for them. */
export const FieldContext = createContext<FieldState | null>(null)

/** The props a Field sets on its control. The core form controls all accept them. */
export interface FieldControlProps {
  id?: string
  invalid?: boolean
  disabled?: boolean
  'aria-describedby'?: string
  'aria-required'?: boolean | 'true' | 'false'
  'aria-label'?: string
  accessibilityHint?: string
}

const joinIds = (...lists: Array<string | undefined>) =>
  [...new Set(lists.join(' ').split(' ').filter(Boolean))].join(' ')

/**
 * Fills in what the surrounding Field decides: the id its label targets,
 * `invalid`, `disabled`, `aria-required`, and the links to its help and error
 * text. The control's own props win, `invalid` and `disabled` add up, and
 * outside a Field the props come back unchanged. Call it in your own controls
 * so a Field wires them like the core ones.
 */
export function useFieldControl<P extends FieldControlProps>(props: P): P {
  const field = useContext(FieldContext)
  if (!field) return props
  // Joined without repeats, so a control that passes the result on to an inner
  // control (Password Input to Input) gets the same props a second time.
  const describedBy = joinIds(props['aria-describedby'], field.describedBy)
  return {
    ...props,
    id: props.id ?? field.id,
    ...((field.invalid || props.invalid) && { invalid: true }),
    ...((field.disabled || props.disabled) && { disabled: true }),
    ...(field.required && props['aria-required'] === undefined && { 'aria-required': true }),
    ...(isWeb
      ? describedBy && { 'aria-describedby': describedBy }
      : {
          // A Label's htmlFor only moves focus on native, so the field names the
          // control. Native has no aria-describedby: the texts are the hint.
          ...(props['aria-label'] === undefined &&
            field.label !== undefined && { 'aria-label': field.label }),
          ...(props.accessibilityHint === undefined &&
            field.hint !== undefined && { accessibilityHint: field.hint }),
        }),
  }
}
