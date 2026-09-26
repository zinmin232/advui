import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** `true` when "Reduce Motion" (iOS) / "Remove animations" (Android) is enabled. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let mounted = true
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduced(value)
    })
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  return reduced
}
