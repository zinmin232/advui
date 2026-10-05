import {
  type KeyboardEvent,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  useComposedRefs,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import {
  ToggleFrame,
  ToggleLabel,
  type ToggleSize,
  type ToggleVariant,
  toggleHitSlop,
  useToggleRipple,
} from '../toggle/Toggle'
import { ariaState } from '../../utils/ariaState'

type GroupState = {
  type: 'single' | 'multiple'
  values: string[]
  press: (value: string) => void
  variant: ToggleVariant
  size: ToggleSize
  disabled: boolean
}

const GroupContext = createContext<GroupState | null>(null)

interface ToggleGroupBaseProps extends Omit<
  GetProps<typeof View>,
  'children' | 'defaultValue' | 'onValueChange'
> {
  variant?: ToggleVariant
  size?: ToggleSize
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  /** Name the group, e.g. "Text alignment" (or use `aria-labelledby`). */
  'aria-label'?: string
  'aria-labelledby'?: string
  children: ReactNode
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /** One choice at a time, like radio buttons. */
  type: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /** Any number of items can be on. */
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps

const ITEM = '[data-toggle-group-item]'
const toList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : []

const ToggleGroupRoot = forwardRef<TamaguiElement, ToggleGroupProps>(function ToggleGroup(
  {
    type,
    value,
    defaultValue,
    onValueChange,
    variant = 'default',
    size = 'md',
    orientation = 'horizontal',
    disabled = false,
    children,
    ...props
  },
  forwardedRef,
) {
  const ref = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, forwardedRef)
  const single = type === 'single'
  const [values, setValues] = useControllableState<string[]>({
    value: toList(value),
    defaultValue: toList(defaultValue) ?? [],
    onChange: (next) =>
      (onValueChange as ((v: string | string[]) => void) | undefined)?.(
        single ? (next[0] ?? '') : next,
      ),
  })

  const press = (item: string) => {
    if (single) {
      // Like a radio group, the chosen item stays chosen when pressed again.
      if (!values.includes(item)) setValues([item])
    } else {
      setValues(values.includes(item) ? values.filter((v) => v !== item) : [...values, item])
    }
  }

  // Web keyboard support: one Tab stop (the chosen item, else the first) and
  // arrow keys to move between items, which also choose in single mode.
  const items = () =>
    [...((ref.current as HTMLElement | null)?.querySelectorAll<HTMLElement>(ITEM) ?? [])].filter(
      (el) => el.getAttribute('aria-disabled') !== 'true',
    )

  useLayoutEffect(() => {
    if (!isWeb) return
    const all = items()
    const target =
      all.find((el) => el.getAttribute('aria-checked') === 'true') ??
      all.find((el) => el.getAttribute('aria-pressed') === 'true') ??
      all[0]
    for (const el of all) el.tabIndex = el === target ? 0 : -1
  })

  const onKeyDown = (event: KeyboardEvent) => {
    const all = items()
    const index = all.indexOf(event.target as HTMLElement)
    if (index === -1) return
    const last = all.length - 1
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    const el = all[next]
    if (!el) return
    el.focus()
    const itemValue = el.dataset.value
    if (single && itemValue) press(itemValue)
  }

  return (
    <GroupContext.Provider value={{ type, values, press, variant, size, disabled }}>
      <View
        ref={composedRef}
        role={single ? 'radiogroup' : 'group'}
        // aria-orientation is only valid on radiogroup, not on group.
        aria-orientation={single ? orientation : undefined}
        aria-disabled={ariaState(disabled)}
        flexDirection={orientation === 'vertical' ? 'column' : 'row'}
        alignItems={orientation === 'vertical' ? 'stretch' : 'center'}
        flexWrap="wrap"
        gap="$1"
        {...(isWeb && { onKeyDown })}
        {...props}
      >
        {children}
      </View>
    </GroupContext.Provider>
  )
})

export interface ToggleGroupItemProps extends Omit<
  GetProps<typeof ToggleFrame>,
  'variant' | 'size' | 'on' | 'children'
> {
  value: string
  disabled?: boolean
  /** Icon before the label. Icon-only items need an `aria-label`. */
  icon?: ReactNode
  children?: ReactNode
}

const ToggleGroupItem = forwardRef<TamaguiElement, ToggleGroupItemProps>(function ToggleGroupItem(
  { value, disabled: itemDisabled, icon, children, onPressIn, onPressOut, ...props },
  ref,
) {
  const group = useContext(GroupContext)
  if (!group) throw new Error('ToggleGroup.Item must be rendered inside <ToggleGroup>.')
  const on = group.values.includes(value)
  const disabled = group.disabled || !!itemDisabled
  const single = group.type === 'single'
  const ripple = useToggleRipple(on, group.variant, { disabled, onPressIn, onPressOut })

  const semantics = isWeb
    ? single
      ? { role: 'radio' as const, 'aria-checked': on }
      : { 'aria-pressed': on }
    : {
        // React Native has no aria-pressed; toggle buttons and radios report "checked".
        accessible: true,
        accessibilityRole: single ? ('radio' as const) : ('togglebutton' as const),
        accessibilityState: { checked: on, disabled },
        hitSlop: toggleHitSlop[group.size],
        // Android does not mark radio views clickable; TalkBack's double-tap
        // then arrives as the "activate" action.
        accessibilityActions: [{ name: 'activate' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (!disabled && event.nativeEvent.actionName === 'activate') group.press(value)
        },
      }

  return (
    <ToggleFrame
      ref={ref}
      variant={group.variant}
      size={group.size}
      on={on}
      disabled={disabled}
      aria-disabled={ariaState(disabled)}
      data-toggle-group-item=""
      data-value={value}
      {...(isWeb && { type: 'button' })}
      {...semantics}
      onPress={() => {
        if (!disabled) group.press(value)
      }}
      {...ripple.style}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <ToggleLabel on={on} size={group.size} icon={icon}>
        {children}
      </ToggleLabel>
    </ToggleFrame>
  )
})

/**
 * A set of toggle buttons. `type="single"` works like a radio group (one
 * choice, e.g. text alignment); `type="multiple"` lets several be on at once
 * (e.g. bold, italic, underline).
 */
export const ToggleGroup = withStaticProperties(ToggleGroupRoot, {
  Item: ToggleGroupItem,
})
