import { CheckIcon, IconDefaults } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import type { ReactElement, ReactNode } from 'react'
import { type Menu, View } from 'tamagui/unstyled'
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
import { transformOpacity } from '../../utils/transition'

// Web menu surface and items, shared by Dropdown Menu and Context Menu. Each
// wraps its own Tamagui primitive (they use separate contexts) with the same
// parts API, so the parts are built once per primitive.

const itemFrame = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: '2',
  // Finger-sized rows on touch screens.
  minHeight: '8 touchable:11',
  paddingHorizontal: '2',
  borderRadius: 'sm',
  cursor: 'pointer',
  // Pointer movement focuses items, so one style covers mouse and keyboard.
  backgroundColor: 'focus:accent press:accentHover',
  outlineWidth: 'focus-visible:0',
} as const

const disabledFrame = { opacity: 0.5, cursor: 'not-allowed' } as const

/** What a menu built on these parts passes to the content beyond its props (Menubar). */
/** What Tamagui 3 passes to focus and dismiss handlers: the event, and a way to cancel. */
export type FocusDetails = { event?: Event | undefined; cancel(): void }

export type MenuContentOptions = {
  id?: string
  /**
   * The portal is `pointer-events: none`; modal menus turn the content's back
   * on, non-modal ones need `auto` here.
   */
  pointerEvents?: 'auto'
  onKeyDown?: (event: { key: string; preventDefault: () => void }) => void
  /** Tamagui's menu takes it at runtime; its types leave it out. */
  onOpenAutoFocus?: (details: FocusDetails) => void
  onCloseAutoFocus?: (details: FocusDetails) => void
  onEscapeKeyDown?: () => void
  onPointerDownOutside?: () => void
  onFocusOutside?: (details: FocusDetails) => void
}

/** The menu surface. Menus take it from `createMenuParts`, without the options. */
export function createMenuContent(Primitive: typeof Menu) {
  return function Content({
    children,
    minWidth = '48',
    ...options
  }: DropdownMenuContentProps & MenuContentOptions) {
    const reducedMotion = useReducedMotion()
    return (
      <Primitive.Portal zIndex={zIndex.popover}>
        <Primitive.Content
          {...(options as object)}
          backgroundColor="popover"
          borderWidth={1}
          borderColor="border"
          borderRadius="lg"
          padding="1"
          minWidth={minWidth}
          {...shadows.md}
          opacity={{ default: 1, enter: 0, exit: 0 }}
          scale={{ default: 1, enter: 0.97, exit: 0.97 }}
          y={{ default: 0, enter: -4, exit: -4 }}
          transition={transformOpacity(reducedMotion ? null : 'quicker')}
        >
          {children}
        </Primitive.Content>
      </Primitive.Portal>
    )
  }
}

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
    const color = destructive ? 'errorSoftForeground' : 'popoverForeground'
    return (
      <>
        {leading}
        {icon ? (
          <IconDefaults size={16} color={destructive ? color : 'mutedForeground'}>
            {icon}
          </IconDefaults>
        ) : null}
        <Primitive.ItemTitle flex={1} fontFamily="body" fontSize="2" lineHeight="2" color={color}>
          {children}
        </Primitive.ItemTitle>
        {shortcut ? (
          <Text size="xs" letterSpacing={0.5} display="touchable:none" tone="muted" aria-hidden>
            {shortcut}
          </Text>
        ) : null}
      </>
    )
  }

  const Content: (props: DropdownMenuContentProps) => ReactElement = createMenuContent(Primitive)

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
      <View width="4" alignItems="center" justifyContent="center">
        <Primitive.ItemIndicator>{children}</Primitive.ItemIndicator>
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
              <CheckIcon size={14} color="popoverForeground" />
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
              <View width="2" height="2" borderRadius="full" backgroundColor="popoverForeground" />
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
        paddingHorizontal="2"
        paddingVertical="1-5"
        fontFamily="body"
        fontSize="1"
        lineHeight="1"
        fontWeight="600"
        color="mutedForeground"
      >
        {children}
      </Primitive.Label>
    )
  }

  function Separator() {
    return (
      <Primitive.Separator
        height={1}
        backgroundColor="border"
        marginVertical="1"
        marginHorizontal="-1"
      />
    )
  }

  function Group({ children }: DropdownMenuGroupProps) {
    return <Primitive.Group>{children}</Primitive.Group>
  }

  return { Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Group }
}
