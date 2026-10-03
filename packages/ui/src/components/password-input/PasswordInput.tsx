import { EyeIcon, EyeOffIcon } from '@advui/icons'
import { forwardRef, useId } from 'react'
import { type TamaguiElement, View, isWeb } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useFieldControl } from '../../hooks/useFieldControl'
import { IconButton } from '../icon-button/IconButton'
import { Input, type InputProps } from '../input/Input'

const togglePadding = { sm: '$9', md: '$10', lg: '$12' } as const

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'secureTextEntry' | 'size'> {
  size?: 'sm' | 'md' | 'lg'
  /** Whether the password is shown (controlled). */
  visible?: boolean
  defaultVisible?: boolean
  onVisibleChange?: (visible: boolean) => void
  /** Accessible name of the show/hide button. */
  toggleLabel?: string
}

/**
 * A password field with a button that shows and hides the text. The button is
 * a toggle (`aria-pressed`) with a fixed name, so its state is announced.
 */
export const PasswordInput = forwardRef<TamaguiElement, PasswordInputProps>(
  function PasswordInput(passwordProps, ref) {
    const {
      visible: visibleProp,
      defaultVisible = false,
      onVisibleChange,
      toggleLabel = 'Show password',
      size = 'md',
      disabled = false,
      id: idProp,
      ...props
    } = useFieldControl(passwordProps)
    const generatedId = useId()
    const id = idProp ?? generatedId
    const [visible, setVisible] = useControllableState({
      value: visibleProp,
      defaultValue: defaultVisible,
      onChange: onVisibleChange,
    })

    return (
      <View position="relative" justifyContent="center">
        <Input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect={false}
          size={size}
          disabled={disabled}
          {...props}
          // After the spread: text must never run under the toggle.
          paddingRight={togglePadding[size]}
        />
        <View position="absolute" right="$1" top={0} bottom={0} justifyContent="center">
          <IconButton
            size="sm"
            icon={visible ? <EyeOffIcon /> : <EyeIcon />}
            aria-label={toggleLabel}
            aria-pressed={visible}
            {...(isWeb && { 'aria-controls': id })}
            disabled={disabled}
            onPress={() => setVisible(!visible)}
          />
        </View>
      </View>
    )
  },
)
