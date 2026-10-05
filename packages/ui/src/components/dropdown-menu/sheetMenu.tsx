import { CheckIcon, IconDefaults } from '@advui/icons'
import { type ReactNode, createContext, useContext } from 'react'
import { Sheet, View } from 'tamagui'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRipple } from '../../hooks/useRipple'
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
} from './types'
import { ariaState } from '../../utils/ariaState'

// iOS / Android menu, shared by Dropdown Menu and Context Menu (their
// `.native.tsx` files add the trigger). Native menus need a native module (not
// available in Expo Go), so the menu opens as a bottom sheet of large,
// labelled rows instead.

type MenuState = { open: boolean; setOpen: (open: boolean) => void }
const MenuContext = createContext<MenuState | null>(null)
const RadioContext = createContext<Pick<DropdownMenuRadioGroupProps, 'value' | 'onValueChange'>>({})

export function useSheetMenu() {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error('Menu parts must be rendered inside their menu (e.g. <DropdownMenu>).')
  return menu
}

// `side` and `align` place the web menu; the sheet ignores them.
function Root({ children, open: openProp, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  // Android: the back button closes the sheet instead of leaving the screen.
  useBackToClose(open, () => setOpen(false))
  return <MenuContext.Provider value={{ open, setOpen }}>{children}</MenuContext.Provider>
}

function Content({ children }: DropdownMenuContentProps) {
  const menu = useSheetMenu()
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
        borderTopLeftRadius="$dialog"
        borderTopRightRadius="$dialog"
        paddingHorizontal="$2"
        paddingTop="$2"
        paddingBottom="$8"
      >
        <Sheet.ScrollView>
          {/* The sheet renders in a portal, which does not carry React context. */}
          <MenuContext.Provider value={menu}>
            {/* The sheet stays mounted while closed; hide its rows from screen
                readers until it opens, and keep VoiceOver inside while open. */}
            <View role="menu" aria-hidden={!open || undefined} accessibilityViewIsModal={open}>
              {children}
            </View>
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
  const ripple = useRipple({ color: '$popoverForeground', disabled })
  return (
    <View
      role={role}
      accessible
      aria-checked={role === 'menuitem' ? undefined : checked}
      aria-disabled={ariaState(disabled)}
      flexDirection="row"
      alignItems="center"
      gap="$3"
      minHeight="$12"
      paddingHorizontal="$3"
      borderRadius="$md"
      opacity={disabled ? 0.5 : 1}
      pressStyle={disabled || ripple.active ? undefined : { backgroundColor: '$accent' }}
      onPress={disabled ? undefined : onPress}
      // VoiceOver / TalkBack double-tap sends "activate"; a plain onPress on a
      // non-button view is not guaranteed to receive it.
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event: { nativeEvent: { actionName: string } }) => {
        if (!disabled && event.nativeEvent.actionName === 'activate') onPress()
      }}
      {...ripple.props}
    >
      {ripple.element}
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

function Item({ children, icon, destructive, disabled, onSelect }: DropdownMenuItemProps) {
  const { setOpen } = useSheetMenu()
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

function CheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  icon,
  disabled,
}: DropdownMenuCheckboxItemProps) {
  const { setOpen } = useSheetMenu()
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

function RadioGroup({ children, value, onValueChange }: DropdownMenuRadioGroupProps) {
  return <RadioContext.Provider value={{ value, onValueChange }}>{children}</RadioContext.Provider>
}

function RadioItem({ children, value, icon, disabled }: DropdownMenuRadioItemProps) {
  const { setOpen } = useSheetMenu()
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

function Label({ children }: DropdownMenuLabelProps) {
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

function Separator() {
  return <View height={1} backgroundColor="$border" marginVertical="$1" />
}

function Group({ children }: DropdownMenuGroupProps) {
  return <View>{children}</View>
}

export const sheetMenu = {
  Root,
  Content,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  Label,
  Separator,
  Group,
}
