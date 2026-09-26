// React Native's Jest mocks predate the New Architecture layout API. On devices
// host views have getBoundingClientRect() (returning a DOMRect); Tamagui's
// Accordion height animator calls it synchronously. Give the mocks an empty rect.
import React from 'react'

if (!React.Component.prototype.getBoundingClientRect) {
  React.Component.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
  }
}
