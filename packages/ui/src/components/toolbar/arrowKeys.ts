import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react'
import { isWeb } from 'tamagui'

/**
 * Set on a Toolbar with `role="toolbar"`. Controls that move focus with the
 * arrow keys themselves (Toggle Group) leave the keys and the Tab stop to it.
 */
export const ARROW_TOOLBAR = 'data-toolbar-arrows'

/** True when `el` sits in a Toolbar whose arrow keys move focus. */
export function inArrowToolbar(el: Element | null | undefined) {
  return !!el?.closest(`[${ARROW_TOOLBAR}]`)
}

// Anything that can take focus. `[tabindex]` also finds the items this
// toolbar took out of the Tab order (tabindex -1).
const FOCUSABLE = 'button, a[href], input, select, textarea, [contenteditable], [tabindex]'

// Fields keep their own Tab stop and arrow keys, which move the caret or
// change the value; the arrow keys move between the other controls.
const FIELD = [
  'input:not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="reset"]):not([type="submit"])',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
].join(', ')

type KeyEvent = {
  key: string
  target: unknown
  defaultPrevented: boolean
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  preventDefault: () => void
}

/**
 * The WAI-ARIA toolbar keyboard pattern, on web: the toolbar is one Tab stop
 * (the control focused last, else the first), and the arrow keys along
 * `orientation`, Home and End move between its enabled controls, wrapping
 * at the ends. Returns the props for the toolbar's root, or null when off.
 */
export function useArrowKeys(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  orientation: 'horizontal' | 'vertical',
) {
  const active = useRef<HTMLElement | null>(null)
  // Each control's tabindex attribute before the toolbar changed it, to put back.
  const original = useRef(new Map<HTMLElement, string | null>())
  const on = isWeb && enabled

  const items = () => {
    const root = ref.current
    if (!root) return []
    return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) =>
        (el.tabIndex >= 0 || original.current.has(el)) &&
        !el.matches(FIELD) &&
        !el.matches(':disabled') &&
        el.getAttribute('aria-disabled') !== 'true' &&
        // A nested toolbar manages its own controls.
        el.closest(`[${ARROW_TOOLBAR}]`) === root &&
        el.checkVisibility?.() !== false,
    )
  }

  const sync = () => {
    const all = items()
    const current = active.current && all.includes(active.current) ? active.current : all[0]
    active.current = current ?? null
    for (const el of all) {
      if (!original.current.has(el)) original.current.set(el, el.getAttribute('tabindex'))
      el.tabIndex = el === current ? 0 : -1
    }
    for (const el of original.current.keys()) if (!el.isConnected) original.current.delete(el)
  }

  // After every render, and when a control is added, removed or disabled by
  // a child that re-rendered on its own.
  useLayoutEffect(() => {
    if (on) sync()
  })
  useEffect(() => {
    const root = ref.current
    if (!on || !root) return
    const observer = new MutationObserver(sync)
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled', 'hidden'],
    })
    const taken = original.current
    return () => {
      observer.disconnect()
      for (const [el, value] of taken) {
        if (value === null) el.removeAttribute('tabindex')
        else el.setAttribute('tabindex', value)
      }
      taken.clear()
      active.current = null
    }
    // `sync` reads refs only, so the observer can keep the first one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])

  if (!on) return null

  return {
    [ARROW_TOOLBAR]: '',
    // A click or a nested control moving focus makes that control the Tab stop.
    onFocus: (event: { target: unknown }) => {
      const el = event.target as HTMLElement
      if (!items().includes(el)) return
      active.current = el
      sync()
    },
    onKeyDown: (event: KeyEvent) => {
      // Already used by a nested control, such as an open menu, or a shortcut.
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
      const root = ref.current
      const all = items()
      const index = all.indexOf(event.target as HTMLElement)
      if (!root || index === -1) return
      const horizontal = orientation === 'horizontal'
      const rtl = horizontal && getComputedStyle(root).direction === 'rtl'
      const [back, forward] = horizontal
        ? rtl
          ? ['ArrowRight', 'ArrowLeft']
          : ['ArrowLeft', 'ArrowRight']
        : ['ArrowUp', 'ArrowDown']
      const moves: Record<string, [start: number, step: number]> = {
        [forward]: [index + 1, 1],
        [back]: [index - 1, -1],
        Home: [0, 1],
        End: [all.length - 1, -1],
      }
      const move = event.shiftKey ? undefined : moves[event.key]
      if (!move) return
      event.preventDefault()
      const [start, step] = move
      // Wraps at the ends, and passes over a control that does not take focus.
      for (let i = 0; i < all.length; i++) {
        const el = all[(((start + i * step) % all.length) + all.length) % all.length]!
        el.focus()
        if (el.ownerDocument.activeElement === el) return
      }
    },
  }
}
