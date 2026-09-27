import { shadows } from '@advui/theme'

// Shared by Dialog and AlertDialog so both surfaces stay identical. Each wraps
// its own Tamagui primitive (they use separate contexts), so only styles are shared.

export const overlayStyle = {
  backgroundColor: '$overlay',
  opacity: 1,
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
} as const

export const contentStyle = {
  backgroundColor: '$popover',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: '$dialog',
  padding: '$6',
  gap: '$4',
  width: '92%',
  maxWidth: '$128',
  maxHeight: '90%',
  ...shadows.lg,
  opacity: 1,
  scale: 1,
  y: 0,
  enterStyle: { opacity: 0, scale: 0.96, y: 8 },
  exitStyle: { opacity: 0, scale: 0.98, y: 4 },
} as const

export const contentSizes = {
  sm: { maxWidth: '$96' },
  md: { maxWidth: '$128' },
  lg: { maxWidth: '$168' },
  xl: { maxWidth: '$224' },
} as const

export const headerStyle = { gap: '$1.5' } as const

export const footerStyle = {
  flexDirection: 'column-reverse',
  gap: '$2',
  $sm: { flexDirection: 'row', justifyContent: 'flex-end' },
} as const

export const titleStyle = {
  fontFamily: '$heading',
  fontSize: '$5',
  lineHeight: '$5',
  fontWeight: '600',
  color: '$foreground',
  margin: 0,
} as const

export const descriptionStyle = {
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$mutedForeground',
  margin: 0,
} as const
