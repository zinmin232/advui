import { EyeIcon, EyeOffIcon } from '@advui/icons'
import { forwardRef, useId } from 'react'
import { type TamaguiElement, isWeb } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { useFieldControl } from '../../hooks/useFieldControl'
import { IconButton } from '../icon-button/IconButton'
import { Input, type InputProps } from '../input/Input'

// The show/hide button takes the trailing slot.
export interface PasswordInputProps extends Omit<
  InputProps,
  'type' | 'secureTextEntry' | 'size' | 'trailing'
> {
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
 * a toggle (`aria-pressed` on web, a checked toggle button on iOS and Android)
 * with a fixed name, so its state is announced.
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
        trailing={
          <IconButton
            size="sm"
            icon={visible ? <EyeOffIcon /> : <EyeIcon />}
            aria-label={toggleLabel}
            {...(isWeb
              ? { 'aria-pressed': visible, 'aria-controls': id }
              : // React Native has no aria-pressed; a toggle button reports "checked".
                // `role` wins over `accessibilityRole`, so Button's own role is cleared
                // (with null: Tamagui 3 keeps a styled default over undefined).
                {
                  role: null as never,
                  accessibilityRole: 'togglebutton',
                  'aria-checked': visible,
                })}
            disabled={disabled}
            onPress={() => setVisible(!visible)}
          />
        }
      />
    )
  },
)
