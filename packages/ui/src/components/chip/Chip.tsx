import { CheckIcon, IconDefaults, XIcon } from '@advui/icons'
import { type ReactNode, forwardRef, useEffect, useRef } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  Text,
  View,
  isWeb,
  styled,
  useComposedRefs,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'
import { ariaState } from '../../utils/ariaState'
import { flatValue } from '../../utils/responsive'
import { registerRemovable, removeAndRefocus } from './removeFocus'

const ChipFrame = styled(View, {
  displayName: 'Chip',
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
  gap: '1-5',
  height: '8',
  paddingHorizontal: '3',
  borderWidth: 1,
  borderColor: 'input',
  borderRadius: 'lg',
  backgroundColor: 'transparent',
  userSelect: 'none',
  variants: {
    interactive: {
      true: {
        cursor: 'pointer',
        backgroundColor: 'hover:accent press:accentHover',
        outlineColor: 'focus-visible:ring',
        outlineStyle: 'focus-visible:solid',
        outlineWidth: 'focus-visible:2px',
        outlineOffset: 'focus-visible:2px',
      },
    },
    // Material's selected filter chip: a filled tonal surface without a border.
    selected: {
      true: {
        backgroundColor: 'secondary hover:secondaryHover press:secondaryPress',
        borderColor: 'secondary',
      },
    },
    disabled: {
      // Native keeps touches: TalkBack finds a view by touch only if it takes
      // them. Chip ignores presses while disabled instead.
      true: { opacity: 0.5, cursor: 'default', pointerEvents: isWeb ? 'none' : 'auto' },
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

type LabelColor = 'foreground' | 'secondaryForeground'

const Label = ({ children, color }: { children: ReactNode; color: LabelColor }) =>
  isTextContent(children) ? (
    <Text
      fontFamily="body"
      fontSize="2"
      lineHeight="2"
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
    onPressIn,
    onPressOut,
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
  const color: LabelColor = on ? 'secondaryForeground' : 'foreground'
  const leading = on ? <CheckIcon /> : icon
  const pressable = filter || onPress !== undefined
  const ripple = useRipple({ color, disabled: disabled || !pressable, onPressIn, onPressOut })
  const removeRipple = useRipple({
    color: 'mutedForeground',
    disabled: disabled || !onRemove || filter,
  })
  const frameRef = useRef<TamaguiElement>(null)
  const removeRef = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, frameRef)
  const removable = onRemove !== undefined && !filter
  // Removing a chip moves focus to its neighbour, so its row knows its chips.
  useEffect(() => {
    if (!removable || !frameRef.current || !removeRef.current) return
    return registerRemovable(frameRef.current as never, removeRef.current as never)
  }, [removable])

  // An input chip is a group: its text plus a separate remove button, so the
  // remove action has its own name and focus stop.
  if (onRemove && !filter) {
    const name = removeLabel ?? (typeof children === 'string' ? `Remove ${children}` : 'Remove')
    return (
      <ChipFrame
        ref={composedRef}
        paddingRight="1"
        {...props}
        {...ripple.props}
        disabled={disabled}
      >
        <IconDefaults size={18} color="mutedForeground">
          {icon}
        </IconDefaults>
        <Label color="foreground">{children}</Label>
        <View
          ref={removeRef}
          render="button"
          role="button"
          aria-label={name}
          alignItems="center"
          justifyContent="center"
          width="6"
          height="6"
          borderRadius="full"
          cursor={disabled ? 'not-allowed' : 'pointer'}
          backgroundColor={flatValue(
            isWeb && 'transparent',
            !disabled && 'hover:accent',
            !disabled && !removeRipple.active && 'press:accentHover',
          )}
          outlineColor="focus-visible:ring"
          outlineStyle="focus-visible:solid"
          outlineWidth="focus-visible:2px"
          {...(isWeb
            ? { type: 'button', padding: 0, borderWidth: 0 }
            : { accessible: true, hitSlop: 10 })}
          {...removeRipple.props}
          aria-disabled={ariaState(disabled)}
          onPress={() => !disabled && removeAndRefocus(frameRef.current as never, onRemove)}
        >
          {removeRipple.element}
          <XIcon size={14} color="mutedForeground" />
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
      aria-disabled={ariaState(disabled)}
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
      {...(ripple.active && {
        backgroundColor: on ? 'press:secondary' : 'press:transparent',
        // The ripple is clipped inside the border; a selected chip's border
        // matches its fill, so drop it and let the ripple reach the edge.
        ...(on && { borderWidth: 0 }),
      })}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <IconDefaults size={18} color={on ? 'secondaryForeground' : 'mutedForeground'}>
        {leading}
      </IconDefaults>
      <Label color={color}>{children}</Label>
    </ChipFrame>
  )
})
