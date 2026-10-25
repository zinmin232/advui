import { isWeb } from 'tamagui/unstyled'

/**
 * Hidden on screen, still read by screen readers: a 1px box with a trace of
 * opacity. Not `opacity: 0`, which Android leaves out of the accessibility
 * tree, and not `display: none`, which every screen reader skips.
 */
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0.00000001,
  pointerEvents: 'none',
  // In a 1px-wide box each word wraps onto its own line, and VoiceOver on
  // macOS then reads the words one at a time.
  ...(isWeb && { whiteSpace: 'nowrap' }),
} as const
