import { composeEventHandlers } from '@advui/utils'
import { type ReactNode, forwardRef, useCallback, useId, useMemo } from 'react'
import {
  type GetProps,
  Form as TamaguiForm,
  type TamaguiElement,
  View,
  VisuallyHidden,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { FormContext, type FormContextValue, useParentForm } from '../../hooks/useParentForm'
import { isTextContent } from '../../utils/isTextContent'
import { LoadingButton, type LoadingButtonProps } from '../loading-button/LoadingButton'
import { Heading } from '../typography/Heading'
import { Text } from '../typography/Text'

export type FormDirection = 'vertical' | 'horizontal'

// Tamagui's Form renders `<form>` on web (submit events, Enter in a field) and
// a View on native, and feeds `onSubmit` to `Form.Trigger`.
const FormFrame = styled(TamaguiForm, {
  name: 'Form',
  flexDirection: 'column',
  gap: '$6',

  variants: {
    fullWidth: {
      true: { width: '100%', alignSelf: 'stretch' },
    },
  } as const,
})

const FormHeader = styled(View, {
  name: 'FormHeader',
  gap: '$1.5',
})

const FormContent = styled(View, {
  name: 'FormContent',
  flexDirection: 'column',

  variants: {
    horizontal: {
      // Bottom-aligned, so a button lines up with inputs that have a label above.
      true: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
    },
  } as const,
})

const FormFooter = styled(View, {
  name: 'FormFooter',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$2',

  variants: {
    fullWidth: {
      true: { flexDirection: 'column', alignItems: 'stretch' },
    },
  } as const,
})

type FrameProps = GetProps<typeof FormFrame>

export interface FormProps extends Omit<
  FrameProps,
  'children' | 'title' | 'direction' | 'gap' | 'onSubmit' | 'fullWidth'
> {
  /** Fields and anything else. The form does not change them. */
  children?: ReactNode
  /** Space between the fields. Default: `$4`. */
  gap?: GetProps<typeof FormContent>['gap']
  /** Text becomes a level-2 heading that names the form. Pass an element for another level. */
  title?: ReactNode
  /** Muted text under the title that describes the form. */
  description?: ReactNode
  /** Actions under the fields, e.g. Cancel and `Form.Submit`. */
  footer?: ReactNode
  /**
   * Called by `Form.Submit` and, on web, by Enter in a field. Not called while
   * `disabled` or `loading`. A returned Promise is not awaited: set `loading` yourself.
   */
  onSubmit?: () => void | Promise<unknown>
  /**
   * Disables the form controls inside (Input, Select, Checkbox…) and
   * `Form.Submit`, and blocks `onSubmit`. Other buttons stay enabled.
   */
  disabled?: boolean
  /** The app is submitting: `Form.Submit` shows a spinner and `onSubmit` is blocked. */
  loading?: boolean
  /** Replaces the `Form.Submit` label while loading, and is announced once on web. */
  loadingText?: ReactNode
  /** `vertical` stacks the fields; `horizontal` puts them in a wrapping row. */
  direction?: FormDirection
  /** Fills the container's width and stretches the footer actions to it. */
  fullWidth?: boolean
}

const hasContent = (node: ReactNode) => node != null && node !== false && node !== ''

const FormImpl = forwardRef<TamaguiElement, FormProps>(function Form(
  {
    children,
    gap = '$4',
    title,
    description,
    footer,
    onSubmit,
    disabled = false,
    loading = false,
    loadingText,
    direction = 'vertical',
    fullWidth = false,
    ...props
  },
  ref,
) {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const hasTitle = hasContent(title)
  const hasDescription = hasContent(description)

  const submit = useCallback(() => {
    // A second Enter or press while the app is saving must not submit twice.
    if (disabled || loading) return
    void onSubmit?.()
  }, [disabled, loading, onSubmit])

  const context = useMemo<FormContextValue>(
    () => ({ disabled, loading, loadingText, submit }),
    [disabled, loading, loadingText, submit],
  )

  return (
    <FormContext.Provider value={context}>
      <FormFrame
        ref={ref}
        fullWidth={fullWidth}
        onSubmit={submit}
        {...(isWeb && {
          // Validation belongs to the app, the same on every platform, so the
          // browser's own bubbles never block a submit.
          noValidate: true,
          // A named <form> is a landmark screen-reader users can jump to.
          'aria-labelledby': hasTitle ? titleId : undefined,
          'aria-describedby': hasDescription ? descriptionId : undefined,
        })}
        {...props}
      >
        {hasTitle || hasDescription ? (
          <FormHeader>
            {hasTitle ? (
              isTextContent(title) ? (
                <Heading id={titleId} level={2} size="xl">
                  {title}
                </Heading>
              ) : (
                <View id={titleId}>{title}</View>
              )
            ) : null}
            {hasDescription ? (
              isTextContent(description) ? (
                <Text id={descriptionId} size="sm" tone="muted">
                  {description}
                </Text>
              ) : (
                <View id={descriptionId}>{description}</View>
              )
            ) : null}
          </FormHeader>
        ) : null}
        <FormContent gap={gap} horizontal={direction === 'horizontal'}>
          {children}
        </FormContent>
        {hasContent(footer) ? <FormFooter fullWidth={fullWidth}>{footer}</FormFooter> : null}
        {isWeb && hasContent(loadingText) ? (
          // Polite and only filled while loading: one announcement per submit.
          // Native reads the busy Form.Submit instead.
          <VisuallyHidden role="status">{loading ? loadingText : null}</VisuallyHidden>
        ) : null}
      </FormFrame>
    </FormContext.Provider>
  )
})

export type FormSubmitProps = LoadingButtonProps

/**
 * The form's submit button: a LoadingButton that follows the form's
 * `loading`, `loadingText` and `disabled`. On web it is a submit button, so
 * Enter in a field submits too; on native pressing it calls `onSubmit`.
 */
const FormSubmit = forwardRef<TamaguiElement, FormSubmitProps>(function FormSubmit(
  { loading, loadingText, disabled = false, onPress, ...props },
  ref,
) {
  const form = useParentForm()
  return (
    <LoadingButton
      ref={ref}
      loading={loading ?? form.loading}
      loadingText={loadingText ?? form.loadingText}
      disabled={disabled || form.disabled}
      // Web: the browser submits the <form>. Native has no form element, so
      // the press submits.
      {...(isWeb
        ? { type: 'submit', onPress }
        : { onPress: composeEventHandlers(onPress ?? undefined, form.submit) })}
      {...props}
    />
  )
})

/**
 * Lays out a form: an optional title and description, the fields, and a
 * footer for actions. It adds structure and submit wiring only; field
 * state and validation stay with your app or form library.
 *
 * @example
 * <Form title="Create account" onSubmit={save} loading={saving} footer={<Form.Submit>Save</Form.Submit>}>
 *   <Field label="Email"><Input /></Field>
 * </Form>
 */
export const Form = withStaticProperties(FormImpl, {
  Submit: FormSubmit,
})
