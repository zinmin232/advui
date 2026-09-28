import { CheckIcon, IconDefaults } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import type { ReactNode } from 'react'
import { type Menu, View } from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Text } from '../typography/Text'
import {
  type DropdownMenuCheckboxItemProps,
  type DropdownMenuContentProps,
  type DropdownMenuGroupProps,
  type DropdownMenuItemProps,
  type DropdownMenuLabelProps,
  type DropdownMenuRadioGroupProps,
  type DropdownMenuRadioItemProps,
  textOf,
} from './types'

// Web menu surface and items, shared by Dropdown Menu and Context Menu. Each
// wraps its own Tamagui primitive (they use separate contexts) with the same
// parts API, so the parts are built once per primitive.

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

export function createMenuParts(Primitive: typeof Menu) {
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
        <Primitive.ItemTitle
          unstyled
          flex={1}
          fontFamily="$body"
          fontSize="$2"
          lineHeight="$2"
          color={color}
        >
          {children}
        </Primitive.ItemTitle>
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

  function Content({ children, minWidth = '$48' }: DropdownMenuContentProps) {
    const reducedMotion = useReducedMotion()
    return (
      <Primitive.Portal zIndex={zIndex.popover}>
        <Primitive.Content
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
        </Primitive.Content>
      </Primitive.Portal>
    )
  }

  function Item({
    children,
    icon,
    shortcut,
    destructive,
    disabled,
    onSelect,
    textValue,
  }: DropdownMenuItemProps) {
    return (
      <Primitive.Item
        {...itemFrame}
        {...(disabled ? disabledFrame : null)}
        disabled={disabled}
        onSelect={() => onSelect?.()}
        textValue={textOf(children, textValue)}
      >
        <ItemBody icon={icon} shortcut={shortcut} destructive={destructive}>
          {children}
        </ItemBody>
      </Primitive.Item>
    )
  }

  /** Fixed-width slot so checked and unchecked items line up. */
  function IndicatorSlot({ children }: { children: ReactNode }) {
    return (
      <View width="$4" alignItems="center" justifyContent="center">
        <Primitive.ItemIndicator unstyled>{children}</Primitive.ItemIndicator>
      </View>
    )
  }

  function CheckboxItem({
    children,
    checked = false,
    onCheckedChange,
    icon,
    shortcut,
    disabled,
    textValue,
  }: DropdownMenuCheckboxItemProps) {
    return (
      <Primitive.CheckboxItem
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
      </Primitive.CheckboxItem>
    )
  }

  function RadioGroup({ children, value, onValueChange }: DropdownMenuRadioGroupProps) {
    return (
      <Primitive.RadioGroup value={value} onValueChange={onValueChange}>
        {children}
      </Primitive.RadioGroup>
    )
  }

  function RadioItem({
    children,
    value,
    icon,
    shortcut,
    disabled,
    textValue,
  }: DropdownMenuRadioItemProps) {
    return (
      <Primitive.RadioItem
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
      </Primitive.RadioItem>
    )
  }

  function Label({ children }: DropdownMenuLabelProps) {
    return (
      <Primitive.Label
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
      </Primitive.Label>
    )
  }

  function Separator() {
    return (
      <Primitive.Separator
        unstyled
        height={1}
        backgroundColor="$border"
        marginVertical="$1"
        marginHorizontal="$-1"
      />
    )
  }

  function Group({ children }: DropdownMenuGroupProps) {
    return <Primitive.Group>{children}</Primitive.Group>
  }

  return { Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Group }
}
