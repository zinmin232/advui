import { shadows } from '@advui/theme'

// Shared by Dialog and AlertDialog so both surfaces stay identical. Each wraps
// its own Tamagui primitive (they use separate contexts), so only styles are shared.

export const overlayStyle = {
  backgroundColor: 'overlay',
  opacity: { default: 1, enter: 0, exit: 0 },
} as const

export const contentStyle = {
  backgroundColor: 'popover',
  borderColor: 'border',
  borderWidth: 1,
  borderRadius: 'dialog',
  padding: '6',
  gap: '4',
  width: '92%',
  maxWidth: '128',
  maxHeight: '90%',
  ...shadows.lg,
  opacity: { default: 1, enter: 0, exit: 0 },
  scale: { default: 1, enter: 0.96, exit: 0.98 },
  y: { default: 0, enter: 8, exit: 4 },
} as const

export const contentSizes = {
  sm: { maxWidth: '96' },
  md: { maxWidth: '128' },
  lg: { maxWidth: '168' },
  xl: { maxWidth: '224' },
} as const

export const headerStyle = { gap: '1-5' } as const

export const footerStyle = {
  flexDirection: 'column-reverse sm:row',
  justifyContent: 'sm:flex-end',
  gap: '2',
} as const

export const titleStyle = {
  fontFamily: 'heading',
  fontSize: '5',
  lineHeight: '5',
  fontWeight: '600',
  color: 'foreground',
  margin: 0,
} as const

export const descriptionStyle = {
  fontFamily: 'body',
  fontSize: '2',
  lineHeight: '2',
  color: 'mutedForeground',
  margin: 0,
} as const
