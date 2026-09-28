import { Menu, withStaticProperties } from 'tamagui'
import { createMenuParts } from './menuParts'
import type { DropdownMenuProps, DropdownMenuTriggerProps } from './types'

// Web: Tamagui's menu (WAI-ARIA menu pattern, keyboard + type-ahead).
// iOS / Android: see DropdownMenu.native.tsx (bottom sheet).

const parts = createMenuParts(Menu)

function DropdownMenuRoot({
  children,
  side = 'bottom',
  align = 'start',
  ...props
}: DropdownMenuProps) {
  const placement = align === 'center' ? side : (`${side}-${align}` as const)
  return (
    <Menu placement={placement} offset={4} allowFlip stayInFrame={{ padding: 8 }} {...props}>
      {children}
    </Menu>
  )
}

function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  return <Menu.Trigger asChild>{children}</Menu.Trigger>
}

/**
 * A list of actions or options opened from a button. Keyboard and type-ahead
 * navigation on web; a bottom sheet on iOS and Android.
 */
export const DropdownMenu = withStaticProperties(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  ...parts,
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
