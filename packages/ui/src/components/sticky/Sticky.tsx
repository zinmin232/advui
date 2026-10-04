import { type ReactNode, forwardRef } from 'react'
import {
  type GetProps,
  type SpaceTokens,
  type TamaguiElement,
  View,
  type ZIndexTokens,
  isWeb,
} from 'tamagui'

export type StickyEdge = 'top' | 'bottom'

export interface StickyProps extends Omit<GetProps<typeof View>, 'children' | 'zIndex'> {
  /** The edge it sticks to while its container scrolls. `bottom` is web only. Default `top`. */
  edge?: StickyEdge
  /** Distance from that edge, such as the height of a header above it. Default `0`. */
  offset?: SpaceTokens | number
  /** Stacking level. Default `$sticky` (above content, below dropdowns and dialogs). */
  zIndex?: ZIndexTokens | number
  children?: ReactNode
}

/**
 * Keeps its content in view while the page or a ScrollArea scrolls.
 *
 * Web: `position: sticky`, so it sticks inside its nearest scrolling ancestor
 * and stays in the flow until then.
 * iOS / Android: React Native has no sticky positioning. A top Sticky that is
 * a direct child of a ScrollArea's content element is pinned by the
 * ScrollArea (`stickyHeaderIndices`); anywhere else it is a plain View.
 */
export const Sticky = forwardRef<TamaguiElement, StickyProps>(function Sticky(
  { edge = 'top', offset = 0, zIndex = '$sticky', ...props },
  ref,
) {
  return (
    <View
      ref={ref}
      zIndex={zIndex}
      {...(isWeb ? { position: 'sticky' as never, [edge]: offset } : null)}
      {...props}
    />
  )
})
