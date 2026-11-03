import { CheckIcon, MinusIcon } from '@advui/icons'
import { forwardRef } from 'react'
import {
  isWeb,
  Checkbox as TamaguiCheckbox,
  type CheckboxProps as TamaguiCheckboxProps,
  type TamaguiElement,
  styled,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { useFieldControl } from '../../hooks/useFieldControl'
import { ariaState } from '../../utils/ariaState'

// Tamagui 3's Checkbox is a styled HOC: styling it keeps its behavior.
const BaseCheckbox = styled(TamaguiCheckbox, {
  displayName: 'Checkbox',
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderWidth: 1,
  borderColor: 'input hover:borderStrong press:borderStrong focus:input',
  backgroundColor: 'background',
  borderRadius: 'sm',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:2px',

  variants: {
    size: {
      sm: {
        width: '4',
        height: '4',
        borderRadius: 'xs',
      },
      md: {
        width: '5',
        height: '5',
        borderRadius: 'sm',
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: isWeb ? 'none' : 'auto' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Indicator = styled(TamaguiCheckbox.Indicator, {
  displayName: 'CheckboxIndicator',
  alignItems: 'center',
  justifyContent: 'center',
})

export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps extends Omit<
  TamaguiCheckboxProps,
  'size' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  size?: 'sm' | 'md'
  invalid?: boolean
}

// On iOS/Android a role is only announced when the view is an accessibility element.
// Tamagui sets `disabled` on web only, so native gets it as a state here.
// `aria-busy` is always false: Android rebuilds the spoken name (which
// carries "mixed") only on a state change that has a busy, expanded or mixed
// key, so without it a box that leaves mixed would still say "mixed".
const nativeA11y = (disabled: boolean | undefined) =>
  isWeb ? null : { accessible: true, 'aria-disabled': ariaState(disabled), 'aria-busy': false }

// A checked or mixed box fills with primary. Tamagui's `activeStyle` needs a
// style piece, and style() warns on iOS and Android, where Expo Router loads
// this module while it renders, so the box holds its state and sets the colors.
const checkedColors = { backgroundColor: 'primary', borderColor: 'primary' } as const

/**
 * Binary (or indeterminate) choice. Pair with `<Label htmlFor>` using the same `id`.
 * Space toggles it on web; it exposes the `checkbox` role and checked state on every platform.
 */
export const Checkbox = forwardRef<TamaguiElement, CheckboxProps>(
  function Checkbox(checkboxProps, ref) {
    const {
      size = 'md',
      invalid,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      ...props
    } = useFieldControl(checkboxProps)
    const [checked, setChecked] = useControllableState<CheckedState>({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })
    const iconSize = size === 'sm' ? 12 : 14
    return (
      <BaseCheckbox
        ref={ref}
        size={size as never}
        {...nativeA11y(props.disabled)}
        aria-invalid={invalid || undefined}
        {...(invalid ? { borderColor: 'error' as const } : null)}
        {...(props as TamaguiCheckboxProps)}
        checked={checked}
        onCheckedChange={setChecked}
        {...(checked !== false && checkedColors)}
      >
        <Indicator>
          {checked === 'indeterminate' ? (
            <MinusIcon size={iconSize} color="primaryForeground" strokeWidth={3} />
          ) : (
            <CheckIcon size={iconSize} color="primaryForeground" strokeWidth={3} />
          )}
        </Indicator>
      </BaseCheckbox>
    )
  },
)
