import { CheckIcon, ChevronDownIcon, IconDefaults } from '@advui/icons'
import { autoUpdate, flip, offset, shift, size, useFloating } from '@tamagui/floating'
import { shadows, zIndex } from '@advui/theme'
import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import {
  type GetProps,
  Input as TamaguiInput,
  Portal,
  type TamaguiElement,
  View,
  XStack,
  styled,
} from 'tamagui'
import { fieldBoxStyle } from '../input/Input'
import { Text } from '../typography/Text'
import { type ComboboxFieldProps, defaultFilter, fieldHeights } from './options'

const FieldBox = styled(XStack, {
  name: 'ComboboxField',
  ...fieldBoxStyle,
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$1.5',
  cursor: 'text',
  // The input inside draws no ring of its own; the box shows focus instead.
  focusWithinStyle: {
    borderColor: '$ring',
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 0,
  },

  variants: {
    size: {
      sm: { minHeight: '$8', paddingHorizontal: '$2.5', paddingVertical: '$0.5' },
      md: { minHeight: '$10', paddingHorizontal: '$3', paddingVertical: '$1' },
      lg: { minHeight: '$12', paddingHorizontal: '$4', paddingVertical: '$1' },
    },
    invalid: {
      true: {
        borderColor: '$error',
        hoverStyle: { borderColor: '$error' },
        focusWithinStyle: { borderColor: '$error', outlineColor: '$error' },
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const BareInput = styled(TamaguiInput, {
  name: 'ComboboxInput',
  unstyled: true,
  flex: 1,
  minWidth: '$16',
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  fontFamily: '$body',
  fontSize: '$2',
  color: '$foreground',
  placeholderTextColor: '$placeholderColor',
  // The field box draws the focus ring; `outline-style: auto` ignores width.
  outlineStyle: 'none',
  focusStyle: { outlineStyle: 'none' },
  focusVisibleStyle: { outlineStyle: 'none' },
})

const ListFrame = styled(View, {
  name: 'ComboboxList',
  backgroundColor: '$popover',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$lg',
  padding: '$1',
  overflow: 'scroll',
  ...shadows.md,
})

const OptionRow = styled(XStack, {
  name: 'ComboboxOption',
  alignItems: 'center',
  gap: '$2',
  minHeight: '$8',
  paddingHorizontal: '$2',
  paddingVertical: '$1.5',
  borderRadius: '$md',
  cursor: 'pointer',

  variants: {
    highlighted: { true: { backgroundColor: '$accent' } },
    disabled: { true: { opacity: 0.5, cursor: 'not-allowed' } },
  } as const,
})

type KeyEvent = { key: string; preventDefault: () => void }

/**
 * The web field behind Combobox, Autocomplete and Multi Select: a text box
 * with `role="combobox"` and a listbox that floats below it. Focus never
 * leaves the text box; `aria-activedescendant` points at the highlighted
 * option (the WAI-ARIA combobox pattern with list autocomplete).
 */
export const ComboboxField = forwardRef<TamaguiElement, ComboboxFieldProps>(function ComboboxField(
  {
    options,
    selected,
    multiple = false,
    inputValue,
    onInputValueChange,
    query,
    filter = defaultFilter,
    onPick,
    onClose,
    leading,
    onBackspaceEmpty,
    emptyText = 'No results',
    placeholder,
    size: sizeProp = 'md',
    invalid = false,
    disabled = false,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
    'aria-required': required,
    width = '100%',
  },
  ref,
) {
  const listId = useId()
  const optionId = (index: number) => `${listId}-${index}`
  const [open, setOpenState] = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const matches = query ? options.filter((option) => filter(option, query)) : options
  const showList = open && (matches.length > 0 || emptyText !== null)

  const setOpen = (next: boolean) => {
    if (next === open) return
    setOpenState(next)
    if (!next) {
      setActive(-1)
      onClose?.()
    }
  }

  const { refs, floatingStyles } = useFloating({
    open: showList,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight, 288)}px`,
          })
        },
      }),
    ],
  })

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  // New matches start from the first one.
  const matchCount = matches.length
  useEffect(() => setActive(query && matchCount ? 0 : -1), [query, matchCount])

  const move = (step: 1 | -1) => {
    if (!open) return setOpen(true)
    if (matches.length === 0) return
    let next = active
    for (let i = 0; i < matches.length; i++) {
      next = (next + step + matches.length) % matches.length
      if (!matches[next]!.disabled) break
    }
    setActive(next)
  }

  const pick = (index: number) => {
    const option = matches[index]
    if (!option || option.disabled) return
    onPick(option)
    if (!multiple) setOpen(false)
  }

  const onKeyDown = (event: KeyEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        return move(1)
      case 'ArrowUp':
        event.preventDefault()
        return move(-1)
      case 'Enter':
        if (open && active >= 0) {
          event.preventDefault()
          pick(active)
        }
        return
      case 'Escape':
        if (open) {
          event.preventDefault()
          setOpen(false)
        }
        return
      case 'Backspace':
        if (!inputValue) onBackspaceEmpty?.()
        return
    }
  }

  return (
    <>
      <FieldBox
        ref={(node: TamaguiElement | null) => {
          refs.setReference(node as unknown as Element | null)
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        size={sizeProp}
        invalid={invalid}
        disabled={disabled}
        width={width as GetProps<typeof FieldBox>['width']}
        onPress={() => inputRef.current?.focus()}
      >
        {leading}
        <BareInput
          ref={inputRef as never}
          id={id}
          role="combobox"
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-required={required}
          aria-invalid={invalid || undefined}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          autoCorrect={false}
          spellCheck={false}
          disabled={disabled}
          placeholder={placeholder}
          height={fieldHeights[sizeProp]}
          value={inputValue}
          onChangeText={(text) => {
            onInputValueChange(text)
            setOpen(true)
          }}
          onKeyDown={onKeyDown as never}
          onBlur={() => setOpen(false)}
        />
        <View
          aria-hidden
          padding="$1"
          cursor="pointer"
          onPress={() => {
            inputRef.current?.focus()
            setOpen(!open)
          }}
        >
          <ChevronDownIcon size={16} color="$mutedForeground" />
        </View>
      </FieldBox>
      {showList ? (
        <Portal zIndex={zIndex.popover}>
          <ListFrame
            ref={refs.setFloating as never}
            id={listId}
            role={'listbox' as never}
            aria-label={ariaLabel}
            aria-multiselectable={multiple || undefined}
            style={floatingStyles}
            // Keep focus in the text box when the list is clicked.
            onMouseDown={(event: { preventDefault: () => void }) => event.preventDefault()}
          >
            {matches.length === 0 ? (
              <Text size="sm" tone="muted" padding="$2">
                {emptyText}
              </Text>
            ) : (
              matches.map((option, index) => {
                const isSelected = selected.includes(option.value)
                return (
                  <OptionRow
                    key={option.value}
                    id={optionId(index)}
                    role={'option' as never}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    highlighted={index === active}
                    disabled={option.disabled}
                    onMouseEnter={() => {
                      if (!option.disabled) setActive(index)
                    }}
                    onPress={() => pick(index)}
                  >
                    <View width="$4" alignItems="center">
                      {isSelected ? (
                        <IconDefaults size={16} color="$popoverForeground">
                          <CheckIcon />
                        </IconDefaults>
                      ) : null}
                    </View>
                    <View flex={1}>
                      <Text size="sm" color="$popoverForeground">
                        {option.label}
                      </Text>
                      {option.description ? (
                        <Text size="xs" tone="muted">
                          {option.description}
                        </Text>
                      ) : null}
                    </View>
                  </OptionRow>
                )
              })
            )}
          </ListFrame>
        </Portal>
      ) : null}
    </>
  )
})
