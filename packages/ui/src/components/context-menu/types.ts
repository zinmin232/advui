import type { ReactNode } from 'react'
import type { GetProps, View } from 'tamagui'
import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
} from '../dropdown-menu/types'

// Shared by ContextMenu.tsx (web) and ContextMenu.native.tsx. The items are
// Dropdown Menu's, so both menus look and behave the same once open.

export interface ContextMenuProps {
  children: ReactNode
  /** Called when the menu opens (right-click or long-press) or closes. */
  onOpenChange?: (open: boolean) => void
}

export interface ContextMenuTriggerProps extends Omit<GetProps<typeof View>, 'children'> {
  /** The area that opens the menu: a card, a row, a canvas… */
  children: ReactNode
  /** Ignore right-click and long-press. */
  disabled?: boolean
}

export type ContextMenuContentProps = DropdownMenuContentProps
export type ContextMenuItemProps = DropdownMenuItemProps
export type ContextMenuCheckboxItemProps = DropdownMenuCheckboxItemProps
export type ContextMenuRadioGroupProps = DropdownMenuRadioGroupProps
export type ContextMenuRadioItemProps = DropdownMenuRadioItemProps
export type ContextMenuLabelProps = DropdownMenuLabelProps
export type ContextMenuGroupProps = DropdownMenuGroupProps
