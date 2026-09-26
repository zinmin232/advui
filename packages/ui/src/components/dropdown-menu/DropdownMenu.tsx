import { CheckIcon, IconDefaults } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import type { ReactNode } from 'react'
import { Menu, View, withStaticProperties } from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Text } from '../typography/Text'
import {
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuGroupProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  type DropdownMenuTriggerProps,
  textOf,
} from './types'

// Web: Tamagui's menu (WAI-ARIA menu pattern, keyboard + type-ahead).
// iOS / Android: see DropdownMenu.native.tsx (bottom sheet).

const itemFrame = {
  unstyled: true,
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  minHeight: '$8',
  paddingHorizontal: '$2',
  borderRadius: '$sm',
  cursor: 'pointer',
  // Pointer movement focuses items, so one style covers mouse and keyboard.
  focusStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: { outlineWidth: 0 },
  // Finger-sized rows on touch screens.
  $touchable: { minHeight: '$11' },
} as const

const disabledFrame = { opacity: 0.5, cursor: 'not-allowed' } as const

function ItemBody({
  children,
  icon,
  shortcut,
  destructive,
  leading,
}: Pick<DropdownMenuItemProps, 'children' | 'icon' | 'shortcut' | 'destructive'> & {
  leading?: ReactNode
}) {
  const color = destructive ? '$errorSoftForeground' : '$popoverForeground'
  return (
    <>
      {leading}
      {icon ? (
        <IconDefaults size={16} color={destructive ? color : '$mutedForeground'}>
          {icon}
        </IconDefaults>
      ) : null}
      <Menu.ItemTitle
        unstyled
        flex={1}
        fontFamily="$body"
        fontSize="$2"
        lineHeight="$2"
        color={color}
      >
        {children}
      </Menu.ItemTitle>
      {shortcut ? (
        <Text
          size="xs"
          tone="muted"
          letterSpacing={0.5}
          aria-hidden
          $touchable={{ display: 'none' }}
        >
          {shortcut}
        </Text>
      ) : null}
    </>
  )
}

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

function DropdownMenuContent({ children, minWidth = '$48' }: DropdownMenuContentProps) {
  const reducedMotion = useReducedMotion()
  return (
    <Menu.Portal zIndex={zIndex.popover}>
      <Menu.Content
        unstyled
        backgroundColor="$popover"
        borderWidth={1}
        borderColor="$border"
        borderRadius="$lg"
        padding="$1"
        minWidth={minWidth}
        {...shadows.md}
        enterStyle={{ opacity: 0, scale: 0.97, y: -4 }}
        exitStyle={{ opacity: 0, scale: 0.97, y: -4 }}
        opacity={1}
        scale={1}
        y={0}
        transition={reducedMotion ? null : 'quicker'}
        animateOnly={['transform', 'opacity']}
      >
        {children}
      </Menu.Content>
    </Menu.Portal>
  )
}

function DropdownMenuItem({
  children,
  icon,
  shortcut,
  destructive,
  disabled,
  onSelect,
  textValue,
}: DropdownMenuItemProps) {
  return (
    <Menu.Item
      {...itemFrame}
      {...(disabled ? disabledFrame : null)}
      disabled={disabled}
      onSelect={() => onSelect?.()}
      textValue={textOf(children, textValue)}
    >
      <ItemBody icon={icon} shortcut={shortcut} destructive={destructive}>
        {children}
      </ItemBody>
    </Menu.Item>
  )
}

/** Fixed-width slot so checked and unchecked items line up. */
function IndicatorSlot({ children }: { children: ReactNode }) {
  return (
    <View width="$4" alignItems="center" justifyContent="center">
      <Menu.ItemIndicator unstyled>{children}</Menu.ItemIndicator>
    </View>
  )
}

function DropdownMenuCheckboxItem({
  children,
  checked = false,
  onCheckedChange,
  icon,
  shortcut,
  disabled,
  textValue,
}: DropdownMenuCheckboxItemProps) {
  return (
    <Menu.CheckboxItem
      {...itemFrame}
      {...(disabled ? disabledFrame : null)}
      checked={checked}
      onCheckedChange={(next) => onCheckedChange?.(next === true)}
      disabled={disabled}
      textValue={textOf(children, textValue)}
    >
      <ItemBody
        icon={icon}
        shortcut={shortcut}
        leading={
          <IndicatorSlot>
            <CheckIcon size={14} color="$popoverForeground" />
          </IndicatorSlot>
        }
      >
        {children}
      </ItemBody>
    </Menu.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ children, value, onValueChange }: DropdownMenuRadioGroupProps) {
  return (
    <Menu.RadioGroup value={value} onValueChange={onValueChange}>
      {children}
    </Menu.RadioGroup>
  )
}

function DropdownMenuRadioItem({
  children,
  value,
  icon,
  shortcut,
  disabled,
  textValue,
}: DropdownMenuRadioItemProps) {
  return (
    <Menu.RadioItem
      {...itemFrame}
      {...(disabled ? disabledFrame : null)}
      value={value}
      disabled={disabled}
      textValue={textOf(children, textValue)}
    >
      <ItemBody
        icon={icon}
        shortcut={shortcut}
        leading={
          <IndicatorSlot>
            <View
              width="$2"
              height="$2"
              borderRadius="$full"
              backgroundColor="$popoverForeground"
            />
          </IndicatorSlot>
        }
      >
        {children}
      </ItemBody>
    </Menu.RadioItem>
  )
}

function DropdownMenuLabel({ children }: DropdownMenuLabelProps) {
  return (
    <Menu.Label
      unstyled
      paddingHorizontal="$2"
      paddingVertical="$1.5"
      fontFamily="$body"
      fontSize="$1"
      lineHeight="$1"
      fontWeight="600"
      color="$mutedForeground"
    >
      {children}
    </Menu.Label>
  )
}

function DropdownMenuSeparator() {
  return (
    <Menu.Separator
      unstyled
      height={1}
      backgroundColor="$border"
      marginVertical="$1"
      marginHorizontal="$-1"
    />
  )
}

function DropdownMenuGroup({ children }: DropdownMenuGroupProps) {
  return <Menu.Group>{children}</Menu.Group>
}

/**
 * A list of actions or options opened from a button. Keyboard and type-ahead
 * navigation on web; a bottom sheet on iOS and Android.
 */
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
