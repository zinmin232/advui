import { CheckIcon, IconDefaults, XIcon } from '@advui/icons'
import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, Text, View, isWeb, styled } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { isTextContent } from '../../utils/isTextContent'

const ChipFrame = styled(View, {
  name: 'Chip',
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: '$1.5',
  height: '$8',
  paddingHorizontal: '$3',
  borderWidth: 1,
  borderColor: '$input',
  borderRadius: '$lg',
  backgroundColor: 'transparent',
  userSelect: 'none',

  variants: {
    interactive: {
      true: {
        cursor: 'pointer',
        hoverStyle: { backgroundColor: '$accent' },
        pressStyle: { backgroundColor: '$accentHover' },
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
        },
      },
    },
    // Material's selected filter chip: a filled tonal surface without a border.
    selected: {
      true: {
        backgroundColor: '$secondary',
        borderColor: '$secondary',
        hoverStyle: { backgroundColor: '$secondaryHover' },
        pressStyle: { backgroundColor: '$secondaryPress' },
      },
    },
    disabled: {
      true: { opacity: 0.5, pointerEvents: 'none', cursor: 'default' },
    },
  } as const,
})

type FrameProps = GetProps<typeof ChipFrame>

export interface ChipProps extends Omit<
  FrameProps,
  'interactive' | 'selected' | 'disabled' | 'children'
> {
  children: ReactNode
  /** Leading icon. A selected filter chip shows a check instead. */
  icon?: ReactNode
  /**
   * Makes it a filter chip that turns on and off (announced as pressed). Use
   * `defaultSelected` for uncontrolled use.
   */
  selected?: boolean
  defaultSelected?: boolean
  onSelectedChange?: (selected: boolean) => void
  /** Makes it an input chip with a remove button, e.g. a recipient. */
  onRemove?: () => void
  /** Accessible name of the remove button. Default: "Remove {children}". */
  removeLabel?: string
  disabled?: boolean
}

type LabelColor = '$foreground' | '$secondaryForeground'

const Label = ({ children, color }: { children: ReactNode; color: LabelColor }) =>
  isTextContent(children) ? (
    <Text
      fontFamily="$body"
      fontSize="$2"
      lineHeight="$2"
      fontWeight="500"
      color={color}
      numberOfLines={1}
      userSelect="none"
    >
      {children}
    </Text>
  ) : (
    <>{children}</>
  )

/**
 * A compact element for a choice, a filter, an entered value or a suggested
 * action. Pass `selected` for a filter chip, `onRemove` for an input chip or
 * `onPress` for an action chip.
 */
export const Chip = forwardRef<TamaguiElement, ChipProps>(function Chip(
  {
    children,
    icon,
    selected: selectedProp,
    defaultSelected,
    onSelectedChange,
    onRemove,
    removeLabel,
    disabled = false,
    onPress,
    ...props
  },
  ref,
) {
  const filter =
    selectedProp !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined
  const [selected, setSelected] = useControllableState({
    value: selectedProp,
    defaultValue: defaultSelected ?? false,
    onChange: onSelectedChange,
  })
  const on = filter && selected
  const color: LabelColor = on ? '$secondaryForeground' : '$foreground'
  const leading = on ? <CheckIcon /> : icon
  const pressable = filter || onPress !== undefined

  // An input chip is a group: its text plus a separate remove button, so the
  // remove action has its own name and focus stop.
  if (onRemove && !filter) {
    const name = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')
    return (
      <ChipFrame ref={ref} paddingRight="$1" disabled={disabled} {...props}>
        <IconDefaults size={18} color="$mutedForeground">
          {icon}
        </IconDefaults>
        <Label color="$foreground">{children}</Label>
        <View
          render="button"
          role="button"
          aria-label={name}
          alignItems="center"
          justifyContent="center"
          width="$6"
          height="$6"
          borderRadius="$full"
          cursor="pointer"
          hoverStyle={{ backgroundColor: '$accent' }}
          pressStyle={{ backgroundColor: '$accentHover' }}
          focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
          {...(isWeb
            ? { type: 'button', padding: 0, borderWidth: 0, backgroundColor: 'transparent' }
            : { accessible: true, hitSlop: 10 })}
          onPress={() => !disabled && onRemove()}
        >
          <XIcon size={14} color="$mutedForeground" />
        </View>
      </ChipFrame>
    )
  }

  const semantics = !pressable
    ? {}
    : isWeb
      ? {
          render: 'button' as const,
          type: 'button',
          tabIndex: 0,
          'aria-pressed': filter ? on : undefined,
        }
      : filter
        ? {
            // React Native has no aria-pressed; a toggle button reports "checked".
            accessible: true,
            accessibilityRole: 'togglebutton' as const,
            accessibilityState: { checked: on, disabled },
            hitSlop: 6,
          }
        : { accessible: true, role: 'button' as const, hitSlop: 6 }

  return (
    <ChipFrame
      ref={ref}
      interactive={pressable}
      selected={on}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...semantics}
      onPress={
        pressable
          ? (event) => {
              if (disabled) return
              onPress?.(event)
              if (filter) setSelected(!selected)
            }
          : undefined
      }
      {...props}
    >
      <IconDefaults size={18} color={on ? '$secondaryForeground' : '$mutedForeground'}>
        {leading}
      </IconDefaults>
      <Label color={color}>{children}</Label>
    </ChipFrame>
  )
})
