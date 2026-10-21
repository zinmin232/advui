import {
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react'
import { Menu, type TamaguiElement, useComposedRefs, withStaticProperties } from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { ariaState } from '../../utils/ariaState'
import { type FocusDetails, createMenuContent, createMenuParts } from '../dropdown-menu/menuParts'
import { useArrowKeys } from '../toolbar/arrowKeys'
import { Text } from '../typography/Text'
import { MenubarFrame, MenubarTriggerFrame } from './frames'
import type {
  MenubarContentProps,
  MenubarMenuProps,
  MenubarProps,
  MenubarTriggerProps,
} from './types'

// Web: the WAI-ARIA menubar pattern. The bar is one Tab stop and the arrow
// keys move between its triggers (Toolbar's roving focus). Each menu is
// Tamagui's non-modal menu with Dropdown Menu's items; the bar holds which one
// is open, so opening one closes the others.
// iOS / Android: see Menubar.native.tsx (each menu opens as a bottom sheet).

const parts = createMenuParts(Menu)
const BaseContent = createMenuContent(Menu)

type BarState = {
  value: string | null
  /** The open menu as of the last change, for handlers that run before a re-render. */
  valueRef: RefObject<string | null>
  /** The menu that was open when they all last closed. */
  closedRef: RefObject<string | null>
  setValue: (value: string | null) => void
  rootRef: RefObject<HTMLElement | null>
}

type MenuState = {
  value: string
  open: boolean
  contentId: string
  triggerRef: RefObject<HTMLElement | null>
}

const BarContext = createContext<BarState | null>(null)
const MenuContext = createContext<MenuState | null>(null)

function useBar(part: string) {
  const bar = useContext(BarContext)
  if (!bar) throw new Error(`Menubar.${part} must be rendered inside <Menubar>.`)
  return bar
}

function useMenu(part: string) {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error(`Menubar.${part} must be rendered inside <Menubar.Menu>.`)
  return menu
}

const VALUE = 'data-menubar-value'

/** The values of the enabled menus, in the order their triggers appear. */
function enabledMenus(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(`[${VALUE}]`)]
    .filter((el) => el.getAttribute('aria-disabled') !== 'true')
    .map((el) => el.getAttribute(VALUE)!)
}

const MenubarRoot = forwardRef<TamaguiElement, MenubarProps>(function Menubar(
  { children, value: valueProp, defaultValue = null, onValueChange, onFocus, onKeyDown, ...props },
  forwardedRef,
) {
  const [value, setState] = useControllableState<string | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const valueRef = useRef(value)
  const shownRef = useRef(value)
  const closedRef = useRef<string | null>(null)
  useLayoutEffect(() => {
    if (value === null && shownRef.current !== null) closedRef.current = shownRef.current
    shownRef.current = value
    valueRef.current = value
  })
  const setValue = (next: string | null) => {
    valueRef.current = next
    setState(next)
  }
  const ref = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, forwardedRef)
  const rootRef = ref as RefObject<HTMLElement | null>
  const arrowKeys = useArrowKeys(rootRef, true, 'horizontal')

  return (
    <BarContext.Provider value={{ value, valueRef, closedRef, setValue, rootRef }}>
      <MenubarFrame
        ref={composedRef}
        role="menubar"
        {...props}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        {...(arrowKeys && {
          ...arrowKeys,
          onFocus: (event: Parameters<NonNullable<typeof onFocus>>[0]) => {
            onFocus?.(event)
            arrowKeys.onFocus(event)
          },
          onKeyDown: (event: Parameters<NonNullable<typeof onKeyDown>>[0]) => {
            onKeyDown?.(event)
            arrowKeys.onKeyDown(event as never)
          },
        })}
      >
        {children}
      </MenubarFrame>
    </BarContext.Provider>
  )
})

/** One menu in the bar: a `Menubar.Trigger` and the `Menubar.Content` it opens. */
function MenubarMenu({ children, value: valueProp }: MenubarMenuProps) {
  const bar = useBar('Menu')
  const generated = useId()
  const value = valueProp ?? generated
  const contentId = useId()
  const triggerRef = useRef<HTMLElement>(null)
  const open = bar.value === value
  return (
    <MenuContext.Provider value={{ value, open, contentId, triggerRef }}>
      <Menu
        open={open}
        // Tamagui reports only closing: Escape, a choice, or a press or focus
        // outside. Moving to another trigger counts as outside, and by then that
        // menu is the open one.
        onOpenChange={(next: boolean) => {
          if (!next && bar.valueRef.current === value) bar.setValue(null)
        }}
        modal={false}
        placement="bottom-start"
        offset={4}
        allowFlip
        stayInFrame={{ padding: 8 }}
      >
        {children}
      </Menu>
    </MenuContext.Provider>
  )
}

type TriggerPointerEvent = {
  pointerType: string
  button: number
  ctrlKey: boolean
  preventDefault: () => void
}

