import { CheckIcon, MinusIcon } from '@advui/icons'
import { forwardRef } from 'react'
import {
  isWeb,
  type CheckboxProps as TamaguiCheckboxProps,
  CheckboxFrame as TamaguiCheckboxFrame,
  CheckboxIndicatorFrame as TamaguiIndicatorFrame,
  type TamaguiElement,
  createCheckbox,
  styled,
} from 'tamagui'
import { useFieldControl } from '../../hooks/useFieldControl'
import { ariaState } from '../../utils/ariaState'

// Visual styles live in the `unstyled: false` variant so they override the
// defaults Tamagui's createCheckbox applies through the same variant.
const Frame = styled(TamaguiCheckboxFrame, {
  name: 'Checkbox',
  padding: 0,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',

  variants: {
    unstyled: {
      false: {
        borderWidth: 1,
        borderColor: "input hover:borderStrong press:borderStrong focus:input",
        backgroundColor: "background",
        borderRadius: "sm",
        outlineColor: "focus-visible:ring",
        outlineStyle: "focus-visible:solid",
        outlineWidth: "focus-visible:2px",
        outlineOffset: "focus-visible:2px"
      },
    },
    size: {
      sm: {
        width: "4",
        height: "4",
        borderRadius: "xs"
      },
      md: {
        width: "5",
        height: "5",
        borderRadius: "sm"
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Indicator = styled(TamaguiIndicatorFrame, {
  name: 'CheckboxIndicator',
  alignItems: 'center',
  justifyContent: 'center',
})

const BaseCheckbox = createCheckbox({ Frame, Indicator })

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

const checkedStyle = { backgroundColor: 'primary', borderColor: 'primary' } as const

/**
 * Binary (or indeterminate) choice. Pair with `<Label htmlFor>` using the same `id`.
 * Space toggles it on web; it exposes the `checkbox` role and checked state on every platform.
 */
export const Checkbox = forwardRef<TamaguiElement, CheckboxProps>(
  function Checkbox(checkboxProps, ref) {
    const { size = 'md', invalid, ...props } = useFieldControl(checkboxProps)
    const iconSize = size === 'sm' ? 12 : 14
    return (
      <BaseCheckbox
        ref={ref}
        size={size as never}
        {...nativeA11y(props.disabled)}
        aria-invalid={invalid || undefined}
        {...(invalid ? { borderColor: 'error' as const } : null)}
        activeStyle={checkedStyle}
        {...(props as TamaguiCheckboxProps)}
      >
        <BaseCheckbox.Indicator>
          {props.checked === 'indeterminate' ? (
            <MinusIcon size={iconSize} color="primaryForeground" strokeWidth={3} />
          ) : (
            <CheckIcon size={iconSize} color="primaryForeground" strokeWidth={3} />
          )}
        </BaseCheckbox.Indicator>
      </BaseCheckbox>
    )
  },
)
