import { CheckIcon, IconDefaults } from '@advui/icons'
import { type ReactElement, type ReactNode, cloneElement, createContext, useContext } from 'react'
import { Sheet, View, withStaticProperties } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Text } from '../typography/Text'
import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuTriggerProps,
} from './types'

// iOS / Android: native menus need a native module (not available in Expo Go),
// so the menu opens as a bottom sheet of large, labelled rows instead.

type MenuState = { open: boolean; setOpen: (open: boolean) => void }
const MenuContext = createContext<MenuState | null>(null)
const RadioContext = createContext<Pick<DropdownMenuRadioGroupProps, 'value' | 'onValueChange'>>({})

function useMenu() {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error('DropdownMenu parts must be rendered inside <DropdownMenu>.')
  return menu
}

function DropdownMenuRoot({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  return <MenuContext.Provider value={{ open, setOpen }}>{children}</MenuContext.Provider>
}

type PressableChild = ReactElement<{
  onPress?: (event: unknown) => void
  'aria-haspopup'?: string
  'aria-expanded'?: boolean
}>

function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useMenu()
  const child = children as PressableChild
  return cloneElement(child, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    onPress: (event: unknown) => {
      child.props.onPress?.(event)
      setOpen(!open)
    },
  })
}

function DropdownMenuContent({ children }: DropdownMenuContentProps) {
  const menu = useMenu()
  const { open, setOpen } = menu
  const reducedMotion = useReducedMotion()
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      modal
      dismissOnSnapToBottom
      snapPointsMode="fit"
      transition={reducedMotion ? undefined : 'medium'}
    >
      <Sheet.Overlay
        backgroundColor="$overlay"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        transition={reducedMotion ? undefined : 'quick'}
      />
      <Sheet.Handle backgroundColor="$borderStrong" />
      <Sheet.Frame
        backgroundColor="$popover"
        paddingHorizontal="$2"
        paddingTop="$2"
        paddingBottom="$8"
      >
        <Sheet.ScrollView>
          {/* The sheet renders in a portal, which does not carry React context. */}
          <MenuContext.Provider value={menu}>
            <View role="menu">{children}</View>
          </MenuContext.Provider>
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}

function Row({
  role,
  checked,
  disabled,
  onPress,
  children,
}: {
  role: 'menuitem' | 'checkbox' | 'radio'
  checked?: boolean
  disabled?: boolean
  onPress: () => void
  children: ReactNode
}) {
  return (
    <View
      role={role}
      accessible
      aria-checked={role === 'menuitem' ? undefined : checked}
      aria-disabled={disabled || undefined}
      flexDirection="row"
      alignItems="center"
      gap="$3"
      minHeight="$12"
      paddingHorizontal="$3"
      borderRadius="$md"
      opacity={disabled ? 0.5 : 1}
      pressStyle={disabled ? undefined : { backgroundColor: '$accent' }}
      onPress={disabled ? undefined : onPress}
      // VoiceOver / TalkBack double-tap sends "activate"; a plain onPress on a
      // non-button view is not guaranteed to receive it.
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event: { nativeEvent: { actionName: string } }) => {
        if (!disabled && event.nativeEvent.actionName === 'activate') onPress()
      }}
    >
      {children}
    </View>
  )
}

function Title({ children, destructive }: { children: ReactNode; destructive?: boolean }) {
  return (
    <Text flex={1} color={destructive ? '$errorSoftForeground' : '$popoverForeground'}>
      {children}
    </Text>
  )
}

function Icon({ icon, destructive }: { icon?: ReactNode; destructive?: boolean }) {
  if (!icon) return null
  return (
    <IconDefaults size={20} color={destructive ? '$errorSoftForeground' : '$mutedForeground'}>
      {icon}
    </IconDefaults>
  )
}

function DropdownMenuItem({
  children,
  icon,
  destructive,
  disabled,
  onSelect,
}: DropdownMenuItemProps) {
  const { setOpen } = useMenu()
  return (
    <Row
      role="menuitem"
      disabled={disabled}
      onPress={() => {
        onSelect?.()
        setOpen(false)
      }}
    >
      <Icon icon={icon} destructive={destructive} />
      <Title destructive={destructive}>{children}</Title>
    </Row>
  )
}

function Indicator({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <View width="$5" alignItems="center" justifyContent="center">
      {visible ? children : null}
    </View>
  )
}

function DropdownMenuCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  icon,
  disabled,
}: DropdownMenuCheckboxItemProps) {
  const { setOpen } = useMenu()
  return (
    <Row
      role="checkbox"
      checked={checked}
      disabled={disabled}
      onPress={() => {
        onCheckedChange?.(!checked)
        setOpen(false)
      }}
    >
      <Indicator visible={checked}>
        <CheckIcon size={18} color="$popoverForeground" />
      </Indicator>
      <Icon icon={icon} />
      <Title>{children}</Title>
    </Row>
  )
}

function DropdownMenuRadioGroup({ children, value, onValueChange }: DropdownMenuRadioGroupProps) {
  return <RadioContext.Provider value={{ value, onValueChange }}>{children}</RadioContext.Provider>
}

function DropdownMenuRadioItem({ children, value, icon, disabled }: DropdownMenuRadioItemProps) {
  const { setOpen } = useMenu()
  const group = useContext(RadioContext)
  const checked = group.value === value
  return (
    <Row
      role="radio"
      checked={checked}
      disabled={disabled}
      onPress={() => {
        group.onValueChange?.(value)
        setOpen(false)
      }}
    >
      <Indicator visible={checked}>
        <View width="$2" height="$2" borderRadius="$full" backgroundColor="$popoverForeground" />
      </Indicator>
      <Icon icon={icon} />
      <Title>{children}</Title>
    </Row>
  )
}

function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return (
    <Text
      role="heading"
      size="xs"
      weight="semibold"
      tone="muted"
      paddingHorizontal="$3"
      paddingTop="$3"
      paddingBottom="$1"
    >
      {children}
    </Text>
  )
}

function DropdownMenuSeparator() {
  return <View height={1} backgroundColor="$border" marginVertical="$1" />
}

function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <View>{children}</View>
}

export const DropdownMenu = withStaticProperties(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
  Group: DropdownMenuGroup,
})

export type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuTriggerProps,
} from './types'