/** The button in the bar that opens its menu. */
function MenubarTrigger({ children, disabled = false }: MenubarTriggerProps) {
  const bar = useBar('Trigger')
  const menu = useMenu('Trigger')
  const ref = menu.triggerRef
  // The kind of pointer that pressed last: mouse opens on press, touch on release.
  const pointer = useRef('')
  const toggle = () => bar.setValue(menu.open ? null : menu.value)

  // Given to Menu.Trigger, these replace Tamagui's own open handlers (the
  // child's would run after them): the bar decides which menu is open.
  const handlers = {
    onPointerDown: (event: TriggerPointerEvent) => {
      pointer.current = event.pointerType
      if (disabled || event.pointerType !== 'mouse' || event.button !== 0 || event.ctrlKey) return
      // Keep focus off the trigger, so the menu that opens can take it.
      if (!menu.open) event.preventDefault()
      toggle()
    },
    onClick: () => {
      if (disabled || (pointer.current !== 'touch' && pointer.current !== 'pen')) return
      pointer.current = ''
      toggle()
    },
    // While a menu is open, pointing at another trigger opens its menu instead.
    onPointerEnter: (event: TriggerPointerEvent) => {
      if (disabled || event.pointerType !== 'mouse') return
      if (bar.valueRef.current === null || menu.open) return
      bar.setValue(menu.value)
      ref.current?.focus()
    },
    onKeyDown: (event: { key: string; preventDefault: () => void }) => {
      if (disabled || !['Enter', ' ', 'ArrowDown'].includes(event.key)) return
      // No click from Enter or Space, and no page scroll from ArrowDown.
      event.preventDefault()
      if (event.key === 'ArrowDown') bar.setValue(menu.value)
      else toggle()
    },
  }

  return (
    <Menu.Trigger asChild disabled={disabled} {...(handlers as object)}>
      <MenubarTriggerFrame
        ref={ref as never}
        render="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.contentId : undefined}
        aria-disabled={ariaState(disabled)}
        // The bar's roving focus leaves disabled triggers alone; keep them out
        // of the Tab order too, as the arrow keys skip them.
        tabIndex={disabled ? -1 : undefined}
        {...{ type: 'button', [VALUE]: menu.value }}
        open={menu.open}
        disabled={disabled}
      >
        <Text size="sm" color="foreground" userSelect="none" weight="medium">
          {children}
        </Text>
      </MenubarTriggerFrame>
    </Menu.Trigger>
  )
}

/** The menu's items. Same parts as Dropdown Menu: `Menubar.Item`, `Menubar.CheckboxItem`… */
function MenubarContent(props: MenubarContentProps) {
  const bar = useBar('Content')
  const menu = useMenu('Content')
  // Focusing the menu itself lets it move focus to its first item when it
  // was opened from the keyboard.
  const focusMenu = () => {
    const el = document.getElementById(menu.contentId)
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true })
  }
  // Set by a press outside the menu, which takes focus where it lands.
  const pressedOutside = useRef(false)
  // A menu reopened while it still animates out is not mounted again, so
  // Tamagui does not focus it.
  useEffect(() => {
    if (!menu.open) return
    pressedOutside.current = false
    focusMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.open])

  return (
    <BaseContent
      {...props}
      id={menu.contentId}
      pointerEvents="auto"
      onOpenAutoFocus={(details: FocusDetails) => {
        // Tamagui focuses the first menu in the page, which is the previous
        // one while it animates out.
        details.cancel()
        focusMenu()
      }}
      onEscapeKeyDown={() => {
        // Escape goes to the menu layered on top, which can be one still
        // closing after another took its place (that one reopened below it
        // while it was closing too). Close the open menu instead.
        const open = bar.valueRef.current
        if (open !== null && open !== menu.value) bar.setValue(null)
      }}
      onPointerDownOutside={() => {
        pressedOutside.current = true
      }}
      onCloseAutoFocus={(details: FocusDetails) => {
        // Replaces Tamagui's, which keeps focus where it is after any focus
        // outside, even one before the menu was reopened.
        details.cancel()
        // Focus goes back to the trigger when the bar closed from this menu
        // (Escape, a choice), not when another menu took its place.
        if (pressedOutside.current || bar.valueRef.current !== null) return
        if (bar.closedRef.current !== menu.value) return
        // After the next render, so a dialog opened by the choice keeps focus.
        requestAnimationFrame(() => {
          const active = document.activeElement
          if (!active || active === document.body) menu.triggerRef.current?.focus()
        })
      }}
      onFocusOutside={(details: FocusDetails) => {
        // Focus on a trigger in the bar is the bar's to handle (hover, a press).
        const target = (details.event?.target ?? null) as Node | null
        if (target && bar.rootRef.current?.contains(target)) details.cancel()
      }}
      onKeyDown={(event: { key: string; preventDefault: () => void }) => {
        const root = bar.rootRef.current
        if (!root || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
        event.preventDefault()
        // Left and right open the previous and next menu, wrapping at the ends.
        const rtl = getComputedStyle(root).direction === 'rtl'
        const step = (event.key === 'ArrowRight') !== rtl ? 1 : -1
        const values = enabledMenus(root)
        const index = values.indexOf(menu.value)
        const next = values[(index + step + values.length) % values.length]
        if (next !== undefined) bar.setValue(next)
      }}
    />
  )
}

/**
 * A bar of menus, as at the top of a desktop app: File, Edit, View. The arrow
 * keys move along the bar and between open menus. On iOS and Android each menu
 * opens as a bottom sheet.
 */
export const Menubar = withStaticProperties(MenubarRoot, {
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  ...parts,
  Content: MenubarContent,
})

export type {
  MenubarCheckboxItemProps,
  MenubarContentProps,
  MenubarGroupProps,
  MenubarItemProps,
  MenubarLabelProps,
  MenubarMenuProps,
  MenubarProps,
  MenubarRadioGroupProps,
  MenubarRadioItemProps,
  MenubarTriggerProps,
} from './types'
