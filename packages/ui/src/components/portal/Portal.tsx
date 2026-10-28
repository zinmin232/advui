import { zIndex as zIndices } from '@advui/theme'
import type { ReactNode } from 'react'
import { Portal as TamaguiPortal, View, isWeb } from 'tamagui/unstyled'

export type PortalLayer = keyof typeof zIndices

export interface PortalProps {
  children?: ReactNode
  /**
   * Stacking order: a layer from the theme's `zIndex` scale, or a number.
   * Android takes 32-bit z-indices only, so prefer a layer.
   */
  zIndex?: PortalLayer | number
}

/**
 * Renders its children above the app: at the end of `body` on web, and in
 * a layer beside the app on iOS and Android, where React context from above
 * does not reach them (the theme does). Touches outside the children reach
 * the app below. Place the children with `position="absolute"`.
 */
export function Portal({ children, zIndex = 'overlay' }: PortalProps) {
  return (
    <TamaguiPortal
      zIndex={typeof zIndex === 'number' ? zIndex : zIndices[zIndex]}
      // Tamagui's host stops touch scrolling for its own overlays; a panel
      // in the portal may scroll.
      {...(isWeb && { style: { touchAction: 'auto' } })}
    >
      {/* Covers the screen, but only the children take touches. */}
      <View position="absolute" inset={0} pointerEvents="box-none">
        {children}
      </View>
    </TamaguiPortal>
  )
}
