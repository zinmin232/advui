// React Native's Jest mocks predate the New Architecture layout API. On devices
// host views have getBoundingClientRect() (returning a DOMRect); Tamagui's
// Accordion height animator calls it synchronously. Give the mocks an empty rect.
import React from 'react'
import { NativeModules } from 'react-native'

if (!React.Component.prototype.getBoundingClientRect) {
  React.Component.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
  }
}

// The theme animates on the native driver, and React Native's mock ends a native
// animation without its last value, so a view kept its first frame in tests. A
// device sends that value back to JS, unless the animation was stopped. Plain
// functions, so restoreAllMocks() leaves them.
const animated = NativeModules.NativeAnimatedModule
const stopped = new Set()
animated.stopAnimation = (id) => stopped.add(id)
animated.startAnimatingNode = (id, _node, config, end) => {
  setTimeout(() => {
    const finished = !stopped.delete(id)
    end(finished && config.toValue != null ? { finished, value: config.toValue } : { finished })
  }, 16)
}
