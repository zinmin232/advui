import { forwardRef, useState } from 'react'
import { type TamaguiElement, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { Chip } from '../chip/Chip'
import { ComboboxField } from '../combobox/ComboboxField'
import type { ComboboxFieldProps } from '../combobox/options'

export interface MultiSelectProps extends Omit<
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
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Accessible name of each chip's remove button. Default: "Remove {label}". */
  removeLabel?: (label: string) => string
}

const none: string[] = []

/**
 * Pick several options from a searchable list. Picks show as chips in the
 * field. On web it is a combobox with a multi-select listbox that stays open;
 * on phones it opens a bottom sheet of checkbox rows.
 */
export const MultiSelect = forwardRef<TamaguiElement, MultiSelectProps>(function MultiSelect(
  {
    value: valueProp,
    defaultValue = none,
    onValueChange,
    options,
    removeLabel = (label) => `Remove ${label}`,
    disabled = false,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [query, setQuery] = useState('')
  const remove = (item: string) => setValue(value.filter((v) => v !== item))
  const picked = value.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v })

  return (
    <ComboboxField
      ref={ref}
      multiple
      options={options}
      selected={value}
      inputValue={query}
      query={query}
      onInputValueChange={setQuery}
      onPick={(option) => {
        setValue(
          value.includes(option.value)
            ? value.filter((v) => v !== option.value)
            : [...value, option.value],
        )
        setQuery('')
      }}
      onClose={() => setQuery('')}
      onBackspaceEmpty={() => value.length && remove(value[value.length - 1]!)}
      disabled={disabled}
      leading={picked.map((option) => (
        <Chip
          key={option.value}
          disabled={disabled}
          // On native the field is one button; chips there are labels, and
          // options are removed by unchecking them in the sheet.
          {...(isWeb && {
            onRemove: () => remove(option.value),
            removeLabel: removeLabel(option.label),
          })}
        >
          {option.label}
        </Chip>
      ))}
      {...props}
    />
  )
})
