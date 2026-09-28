import { Fragment, forwardRef, useState } from 'react'
import { Platform } from 'react-native'
import {
  type GetProps,
  Input as TamaguiInput,
  type TamaguiElement,
  Text,
  View,
  XStack,
  isWeb,
  styled,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import type { InputProps } from '../input/Input'

const slotSizes = {
  sm: { width: '$9', height: '$10', fontSize: '$3' },
  md: { width: '$11', height: '$12', fontSize: '$4' },
  lg: { width: '$14', height: '$14', fontSize: '$6' },
} as const

const Slot = styled(View, {
  name: 'OtpInputSlot',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '$background',
  borderWidth: 1,
  borderColor: '$input',
  borderRadius: '$md',

  variants: {
    active: {
      true: { borderColor: '$ring', outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 1 },
    },
    invalid: {
      true: { borderColor: '$error', outlineColor: '$error' },
    },
  } as const,
})

// The real field lies over the slots: one text box, so paste, SMS autofill and
// screen readers all work, while the slots only draw its characters.
const HiddenField = styled(TamaguiInput, {
  name: 'OtpInputField',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  padding: 0,
  borderWidth: 0,
  backgroundColor: 'transparent',
  // Invisible but still focusable and pressable; Android ignores a
  // transparent text color on TextInput.
  opacity: 0,
  fontSize: '$1',
  cursor: 'text',
  outlineWidth: 0,
})

const oneTimeCode = isWeb || Platform.OS === 'ios' ? 'one-time-code' : 'sms-otp'

export interface OtpInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChangeText' | 'size' | 'maxLength' | 'type'
> {
  /** Number of characters. Default 6. */
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Called once every slot is filled. */
  onComplete?: (value: string) => void
  /** `numeric` keeps digits only; `alphanumeric` keeps letters and digits. */
  type?: 'numeric' | 'alphanumeric'
  size?: keyof typeof slotSizes
  /** Draws a dash after every N slots, e.g. 3 for "123–456". */
  groupSize?: number
}

/**
 * A one-time-code field drawn as separate slots. It is one text box
 * underneath, so pasting a code, SMS autofill and screen readers just work.
 */
export const OtpInput = forwardRef<TamaguiElement, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onComplete,
    type = 'numeric',
    size = 'md',
    groupSize,
    invalid = false,
    disabled = false,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const [focused, setFocused] = useState(false)
  const pattern = type === 'numeric' ? /\D/g : /[^A-Za-z0-9]/g
  const slot = slotSizes[size]
  const activeIndex = Math.min(value.length, length - 1)

  return (
    <View position="relative" alignSelf="flex-start" opacity={disabled ? 0.5 : 1}>
      <XStack gap="$2" alignItems="center" aria-hidden>
        {Array.from({ length }, (_, i) => (
          <Fragment key={i}>
            {groupSize && i > 0 && i % groupSize === 0 ? (
              <Text color="$mutedForeground" fontSize={slot.fontSize}>
                –
              </Text>
            ) : null}
            <Slot
              width={slot.width}
              height={slot.height}
              active={focused && i === activeIndex}
              invalid={invalid}
            >
              <Text fontFamily="$body" fontSize={slot.fontSize} color="$foreground">
                {value[i] ?? ''}
              </Text>
            </Slot>
          </Fragment>
        ))}
      </XStack>
      <HiddenField
        ref={ref}
        value={value}
        inputMode={type === 'numeric' ? 'numeric' : 'text'}
        autoComplete={oneTimeCode as never}
        textContentType="oneTimeCode"
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        caretHidden
        selectionColor={'transparent' as never}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...(isWeb && { caretColor: 'transparent' })}
        onChangeText={(text) => {
          const next = text.replace(pattern, '').slice(0, length)
          setValue(next)
          if (next.length === length && value.length !== length) onComplete?.(next)
        }}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        // Our Input's size variant is omitted above; the rest are plain Input props.
        {...(props as GetProps<typeof HiddenField>)}
      />
    </View>
  )
})
