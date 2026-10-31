import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Keyboard, Platform } from 'react-native'
import type { KeyboardAvoidance } from './useKeyboardAvoidance'

/** True inside a scroll view that already avoids the keyboard. */
export const KeyboardAvoidanceContext = createContext(false)

type NativeNode = {
  measure: (
    done: (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number,
    ) => void,
  ) => void
}

/**
 * Whether a screen's scroll view keeps its focused field above the keyboard,
 * and on Android by how much it ends higher.
 *
 * iOS scroll views do it themselves (`automaticallyAdjustKeyboardInsets`).
 * Android draws apps edge-to-edge (every app on Android 15 and later), so the
 * window no longer shrinks for the keyboard, which covers the bottom of the
 * screen. The scroll view takes the covered part off its bottom instead, and
 * Android then scrolls its focused field (a text field or a WebView) into the
 * shorter view. It is measured from the root view (`measure`), as the
 * keyboard's `screenY` is, so a navigation header above it needs no offset,
 * unlike React Native's KeyboardAvoidingView.
 *
 * Only the outermost scroll view that asks avoids the keyboard: once it is
 * shorter, the ones inside it are scrolled into view with the field.
 */
export function useKeyboardAvoidance(
  ref: { current: unknown },
  requested: boolean,
): KeyboardAvoidance {
  const outer = useContext(KeyboardAvoidanceContext)
  const avoid = requested && !outer
  const android = avoid && Platform.OS === 'android'
  const [inset, setInset] = useState(0)
  // What is already taken off, so the view's full bottom can be worked out again.
  const applied = useRef(0)

  useEffect(() => {
    if (!android) return
    const update = (value: number) => {
      applied.current = value
      setInset(value)
    }
    const cover = (keyboardTop: number) => {
      const node = ref.current as NativeNode | null
      node?.measure((_x, _y, _width, height, _pageX, pageY) => {
        // A view that is not laid out yet measures as nothing.
        if (!height) return
        update(Math.max(0, Math.round(pageY + height + applied.current - keyboardTop)))
      })
    }
    // Android sends only the Did events. They come again when the keyboard
    // changes height, such as for its emoji panel.
    const shown = Keyboard.addListener('keyboardDidShow', (event) =>
      cover(event.endCoordinates.screenY),
    )
    const hidden = Keyboard.addListener('keyboardDidHide', () => update(0))
    // A screen that opens while the keyboard is up.
    const metrics = Keyboard.metrics()
    if (metrics) cover(metrics.screenY)
    return () => {
      shown.remove()
      hidden.remove()
      update(0)
    }
  }, [android, ref])

  return { avoid, inset: android ? inset : 0, context: outer || avoid }
}
