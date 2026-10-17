import { createContext, forwardRef, useContext, useId } from 'react'
import { type TamaguiElement, withStaticProperties } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { ariaState } from '../../utils/ariaState'
import { sheetMenu, useSheetMenu } from '../dropdown-menu/sheetMenu'
import { Text } from '../typography/Text'
import { MenubarFrame, MenubarTriggerFrame } from './frames'
import type { MenubarMenuProps, MenubarProps, MenubarTriggerProps } from './types'

// iOS / Android: a row of buttons, each opening its menu as a bottom sheet of
// large rows (Dropdown Menu's, see sheetMenu.tsx). There is no arrow-key
// movement, so the bar is not a `menubar` to screen readers, only its buttons.

const { Root: SheetRoot, ...parts } = sheetMenu

type BarState = { value: string | null; setValue: (value: string | null) => void }

const BarContext = createContext<BarState | null>(null)

const MenubarRoot = forwardRef<TamaguiElement, MenubarProps>(function Menubar(
  { children, value: valueProp, defaultValue = null, onValueChange, ...props },
  ref,
) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <BarContext.Provider value={{ value, setValue }}>
      <MenubarFrame ref={ref} {...props}>
        {children}
      </MenubarFrame>
    </BarContext.Provider>
  )
})

function MenubarMenu({ children, value: valueProp }: MenubarMenuProps) {
  const bar = useContext(BarContext)
  if (!bar) throw new Error('Menubar.Menu must be rendered inside <Menubar>.')
  const generated = useId()
  const value = valueProp ?? generated
  // The sheet holds the Android back button while open (useBackToClose).
  return (
    <SheetRoot
      open={bar.value === value}
      onOpenChange={(open) => {
        if (open) bar.setValue(value)
        else if (bar.value === value) bar.setValue(null)
      }}
    >
      {children}
    </SheetRoot>
  )
}

function MenubarTrigger({ children, disabled = false }: MenubarTriggerProps) {
  const { open, setOpen } = useSheetMenu()
  const ripple = useRipple({ color: '$foreground', disabled })
  return (
    <MenubarTriggerFrame
      // iOS has no trait for a menu item; a button says it can be pressed.
      role="button"
      accessible
      aria-expanded={open}
      aria-disabled={ariaState(disabled)}
      open={open}
      disabled={disabled}
      onPress={disabled ? undefined : () => setOpen(!open)}
      {...ripple.props}
    >
      {ripple.element}
      <Text size="sm" weight="medium" color="$foreground">
        {children}
      </Text>
    </MenubarTriggerFrame>
  )
}

export const Menubar = withStaticProperties(MenubarRoot, {
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  ...parts,
})

export type {
  MenubarCheckboxItemProps,
  MenubarContentProps,
  MenubarGroupProps,
  MenubarItemProps,
  MenubarLabelProps,
  MenubarMenuProps,
  MenubarProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarTriggerProps,
} from './types'
