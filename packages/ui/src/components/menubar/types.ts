import type { ReactNode } from 'react'
import type { GetProps } from 'tamagui/unstyled'
import type {
  DropdownMenuCheckboxItemProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
} from '../dropdown-menu/types'
import type { MenubarFrame } from './frames'

// Shared by Menubar.tsx (web) and Menubar.native.tsx so both platforms expose
// exactly the same API. The items are Dropdown Menu's.

export interface MenubarProps extends Omit<
  GetProps<typeof MenubarFrame>,
  'role' | 'children' | 'defaultValue'
> {
  /** `Menubar.Menu` elements. */
  children: ReactNode
  /** Names the bar, e.g. "Editor". Recommended; needed when a page has several. */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** The open menu's `value`, or null when all are closed (controlled). */
  value?: string | null
  defaultValue?: string | null
  /** Called when a menu opens, another takes its place, or all close (null). */
  onValueChange?: (value: string | null) => void
}

export interface MenubarMenuProps {
  /** A `Menubar.Trigger` and a `Menubar.Content`. */
  children: ReactNode
  /** Identifies the menu for `value` / `onValueChange`. Default: generated. */
  value?: string
}

export interface MenubarTriggerProps {
  /** The menu's name, e.g. "File". */
  children: ReactNode
  /** Skipped by the arrow keys and cannot open. */
  disabled?: boolean
}

export type MenubarContentProps = DropdownMenuContentProps
export type MenubarItemProps = DropdownMenuItemProps
export type MenubarCheckboxItemProps = DropdownMenuCheckboxItemProps
export type MenubarRadioGroupProps = DropdownMenuRadioGroupProps
export type MenubarRadioItemProps = DropdownMenuRadioItemProps
export type MenubarLabelProps = DropdownMenuLabelProps
export type MenubarGroupProps = DropdownMenuGroupProps
