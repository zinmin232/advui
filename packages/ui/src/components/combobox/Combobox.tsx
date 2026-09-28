import { forwardRef, useState } from 'react'
import { type TamaguiElement, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { ComboboxField } from './ComboboxField'
import type { ComboboxFieldProps } from './options'

type FieldOwnProps =
  | 'selected'
  | 'multiple'
  | 'inputValue'
  | 'onInputValueChange'
  | 'query'
  | 'onPick'
  | 'onClose'
  | 'leading'
  | 'onBackspaceEmpty'

export interface ComboboxProps extends Omit<ComboboxFieldProps, FieldOwnProps> {
  /** The picked option's value, or null. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

/**
 * A select you can type in: the text filters the options, and only an option
 * can be picked. On web it is a WAI-ARIA combobox with a listbox; on phones
 * it opens a searchable bottom sheet.
 */
export const Combobox = forwardRef<TamaguiElement, ComboboxProps>(function Combobox(
  { value: valueProp, defaultValue = null, onValueChange, options, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // Text being typed; null shows the picked option's label.
  const [typed, setTyped] = useState<string | null>(null)
  const label = options.find((option) => option.value === value)?.label ?? ''

  return (
    <ComboboxField
      ref={ref}
      options={options}
      selected={value == null ? [] : [value]}
      inputValue={typed ?? label}
      query={typed ?? ''}
      onInputValueChange={(text) => {
        setTyped(text)
        // Web: clearing the text clears the pick. Phones search in a separate box.
        if (text === '' && isWeb) setValue(null)
      }}
      onPick={(option) => {
        setValue(option.value)
        setTyped(null)
      }}
      onClose={() => setTyped(null)}
      {...props}
    />
  )
})
