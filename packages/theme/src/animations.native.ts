import { createAnimations } from '@tamagui/animations-react-native'

// Native: React Native Animated driver — no extra native modules, works in Expo Go.
// Keep the key set identical to animations.ts (Tamagui primitives use the ms names).
//
// On the native driver: Tamagui turns it on only when it finds
// `__nativeFabricUIManager`, which React Native 0.86 no longer sets, so every
// spring ran on the JS thread, one frame at a time. On a phone (TECNO KM9) the
// Theme screen's switch to dark settled in 4.4 s there and in 1.2 s on this
// driver. Tamagui keeps a view on the JS driver when it animates a size or a
// font metric, which the native module cannot (see apps/expo/timing).
const driver = createAnimations(
  {
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
  },
  { useNativeDriver: true },
)

// With avoidReRenders, press/hover/focus styles reach the driver through a style
// emitter instead of a render. For colors the emitter builds a new interpolation
// node that is never rendered, so the view keeps its resting color: a Button with
// a `transition` never shows `pressStyle`. Re-rendering on pseudo-state changes
// renders the new interpolation and animates the color (Tamagui 2.7.7).
export const animations: typeof driver = { ...driver, avoidReRenders: false }
