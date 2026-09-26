import { createAnimations } from '@tamagui/animations-react-native'

// Native: React Native Animated driver — no extra native modules, works in Expo Go.
// Keep the key set identical to animations.ts (Tamagui primitives use the ms names).
export const animations = createAnimations({
  '0ms': { type: 'timing', duration: 0 },
  '50ms': { type: 'timing', duration: 50 },
  '75ms': { type: 'timing', duration: 75 },
  '100ms': { type: 'timing', duration: 100 },
  '200ms': { type: 'timing', duration: 200 },
  '250ms': { type: 'timing', duration: 250 },
  '300ms': { type: 'timing', duration: 300 },
  '400ms': { type: 'timing', duration: 400 },
  '500ms': { type: 'timing', duration: 500 },
  quicker: { type: 'spring', damping: 20, mass: 0.6, stiffness: 600 },
  quick: { type: 'spring', damping: 22, mass: 1, stiffness: 500 },
  medium: { type: 'spring', damping: 18, mass: 0.9, stiffness: 180 },
  slow: { type: 'spring', damping: 30, mass: 1, stiffness: 90 },
  bouncy: { type: 'spring', damping: 10, mass: 0.9, stiffness: 120 },
  lazy: { type: 'spring', damping: 18, mass: 1, stiffness: 50 },
})
