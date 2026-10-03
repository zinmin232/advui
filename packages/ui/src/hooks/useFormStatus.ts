import { type ReactNode, createContext, useContext } from 'react'

export interface FormStatus {
  /** The form does not accept input. Field and Form.Submit follow it. */
  disabled: boolean
  /** The app is submitting the form. The app owns this state; the form only shows it. */
  loading: boolean
  /** What the form says while loading, e.g. "Saving…". */
  loadingText?: ReactNode
  /** Calls the form's `onSubmit`, unless it is disabled or loading. Does nothing outside a Form. */
  submit: () => void
}

const outsideForm: FormStatus = { disabled: false, loading: false, submit: () => {} }

/** Set by Form; read by the controls inside it. */
export const FormStatusContext = createContext<FormStatus>(outsideForm)

/**
 * The status of the surrounding Form, for your own fields and actions: a
 * custom submit button calls `submit`, a custom control follows `disabled`.
 */
export function useFormStatus(): FormStatus {
  return useContext(FormStatusContext)
}
