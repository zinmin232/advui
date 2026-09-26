import { createAnimations } from '@tamagui/animations-css'

// Web: CSS transitions — no JS animation runtime. Reduced motion is honored
// globally by the provider's `prefers-reduced-motion` stylesheet.
//
// The millisecond names match Tamagui's v5 config: Tamagui primitives (Toast,
// Sheet…) reference them internally, so they must exist in every config.
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'

export const animations = createAnimations({
  '0ms': '0ms linear',
  '50ms': '50ms linear',
  '75ms': '75ms linear',
  '100ms': '100ms ease-out',
  '200ms': '200ms ease-out',
  '250ms': '250ms ease-out',
  '300ms': '300ms ease-out',
  '400ms': '400ms ease-out',
  '500ms': '500ms ease-out',
  quicker: `120ms ${ease}`,
  quick: `160ms ${ease}`,
  medium: `240ms ${ease}`,
  slow: `360ms ${ease}`,
  bouncy: '300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  lazy: `480ms ${ease}`,
})
