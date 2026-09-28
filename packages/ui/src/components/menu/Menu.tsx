import { IconDefaults } from '@advui/icons'
import { composeEventHandlers } from '@advui/utils'
import { RovingFocusGroup } from '@tamagui/roving-focus'
import { type ReactNode, createContext, forwardRef, useContext, useId } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { Text } from '../typography/Text'

type MenuState = { value: string; select: (value: string) => void }

const MenuContext = createContext<MenuState | null>(null)

function useMenu() {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error('Menu parts must be rendered inside <Menu>.')
  return menu
}

export interface MenuProps extends Omit<GetProps<typeof View>, 'children' | 'defaultValue'> {
  children: ReactNode
  /** The selected item's `value` (the current page or view). */
  value?: string
  defaultValue?: string
  /** Called with an item's `value` when it is chosen. */
  onValueChange?: (value: string) => void
  /** Names the menu for screen readers, e.g. "Mailboxes". */
  'aria-label'?: string
}

/**
 * Hands focus that lands on the menu itself on to an item. Roving focus does
 * this for Tab, but not when focus arrives before the items have registered,
 * e.g. a Drawer or Dialog focusing its first tabbable element as it opens.
 */
function forwardFocusToItem(event: { target: unknown; currentTarget: unknown }) {
  if (!isWeb || event.target !== event.currentTarget) return
  const menu = event.currentTarget as HTMLElement
  setTimeout(() => {
    if (document.activeElement !== menu) return
    const item =
      menu.querySelector<HTMLElement>('[role="menuitem"][aria-current]:not([aria-disabled])') ??
      menu.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled])')
    item?.focus()
  })
}

const MenuRoot = forwardRef<TamaguiElement, MenuProps>(function Menu(
  { value: valueProp, defaultValue = '', onValueChange, children, onFocus, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <MenuContext.Provider value={{ value, select: setValue }}>
      {/* Web: one Tab stop; arrow keys move between items (WAI-ARIA menu).
          Keyboard focus entering the menu lands on the selected item. */}
      <RovingFocusGroup
        ref={ref}
        role="menu"
        aria-orientation="vertical"
        orientation="vertical"
        loop
        gap="$0.5"
        width="100%"
        onFocus={composeEventHandlers(onFocus, forwardFocusToItem)}
        {...props}
      >
        {children}
      </RovingFocusGroup>
    </MenuContext.Provider>
  )
})

export interface MenuItemProps extends Omit<GetProps<typeof View>, 'children'> {
  children: ReactNode
  /** Selects this item in the menu when chosen (see `Menu`'s `value`). */
  value?: string
  /** Leading icon; sized and tinted for you. */
  icon?: ReactNode
  /** Trailing content: a count, a Badge, a shortcut hint. */
  trailing?: ReactNode
  /** Mark as selected. Default: the menu's `value` equals this item's `value`. */
  selected?: boolean
  /** Style as a dangerous action (delete, sign out…). */
  destructive?: boolean
  disabled?: boolean
  /** Link target on web. On iOS/Android use `onSelect` (e.g. `router.push`). */
  href?: string
  /** Web: render your router's link, e.g. `render={<Link href="/inbox" />}`. */
  render?: GetProps<typeof View>['render']
  /** Called when the item is chosen. */
  onSelect?: () => void
}

