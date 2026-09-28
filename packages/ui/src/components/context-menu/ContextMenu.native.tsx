import { View, withStaticProperties } from 'tamagui'
import { sheetMenu, useSheetMenu } from '../dropdown-menu/sheetMenu'
import type { ContextMenuProps, ContextMenuTriggerProps } from './types'

// iOS / Android: a long-press on the area opens Dropdown Menu's bottom sheet.

const { Root, ...parts } = sheetMenu

function ContextMenuRoot({ children, onOpenChange }: ContextMenuProps) {
  return <Root onOpenChange={onOpenChange}>{children}</Root>
}

function ContextMenuTrigger({ children, disabled = false, ...props }: ContextMenuTriggerProps) {
  const { setOpen } = useSheetMenu()
  return (
    <View
      // Screen readers cannot long-press an area they don't focus, so the area
      // is one element whose "long press" action (listed by VoiceOver and
      // TalkBack) opens the menu.
      accessible
      accessibilityHint={disabled ? undefined : 'Long press for options'}
      accessibilityActions={disabled ? undefined : [{ name: 'longpress', label: 'Options' }]}
      onAccessibilityAction={(event: { nativeEvent: { actionName: string } }) => {
        if (event.nativeEvent.actionName === 'longpress') setOpen(true)
      }}
      onLongPress={disabled ? undefined : () => setOpen(true)}
      {...props}
    >
      {children}
    </View>
  )
}

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
