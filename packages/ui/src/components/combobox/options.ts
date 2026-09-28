import type { ReactNode } from 'react'

export interface ComboboxOption {
  value: string
  label: string
  /** Second line under the label. */
  description?: string
  disabled?: boolean
}

export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean

/** Case- and accent-insensitive "contains" on the label. */
export const defaultFilter: ComboboxFilter = (option, query) =>
  normalize(option.label).includes(normalize(query))

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Everything Combobox, Autocomplete and Multi Select tell the shared field.
 * The field owns only open state and the highlighted option.
 */
export interface ComboboxFieldProps {
  options: ComboboxOption[]
  /** Values shown as selected (checked) in the list. */
  selected: string[]
  /** Several values: the list stays open after a pick and shows checkboxes. */
  multiple?: boolean
  /** Text in the input. */
  inputValue: string
  onInputValueChange: (text: string) => void
  /** Text the options are filtered by ('' shows every option). */
  query: string
  filter?: ComboboxFilter
  onPick: (option: ComboboxOption) => void
  /** Called when the list closes (blur, Escape, a pick in single mode). */
  onClose?: () => void
  /** Chips or other content before the input (Multi Select). */
  leading?: ReactNode
  /** Backspace in an empty input (Multi Select removes the last chip). */
  onBackspaceEmpty?: () => void
  /** Shown when nothing matches; null hides the list instead. */
  emptyText?: string | null
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  invalid?: boolean
  disabled?: boolean
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
  accessibilityHint?: string
  /** Phones: focus the sheet's search box as it opens (Autocomplete). */
  autoFocusSearch?: boolean
  /** Title of the sheet on phones. */
  title?: string
  width?: number | string
}

export const fieldHeights = { sm: '$8', md: '$10', lg: '$12' } as const
