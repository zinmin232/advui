import { AccessibilityInfo } from 'react-native'
import { isWeb } from 'tamagui/unstyled'

// Host nodes: DOM elements on web, React Native's DOM-like elements on iOS and
// Android. Both walk their siblings the same way.
interface HostNode {
  isConnected?: boolean
  nextElementSibling?: HostNode | null
  previousElementSibling?: HostNode | null
}

// The mounted input chips: a chip's frame → its remove button.
const removeButtons = new WeakMap<HostNode, HostNode>()

export function registerRemovable(frame: HostNode, button: HostNode) {
  removeButtons.set(frame, button)
  return () => {
    removeButtons.delete(frame)
  }
}

function neighbour(frame: HostNode) {
  for (const key of ['nextElementSibling', 'previousElementSibling'] as const) {
    for (let node = frame[key]; node; node = node[key]) {
      const button = removeButtons.get(node)
      if (button) return button
    }
  }
  return null
}

// Frames to wait for the chip to leave: native commits the removal later.
const attempts = 10
const nativeDelay = 250

/**
 * Runs `remove`, then moves focus to the next input chip in the row, or the
 * previous one after the last. Otherwise focus is lost with the chip, and
 * TalkBack and VoiceOver start again from the top of the screen.
 */
export function removeAndRefocus(frame: HostNode | null, remove: () => void) {
  const target = frame ? neighbour(frame) : null
  remove()
  if (!frame || !target) return
  let left = attempts
  const settle = () => {
    // Still there: the app kept it, or has not removed it yet.
    if (frame.isConnected) {
      if (--left > 0) requestAnimationFrame(settle)
      return
    }
    if (!target.isConnected) return
    if (isWeb) {
      // The app moved focus itself (Tags Input's text box).
      const active = document.activeElement
      if (active && active !== document.body) return
      ;(target as HTMLElement).focus()
    } else {
      // The JS tree drops the chip before the screen does; focused too early,
      // TalkBack loses it again when the chip's view goes, and starts at the top.
      setTimeout(() => {
        if (target.isConnected) AccessibilityInfo.sendAccessibilityEvent(target as never, 'focus')
      }, nativeDelay)
    }
  }
  requestAnimationFrame(settle)
}
