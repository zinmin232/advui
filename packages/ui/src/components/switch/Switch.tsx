import { shadows } from '@adv-ui/theme'
import { forwardRef } from 'react'
import {
  SwitchFrame as TamaguiSwitchFrame,
  type SwitchProps as TamaguiSwitchProps,
  SwitchThumb as TamaguiSwitchThumb,
  type TamaguiElement,
  createSwitch,
  styled,
} from 'tamagui'

// Visual styles live in the `unstyled: false` variant so they override the
// defaults Tamagui's createSwitch applies through the same variant.
const Frame = styled(TamaguiSwitchFrame, {
  name: 'Switch',
  justifyContent: 'center',
  // reset the UA <button> padding so the thumb travel is exact
  padding: 0,
  cursor: 'pointer',

  variants: {
    unstyled: {
      false: {
        borderRadius: '$full',
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '$input',
        transition: 'quick',
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      },
    },
    size: {
      sm: { width: '$9', height: '$5', minHeight: '$5' },
      md: { width: '$11', height: '$6', minHeight: '$6' },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const Thumb = styled(TamaguiSwitchThumb, {
  name: 'SwitchThumb',

  variants: {
    unstyled: {
      false: {
        backgroundColor: '$background',
        borderRadius: '$full',
        transition: 'quick',
        ...shadows.xs,
      },
    },
    size: {
      sm: { width: '$4', height: '$4' },
      md: { width: '$5', height: '$5' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

const BaseSwitch = createSwitch({ Frame, Thumb })

export interface SwitchProps extends Omit<TamaguiSwitchProps, 'size'> {
  size?: 'sm' | 'md'
}

/**
 * On/off toggle for settings that apply immediately. Exposes the `switch` role
 * with checked state; Space/Enter toggle it on web.
 */
export const Switch = forwardRef<TamaguiElement, SwitchProps>(function Switch(
  { size = 'md', ...props },
  ref,
) {
  return (
    <BaseSwitch
      ref={ref}
      role="switch"
      size={size as never}
      activeStyle={{ backgroundColor: '$primary' }}
      {...props}
    >
      <BaseSwitch.Thumb size={size as never} />
    </BaseSwitch>
  )
})
