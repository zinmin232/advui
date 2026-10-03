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
        borderColor: '$input',
        backgroundColor: '$background',
        borderRadius: '$sm',
        hoverStyle: { borderColor: '$borderStrong' },
        pressStyle: { borderColor: '$borderStrong' },
        focusStyle: { borderColor: '$input' },
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      },
    },
    size: {
      sm: { width: '$4', height: '$4', borderRadius: '$xs' },
      md: { width: '$5', height: '$5', borderRadius: '$sm' },
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
const nativeAccessible = isWeb ? null : { accessible: true }

const checkedStyle = { backgroundColor: '$primary', borderColor: '$primary' } as const

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
        {...nativeAccessible}
        aria-invalid={invalid || undefined}
        {...(invalid ? { borderColor: '$error' as const } : null)}
        activeStyle={checkedStyle}
        {...(props as TamaguiCheckboxProps)}
      >
        <BaseCheckbox.Indicator>
          {props.checked === 'indeterminate' ? (
            <MinusIcon size={iconSize} color="$primaryForeground" strokeWidth={3} />
          ) : (
            <CheckIcon size={iconSize} color="$primaryForeground" strokeWidth={3} />
          )}
        </BaseCheckbox.Indicator>
      </BaseCheckbox>
    )
  },
)
