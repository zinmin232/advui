import { CalendarIcon, IconDefaults } from '@advui/icons'
import { type ReactNode, forwardRef, useId } from 'react'
import { type GetProps, type TamaguiElement, View, isWeb, styled } from 'tamagui'
import { fieldBoxStyle } from '../input/Input'
import { Text } from '../typography/Text'

const TriggerFrame = styled(View, {
  name: 'PickerTrigger',
  role: 'button',
  render: 'button',
  tabIndex: 0,
  ...fieldBoxStyle,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  cursor: 'pointer',

  variants: {
    size: {
      sm: { height: '$8', paddingHorizontal: '$2.5' },
      md: { height: '$10', paddingHorizontal: '$3' },
      lg: { height: '$12', paddingHorizontal: '$4' },
    },
    invalid: {
      true: { borderColor: '$error', hoverStyle: { borderColor: '$error' } },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

export interface PickerTriggerProps extends Omit<GetProps<typeof TriggerFrame>, 'children'> {
  /** The formatted value, or null to show the placeholder. */
  valueText: string | null
  placeholder: string
  icon?: ReactNode
  'aria-describedby'?: string
}

/**
 * The field-shaped button of Date Picker and Date Range Picker. Its value text
 * is linked with `aria-describedby`, so a label from Form Field (which names
 * the button) and the value are both announced.
 */
export const PickerTrigger = forwardRef<TamaguiElement, PickerTriggerProps>(function PickerTrigger(
  {
    valueText,
    placeholder,
    icon = <CalendarIcon />,
    invalid = false,
    disabled = false,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const valueId = useId()
  return (
    <TriggerFrame
      ref={ref}
      invalid={invalid}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      aria-describedby={[valueId, describedBy].filter(Boolean).join(' ')}
      {...(isWeb
        ? { type: 'button' }
        : // Native has no aria-describedby; expose the date as the value.
          { accessibilityValue: { text: valueText ?? placeholder } })}
      {...props}
    >
      <Text
        id={valueId}
        size="sm"
        numberOfLines={1}
        flexShrink={1}
        color={valueText ? '$foreground' : '$placeholderColor'}
      >
        {valueText ?? placeholder}
      </Text>
      <IconDefaults size={16} color="$mutedForeground">
        {icon}
      </IconDefaults>
    </TriggerFrame>
  )
})
