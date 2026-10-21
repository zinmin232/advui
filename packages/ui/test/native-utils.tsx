import { render } from '@testing-library/react-native'
import { createUniversalConfig } from '@advui/theme'
import type { ReactElement } from 'react'
import { UniversalProvider } from '../src/provider/UniversalProvider'

const config = createUniversalConfig()

export async function renderNative(ui: ReactElement, colorMode: 'light' | 'dark' = 'light') {
  return await render(
    <UniversalProvider config={config} colorMode={colorMode} toaster={false}>
      {ui}
    </UniversalProvider>,
  )
}

/**
 * The view a touch lands on, as React Native's Pressability measures it: a
 * 100 × 40 box at the page origin. Tamagui 3 hands presses to Pressability,
 * which measures the responder on grant and cancels the press when the finger
 * leaves that box (plus its press-rect offsets: 20 on the sides and top, 30
 * below).
 */
export const pressRect = { left: 0, top: 0, width: 100, height: 40 } as const

const pressTarget = {
  measure(
    callback: (x: number, y: number, w: number, h: number, pageX: number, pageY: number) => void,
  ) {
    callback(0, 0, pressRect.width, pressRect.height, pressRect.left, pressRect.top)
  },
}

/**
 * A responder event for a finger at (pageX, pageY) on `pressRect`. Pressability
 * keeps the event's `currentTarget` as the responder (a release without one is
 * ignored) and reads the touch from `touches`, or `changedTouches` once lifted.
 */
export function touchAt(pageX: number, pageY: number, { lifted = false } = {}) {
  const touch = {
    identifier: 0,
    pageX,
    pageY,
    locationX: pageX - pressRect.left,
    locationY: pageY - pressRect.top,
    timestamp: Date.now(),
    target: pressTarget,
  }
  return {
    currentTarget: pressTarget,
    target: pressTarget,
    nativeEvent: { ...touch, touches: lifted ? [] : [touch], changedTouches: [touch] },
    // Pressability does not read the history; an empty one keeps PanResponders
    // (which compute centroids from it) out of the way.
    touchHistory: { touchBank: [], numberActiveTouches: 0, indexOfSingleActiveTouch: 0 },
    persist() {},
  }
}