const MenuItem = forwardRef<TamaguiElement, MenuItemProps>(function MenuItem(
  {
    children,
    value,
    icon,
    trailing,
    selected: selectedProp,
    destructive = false,
    disabled = false,
    href,
    render,
    onSelect,
    onPress,
    onPressIn,
    onPressOut,
    ...props
  },
  ref,
) {
  const menu = useMenu()
  const selected = selectedProp ?? (value !== undefined && menu.value === value)
  const isLink = isWeb && (href !== undefined || render !== undefined)
  const color = selected
    ? '$secondaryForeground'
    : destructive
      ? '$errorSoftForeground'
      : '$foreground'
  const ripple = useRipple({ color, disabled, onPressIn, onPressOut })

  const activate = () => {
    onSelect?.()
    if (value !== undefined) menu.select(value)
  }

  const semantics = isWeb
    ? {
        render: render ?? (href !== undefined ? 'a' : 'button'),
        // A disabled link must not navigate.
        ...(href !== undefined && !disabled && { href }),
        ...(!isLink && { type: 'button' }),
      }
    : {
        accessible: true,
        // Native has no aria-current; screen readers announce "selected".
        'aria-selected': selected,
        // VoiceOver / TalkBack double-tap sends "activate"; a plain onPress on
        // a non-button view is not guaranteed to receive it.
        accessibilityActions: [{ name: 'activate' }],
        onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
          if (!disabled && event.nativeEvent.actionName === 'activate') activate()
        },
      }

  return (
    <RovingFocusGroup.Item
      ref={ref}
      // Arrow keys skip disabled items; the menu itself is the Tab stop.
      focusable={!disabled}
      active={selected}
      tabIndex={-1}
      role="menuitem"
      {...semantics}
      aria-current={selected ? (isLink ? 'page' : 'true') : undefined}
      aria-disabled={disabled || undefined}
      position="relative"
      flexDirection="row"
      alignItems="center"
      minHeight="$10"
      paddingHorizontal="$3"
      paddingVertical={0}
      borderWidth={0}
      borderRadius="$md"
      backgroundColor="transparent"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.5 : 1}
      userSelect="none"
      hoverStyle={disabled || selected ? undefined : { backgroundColor: '$accent' }}
      pressStyle={
        disabled || selected || ripple.active ? undefined : { backgroundColor: '$accentHover' }
      }
      focusVisibleStyle={{
        outlineColor: '$ring',
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: -2,
      }}
      // Finger-sized rows on touch screens.
      $touchable={{ minHeight: '$12' }}
      onPress={(event) => {
        if (disabled) {
          event?.preventDefault?.()
          return
        }
        onPress?.(event)
        activate()
      }}
      {...props}
      {...ripple.props}
    >
      {/* The selected fill is always painted and faded in, because Android
          does not round a background that is added after the view mounts. */}
      <View
        aria-hidden
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        borderRadius="$md"
        backgroundColor="$secondary"
        opacity={selected ? 1 : 0}
        pointerEvents="none"
      />
      {ripple.element}
      {/* Positioned so it paints above the fill on web. */}
      <View position="relative" flex={1} flexDirection="row" alignItems="center" gap="$3">
        {icon ? (
          <IconDefaults size={18} color={selected || destructive ? color : '$mutedForeground'}>
            {icon}
          </IconDefaults>
        ) : null}
        <Text
          size="sm"
          weight={selected ? 'medium' : 'normal'}
          color={color}
          flex={1}
          // Items can be <button>s, which center their text.
          textAlign="left"
          truncate
        >
          {children}
        </Text>
        {trailing === undefined || trailing === null ? null : typeof trailing === 'string' ||
          typeof trailing === 'number' ? (
          <Text
            size="xs"
            tone={selected ? 'inherit' : 'muted'}
            color={selected ? color : undefined}
          >
            {trailing}
          </Text>
        ) : (
          trailing
        )}
      </View>
    </RovingFocusGroup.Item>
  )
})

export interface MenuGroupProps extends Omit<GetProps<typeof View>, 'children'> {
  children: ReactNode
  /** Visible heading that also names the group for screen readers. */
  label?: string
}

const MenuGroup = forwardRef<TamaguiElement, MenuGroupProps>(function MenuGroup(
  { children, label, ...props },
  ref,
) {
  const labelId = useId()
  return (
    <View
      ref={ref}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      gap="$0.5"
      {...props}
    >
      {label ? (
        <Text
          id={labelId}
          size="xs"
          weight="semibold"
          tone="muted"
          paddingHorizontal="$3"
          paddingTop="$2"
          paddingBottom="$1"
          {...(!isWeb && { role: 'heading' as const })}
        >
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  )
})

const MenuSeparator = styled(View, {
  name: 'MenuSeparator',
  role: isWeb ? 'separator' : 'none',
  'aria-hidden': !isWeb,
  height: 1,
  backgroundColor: '$border',
  marginVertical: '$2',
})

/**
 * An always-visible list of actions or destinations, with icons, groups and a
 * selected item — for sidebars, settings pages and panels. For a list that
 * opens from a button, use Dropdown Menu.
 */
export const Menu = withStaticProperties(MenuRoot, {
  Item: MenuItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
})
