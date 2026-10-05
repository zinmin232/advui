import { type ReactNode, createContext, useContext } from 'react'

export interface FormContextValue {
  /** The form does not accept input. Form controls and Form.Submit follow it. */
  disabled: boolean
  /** The app is submitting the form. The app owns this state; the form only shows it. */
  loading: boolean
  /** What the form says while loading, e.g. "Saving…". */
  loadingText?: ReactNode
  /** Calls the form's `onSubmit`, unless it is disabled or loading. Does nothing outside a Form. */
  submit: () => void
}

const outsideForm: FormContextValue = { disabled: false, loading: false, submit: () => {} }

/** Set by Form; read by the controls inside it. */
export const FormContext = createContext<FormContextValue>(outsideForm)

/**
 * The surrounding Form, for your own fields and actions: a custom submit
 * button calls `submit`, a custom control follows `disabled`. Not named
 * `useFormStatus`, so it is not mistaken for React DOM's hook of that name.
 */
export function useParentForm(): FormContextValue {
  return useContext(FormContext)
}

/** @deprecated Renamed to `useParentForm`. This alias will be removed in a future release. */
export const useFormStatus = useParentForm
/** @deprecated Renamed to `FormContextValue`. */
export type FormStatus = FormContextValue
