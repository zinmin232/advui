import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom lacks matchMedia (used by Tamagui media queries and reduced-motion detection).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom lacks layout APIs used by floating/portal primitives (Tabs, Select, Tooltip).
if (!('ResizeObserver' in window)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(window as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
if (!window.requestIdleCallback) {
  window.requestIdleCallback = ((cb: IdleRequestCallback) =>
    setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1)) as never
}

// Tamagui renders modals and floating content into a native <dialog> (top layer).
// jsdom does not implement showModal/show, so the content would stay hidden.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype
  if (!proto.showModal || !String(proto.showModal).includes('open')) {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    proto.show = function show(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    proto.close = function close(this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  }
}

afterEach(() => {
  cleanup()
})
