import { forwardRef } from 'react'
import type { TamaguiElement } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { ComboboxField } from '../combobox/ComboboxField'
import type { ComboboxFieldProps } from '../combobox/options'

export interface AutocompleteProps extends Omit<
  ComboboxFieldProps,
  | 'selected'
  | 'multiple'
  | 'inputValue'
  | 'onInputValueChange'
  | 'query'
  | 'onPick'
  | 'onClose'
  | 'leading'
  | 'onBackspaceEmpty'
> {
  /** The text, typed or picked from a suggestion. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/**
 * A text field with suggestions. Unlike Combobox, any text is a valid value;
 * picking a suggestion just fills it in. Load suggestions as the text changes
 * by passing new `options`.
 */
export const Autocomplete = forwardRef<TamaguiElement, AutocompleteProps>(function Autocomplete(
  { value: valueProp, defaultValue = '', onValueChange, emptyText = null, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <ComboboxField
      ref={ref}
      selected={[]}
      inputValue={value}
      query={value}
      onInputValueChange={setValue}
      onPick={(option) => setValue(option.label)}
      emptyText={emptyText}
      autoFocusSearch
      {...props}
    />
  )
})
