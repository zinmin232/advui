import { type ReactNode, forwardRef, isValidElement, useId, useMemo } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { FieldContext, type FieldState } from '../../hooks/useFieldControl'
import { useFormStatus } from '../../hooks/useFormStatus'
import { Label } from '../label/Label'
import { Text } from '../typography/Text'

export type FieldOrientation = 'vertical' | 'horizontal'

const FieldFrame = styled(View, {
  name: 'Field',
  gap: '$2',

  variants: {
    fullWidth: {
      true: { width: '100%', alignSelf: 'stretch' },
    },
  } as const,
})

// Horizontal fields: the label is centered on the control beside it, and the
// help and error text line up under the control.
const FieldRow = styled(View, {
  name: 'FieldRow',
  flexDirection: 'row',
  alignItems: 'center',
  columnGap: '$4',
})

const FieldLabelColumn = styled(View, {
  name: 'FieldLabelColumn',
  // A share of the width, so the controls of stacked fields line up.
  width: '33%',
  flexShrink: 0,
})

const FieldControlColumn = styled(View, {
  name: 'FieldControlColumn',
  flex: 1,
  minWidth: 0,
})

type FrameProps = GetProps<typeof FieldFrame>

export interface FieldProps extends Omit<FrameProps, 'children' | 'id' | 'gap' | 'fullWidth'> {
  /** Visible label, linked to the control. Without one, give the control an `aria-label`. */
  label?: ReactNode
  /** Help text under the control. */
  description?: ReactNode
  /** Error message under the help text. It marks the control invalid. */
  error?: ReactNode
  /** Adds a required marker to the label and `aria-required` to the control. */
  required?: boolean
  /** Adds "(optional)" to the label. Ignored when `required` is set. */
  optional?: boolean
  /** The text `optional` adds. */
  optionalText?: string
  /** Dims the label and disables the control. Also on while the surrounding Form is disabled. */
  disabled?: boolean
  /** `horizontal` puts the label beside the control. */
  orientation?: FieldOrientation
  /** Space between the label, control and messages. */
  gap?: FrameProps['gap']
  /** Fills the container's width. */
  fullWidth?: boolean
  /** The control's id, which the label targets. Defaults to the child's own `id`, or a generated one. */
  id?: string
  /** The control: Input, Select, Checkbox… or a layout with one control in it. */
  children: ReactNode
}

const hasContent = (node: ReactNode) => node != null && node !== false && node !== ''

// The text inside a node, like a browser's accessible name: native has no
// aria-labelledby or aria-describedby, so the field passes text instead.
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

const plainText = (node: ReactNode) => textOf(node).replace(/\s+/g, ' ').trim()

/**
 * Label, control, help text and error message wired together. The field tells
 * the control inside it (through context, at any depth) its id, its invalid,
 * disabled and required state, and which texts describe it. Validation stays
 * with your app or form library.
 */
export const Field = forwardRef<TamaguiElement, FieldProps>(function Field(
  {
    label,
    description,
    error,
    required = false,
    optional = false,
    optionalText = '(optional)',
    disabled: disabledProp = false,
    orientation = 'vertical',
    gap = '$2',
    fullWidth = false,
    id: idProp,
    children,
    ...props
  },
  ref,
) {
  const form = useFormStatus()
  const disabled = disabledProp || form.disabled
  const generatedId = useId()
  // A single control's own id is kept, so the label targets it.
  const childId =
    isValidElement<{ id?: unknown }>(children) && typeof children.props.id === 'string'
      ? children.props.id
      : undefined
  const id = idProp ?? childId ?? generatedId
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const hasLabel = hasContent(label)
  const hasDescription = hasContent(description)
  const hasError = hasContent(error)
  const showOptional = optional && !required

  const state = useMemo<FieldState>(() => {
    const describedBy = [hasError ? errorId : '', hasDescription ? descriptionId : '']
      .filter(Boolean)
      .join(' ')
    const labelText = plainText(label)
    const hint = [hasError ? plainText(error) : '', plainText(description)]
      .filter(Boolean)
      .join(' ')
    return {
      id,
      labelId: hasLabel ? labelId : undefined,
      label: labelText ? (showOptional ? `${labelText} ${optionalText}` : labelText) : undefined,
      describedBy: describedBy || undefined,
      hint: hint || undefined,
      invalid: hasError,
      required,
      disabled,
    }
  }, [
    id,
    labelId,
    descriptionId,
    errorId,
    label,
    hasLabel,
    description,
    hasDescription,
    error,
    hasError,
    showOptional,
    optionalText,
    required,
    disabled,
  ])

  const labelNode = hasLabel ? (
    <Label
      id={labelId}
      htmlFor={id}
      required={required}
      disabled={disabled}
      // Native: the control already carries a text label as its name. Read
      // again, Android splits it into stray buttons ("Email", "*", "(optional)").
      aria-hidden={(!isWeb && state.label !== undefined) || undefined}
    >
      {label}
      {showOptional ? (
        <>
          {' '}
          <Text size="sm" tone="muted" weight="normal">
            {optionalText}
          </Text>
        </>
      ) : null}
    </Label>
  ) : null
  // Always Text, so mixed content like `<>Revoked. <Text>Make a new one.</Text></>` works on native.
  const descriptionNode = hasDescription ? (
    <Text id={descriptionId} size="sm" tone="muted">
      {description}
    </Text>
  ) : null
  const errorNode = hasError ? (
    <Text id={errorId} size="sm" tone="error">
      {error}
    </Text>
  ) : null

  return (
    <FieldContext.Provider value={state}>
      <FieldFrame ref={ref} gap={gap} fullWidth={fullWidth} {...props}>
        {orientation === 'horizontal' ? (
          <>
            <FieldRow>
              <FieldLabelColumn>{labelNode}</FieldLabelColumn>
              <FieldControlColumn>{children}</FieldControlColumn>
            </FieldRow>
            {descriptionNode || errorNode ? (
              <FieldRow alignItems="flex-start">
                <FieldLabelColumn />
                <FieldControlColumn gap={gap}>
                  {descriptionNode}
                  {errorNode}
                </FieldControlColumn>
              </FieldRow>
            ) : null}
          </>
        ) : (
          <>
            {labelNode}
            {children}
            {descriptionNode}
            {errorNode}
          </>
        )}
      </FieldFrame>
    </FieldContext.Provider>
  )
})

/** @deprecated Renamed to `Field`. This alias will be removed in a future release. */
export const FormField = Field
/** @deprecated Renamed to `FieldProps`. */
export type FormFieldProps = FieldProps
