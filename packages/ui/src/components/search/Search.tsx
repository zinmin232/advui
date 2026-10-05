import { SearchIcon, XIcon } from '@advui/icons'
import { forwardRef, useRef } from 'react'
import { type TamaguiElement, View, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { IconButton } from '../icon-button/IconButton'
import { Input, type InputProps } from '../input/Input'
import { Spinner } from '../spinner'
import { ariaState } from '../../utils/ariaState'

const sidePadding = { sm: '$8', md: '$9', lg: '$10' } as const
const iconSize = { sm: 14, md: 16, lg: 18 } as const

export interface SearchProps extends Omit<
  InputProps,
  'size' | 'value' | 'defaultValue' | 'onChangeText' | 'type'
> {
  size?: 'sm' | 'md' | 'lg'
  /** The search text (controlled). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter (or the keyboard's search key) was pressed. */
  onSearch?: (value: string) => void
  /** Shows a spinner in place of the search icon, e.g. while results load. */
  loading?: boolean
  /** Name of the field. Default: "Search". */
  'aria-label'?: string
  /** Name of the clear button. Default: "Clear search". */
  clearLabel?: string
  /** Wraps the field in a `search` landmark (web), for a page's main search. */
  landmark?: boolean
}

/**
 * A search field: a magnifier, the text, and a clear button once there is
 * text. Enter runs `onSearch`; Escape clears the text on web.
 */
export const Search = forwardRef<TamaguiElement, SearchProps>(function Search(
  {
    size = 'md',
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onSearch,
    loading = false,
    'aria-label': ariaLabel = 'Search',
    clearLabel = 'Clear search',
    landmark = false,
    placeholder = 'Search',
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
  const inputRef = useRef<HTMLInputElement | null>(null)

  const clear = () => {
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <View
      position="relative"
      justifyContent="center"
      // Tamagui's role type lacks 'search'; react-native-web passes it through.
      {...((landmark && isWeb ? { role: 'search' } : {}) as object)}
    >
      <View
        position="absolute"
        left="$3"
        zIndex={1}
        pointerEvents="none"
        aria-hidden
        {...(!isWeb && { accessible: false })}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          <SearchIcon size={iconSize[size]} color="$mutedForeground" />
        )}
      </View>
      <Input
        ref={(node: TamaguiElement | null) => {
          inputRef.current = node as unknown as HTMLInputElement | null
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        role="searchbox"
        aria-label={ariaLabel}
        aria-busy={ariaState(loading)}
        enterKeyHint="search"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        size={size}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onSearch?.(value)}
        {...(isWeb && {
          onKeyDown: (event: { key: string; preventDefault: () => void }) => {
            if (event.key === 'Escape' && value) {
              event.preventDefault()
              setValue('')
            }
          },
        })}
        {...props}
        // After the spread: text never runs under the icon or the clear button.
        paddingLeft={sidePadding[size]}
        {...(value && { paddingRight: sidePadding[size] })}
      />
      {value && !disabled ? (
        <View position="absolute" right="$1" top={0} bottom={0} justifyContent="center">
          <IconButton size="sm" icon={<XIcon />} aria-label={clearLabel} onPress={clear} />
        </View>
      ) : null}
    </View>
  )
})
