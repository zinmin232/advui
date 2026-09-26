import type { ReactElement, ReactNode } from 'react'

// Shared by DropdownMenu.tsx (web) and DropdownMenu.native.tsx so both
// platforms expose exactly the same API.

export interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Side of the trigger to open on (web). Default `bottom`. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment along that side (web). Default `start`. */
  align?: 'start' | 'center' | 'end'
}

export interface DropdownMenuTriggerProps {
  /** A single element, usually a Button or IconButton. */
  children: ReactElement
}

export interface DropdownMenuContentProps {
  children: ReactNode
  /** Minimum menu width (web). Default `$48`. */
  minWidth?: '$40' | '$48' | '$56' | '$64'
}

export interface DropdownMenuItemProps {
  children: ReactNode
  /** Leading icon; sized and tinted for you. */
  icon?: ReactNode
  /** Keyboard shortcut hint shown on the right (web only). */
  shortcut?: string
  /** Style as a dangerous action (delete, sign out…). */
  destructive?: boolean
  disabled?: boolean
  /** Called when the item is chosen; the menu then closes. */
  onSelect?: () => void
  /** Text used for type-ahead when `children` is not a string. */
  textValue?: string
}

export interface DropdownMenuCheckboxItemProps extends Omit<
  DropdownMenuItemProps,
  'onSelect' | 'destructive'
> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export interface DropdownMenuRadioGroupProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export interface DropdownMenuRadioItemProps extends Omit<
  DropdownMenuItemProps,
  'onSelect' | 'destructive'
> {
  value: string
}

export interface DropdownMenuLabelProps {
  children: ReactNode
}

export interface DropdownMenuGroupProps {
  children: ReactNode
}

export const textOf = (node: ReactNode, fallback?: string) =>
  fallback ?? (typeof node === 'string' || typeof node === 'number' ? String(node) : undefined)
