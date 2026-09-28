import { ContextMenu as TamaguiContextMenu, type Menu, withStaticProperties } from 'tamagui'
import { createMenuParts } from '../dropdown-menu/menuParts'
import type { ContextMenuProps, ContextMenuTriggerProps } from './types'

// Web: Tamagui's context menu — the menu opens at the pointer on right-click
// (or Shift+F10 / the Menu key) and after a long-press on touch screens.
// iOS / Android: see ContextMenu.native.tsx (long-press opens a bottom sheet).

// Same parts API as Menu, typed per primitive; the item styling is shared.
const parts = createMenuParts(TamaguiContextMenu as unknown as typeof Menu)

// Tamagui already flips the menu and keeps it inside the viewport by default.
function ContextMenuRoot({ children, onOpenChange }: ContextMenuProps) {
  return (
    <TamaguiContextMenu onOpenChange={(open: boolean) => onOpenChange?.(open)}>
      {children}
    </TamaguiContextMenu>
  )
}

function ContextMenuTrigger({ children, disabled = false, ...props }: ContextMenuTriggerProps) {
  return (
    <TamaguiContextMenu.Trigger
      disabled={disabled}
      // Tamagui renders a span; lay it out like any other block.
      display="flex"
      flexDirection="column"
      {...props}
    >
      {children}
    </TamaguiContextMenu.Trigger>
  )
}

/**
 * Actions for an area, opened with a right-click on desktop and a long-press
 * on touch screens. Offer the same actions somewhere visible too: context
 * menus are hidden until someone thinks to look for them.
 */
export const ContextMenu = withStaticProperties(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  ...parts,
})

export type {
  ContextMenuCheckboxItemProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuItemProps,
  ContextMenuLabelProps,
  ContextMenuProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuTriggerProps,
} from './types'
