import { CheckIcon, ChevronDownIcon, IconDefaults } from '@advui/icons'
import { forwardRef, useState } from 'react'
import { Sheet, type TamaguiElement, View, XStack, styled } from 'tamagui'
import { useBackToClose } from '../../hooks/useBackToClose'
import { FieldContext, useFieldControl } from '../../hooks/useFieldControl'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
import { fieldBoxStyle, Input } from '../input/Input'
import { Text } from '../typography/Text'
import { type ComboboxFieldProps, type ComboboxOption, defaultFilter } from './options'
import { ariaState } from '../../utils/ariaState'

const FieldBox = styled(XStack, {
  name: 'ComboboxField',
  ...fieldBoxStyle,
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '$1.5',

  variants: {
    size: {
      sm: { minHeight: '$8', paddingHorizontal: '$2.5', paddingVertical: '$0.5' },
      md: { minHeight: '$10', paddingHorizontal: '$3', paddingVertical: '$1' },
      lg: { minHeight: '$12', paddingHorizontal: '$4', paddingVertical: '$1' },
    },
    invalid: { true: { borderColor: '$error' } },
    disabled: { true: { opacity: 0.5 } },
  } as const,

  defaultVariants: { size: 'md' },
})

function OptionRow({
  option,
  selected,
  multiple,
  onPress,
}: {
  option: ComboboxOption
  selected: boolean
  multiple: boolean
  onPress: () => void
}) {
  const ripple = useRipple({ color: '$popoverForeground', disabled: option.disabled })
  return (
    <View
      role={multiple ? 'checkbox' : 'button'}
      accessible
      aria-label={option.label}
      aria-checked={multiple ? selected : undefined}
      aria-selected={multiple ? undefined : selected}
      aria-disabled={ariaState(option.disabled)}
      flexDirection="row"
      alignItems="center"
      gap="$3"
      minHeight="$12"
      paddingHorizontal="$3"
      borderRadius="$md"
      opacity={option.disabled ? 0.5 : 1}
      pressStyle={option.disabled || ripple.active ? undefined : { backgroundColor: '$accent' }}
      onPress={option.disabled ? undefined : onPress}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event: { nativeEvent: { actionName: string } }) => {
        if (!option.disabled && event.nativeEvent.actionName === 'activate') onPress()
      }}
      {...ripple.props}
    >
      {ripple.element}
      <View width="$5" alignItems="center">
        {selected ? (
          <IconDefaults size={18} color="$popoverForeground">
            <CheckIcon />
          </IconDefaults>
        ) : null}
      </View>
      <View flex={1}>
        <Text color="$popoverForeground">{option.label}</Text>
        {option.description ? (
          <Text size="sm" tone="muted">
            {option.description}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

/**
 * The iOS / Android field behind Combobox, Autocomplete and Multi Select: a
 * field-shaped button that opens a bottom sheet with a search box and large,
 * labelled rows. A floating list under a text box is hard to reach with a
 * screen reader and is covered by the keyboard on phones.
 */
export const ComboboxField = forwardRef<TamaguiElement, ComboboxFieldProps>(
  function ComboboxField(fieldProps, ref) {
    const {
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
      emptyText = 'No results',
      placeholder,
      size = 'md',
      invalid = false,
      disabled = false,
      id,
      'aria-label': ariaLabel,
      accessibilityHint,
      title,
      autoFocusSearch = false,
      width = '100%',
    } = useFieldControl(fieldProps)
    const [open, setOpenState] = useState(false)
    const reducedMotion = useReducedMotion()
    const setOpen = (next: boolean) => {
      setOpenState(next)
      if (!next) onClose?.()
    }
    // Android: the back button closes the sheet instead of leaving the screen.
    useBackToClose(open, () => setOpen(false))

    const matches = query ? options.filter((option) => filter(option, query)) : options
    // Multi Select shows chips in the field; the others show the text.
    const summary = multiple ? null : inputValue

    return (
      <>
        <FieldBox
          ref={ref}
          id={id}
          role="button"
          accessible
          aria-label={ariaLabel}
          aria-disabled={ariaState(disabled)}
          accessibilityHint={accessibilityHint}
          accessibilityValue={{ text: multiple ? `${selected.length} selected` : inputValue }}
          size={size}
          invalid={invalid}
          disabled={disabled}
          width={width as never}
          onPress={disabled ? undefined : () => setOpen(true)}
        >
          {leading}
          <Text
            flex={1}
            size="sm"
            numberOfLines={1}
            color={summary ? '$foreground' : '$placeholderColor'}
          >
            {summary || (multiple && selected.length ? '' : placeholder)}
          </Text>
          <ChevronDownIcon size={16} color="$mutedForeground" />
        </FieldBox>
        {/* The sheet's search box is not the field's control. */}
        <FieldContext.Provider value={null}>
          <Sheet
            open={open}
            onOpenChange={setOpen}
            modal
            dismissOnSnapToBottom
            moveOnKeyboardChange
            snapPoints={[80]}
            transition={reducedMotion ? undefined : 'medium'}
          >
            <Sheet.Overlay
              backgroundColor="$overlay"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
              transition={reducedMotion ? undefined : 'quick'}
            />
            <Sheet.Handle backgroundColor="$borderStrong" />
            <Sheet.Frame
              backgroundColor="$popover"
              borderTopLeftRadius="$dialog"
              borderTopRightRadius="$dialog"
              padding="$4"
              gap="$3"
            >
              {/* The sheet stays mounted while closed; hide it from screen readers until it opens. */}
              <View
                flex={1}
                gap="$3"
                aria-hidden={!open || undefined}
                accessibilityViewIsModal={open}
              >
                {title ? (
                  <Text weight="semibold" role="heading">
                    {title}
                  </Text>
                ) : null}
                <Input
                  aria-label={title ?? ariaLabel ?? 'Search'}
                  placeholder={placeholder}
                  // The search text only; the picked option is shown by its check.
                  value={query}
                  autoFocus={autoFocusSearch}
                  onChangeText={onInputValueChange}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Sheet.ScrollView keyboardShouldPersistTaps="handled">
                  {matches.length === 0 && emptyText ? (
                    <Text tone="muted" padding="$3">
                      {emptyText}
                    </Text>
                  ) : (
                    matches.map((option) => (
                      <OptionRow
                        key={option.value}
                        option={option}
                        multiple={multiple}
                        selected={selected.includes(option.value)}
                        onPress={() => {
                          onPick(option)
                          if (!multiple) setOpen(false)
                        }}
                      />
                    ))
                  )}
                </Sheet.ScrollView>
              </View>
            </Sheet.Frame>
          </Sheet>
        </FieldContext.Provider>
      </>
    )
  },
)
