import { type ReactNode, forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, styled } from 'tamagui'

export type ScrollAreaOrientation = 'vertical' | 'horizontal'

const ScrollAreaFrame = styled(View, {
  name: 'ScrollArea',
  // Keyboard users scroll it with the arrow keys once it has focus.
  tabIndex: 0,
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },

  variants: {
    orientation: {
      vertical: { overflowX: 'hidden', overflowY: 'auto' },
      horizontal: { flexDirection: 'row', overflowX: 'auto', overflowY: 'hidden' },
    },
  } as const,

  defaultVariants: { orientation: 'vertical' },
})

export interface ScrollAreaProps extends Omit<
  GetProps<typeof ScrollAreaFrame>,
  'orientation' | 'children'
> {
  /** Which way it scrolls. Default: `vertical`. */
  orientation?: ScrollAreaOrientation
  /** Names the region, e.g. "Release tags". Recommended. */
  'aria-label'?: string
  /** Put the content in one child, such as a VStack (or an HStack when horizontal). */
  children: ReactNode
}

/**
 * A box that scrolls its content within a set height or width, with thin
 * scrollbars in the theme's colors (web) or the platform's own (native).
 */
export const ScrollArea = forwardRef<TamaguiElement, ScrollAreaProps>(function ScrollArea(
  { orientation = 'vertical', 'aria-label': label, ...props },
  ref,
) {
  return (
    <ScrollAreaFrame
      ref={ref}
      orientation={orientation}
      // Scrollbar colors live in GlobalStyles (`.aui-scroll-area`).
      className="aui-scroll-area"
      {...(label && { role: 'region', 'aria-label': label })}
      {...props}
    />
  )
})
