import type { ReactElement, ReactNode } from 'react'

// Shared by HoverCard.tsx (web) and HoverCard.native.tsx so both platforms
// expose exactly the same API.

export interface HoverCardProps {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Delay before opening on hover, in ms. Default 700. */
  openDelay?: number
  /** Delay before closing once the pointer leaves, in ms. Default 300. */
  closeDelay?: number
  /** Side of the trigger to open on. Default `bottom`. */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Alignment along that side. Default `center`. */
  align?: 'start' | 'center' | 'end'
}

export interface HoverCardTriggerProps {
  /** A single focusable element, usually a link to the full page. */
  children: ReactElement
}
