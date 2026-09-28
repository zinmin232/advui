import { type ReactElement, cloneElement } from 'react'
import { withStaticProperties } from 'tamagui'
import { sheetMenu, useSheetMenu } from './sheetMenu'
import type { DropdownMenuTriggerProps } from './types'

// iOS / Android: a bottom sheet of large rows (see sheetMenu.tsx).

const { Root, ...parts } = sheetMenu

type PressableChild = ReactElement<{
  onPress?: (event: unknown) => void
  'aria-haspopup'?: string
  'aria-expanded'?: boolean
}>

function DropdownMenuTrigger({ children }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useSheetMenu()
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

export const DropdownMenu = withStaticProperties(Root, {
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
