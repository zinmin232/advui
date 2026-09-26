import { type GetProps, Text as TamaguiText, styled } from 'tamagui'

/** Keyboard key or shortcut hint, e.g. `<Kbd>Ctrl K</Kbd>`. Renders `<kbd>` on web. */
export const Kbd = styled(TamaguiText, {
  name: 'Kbd',
  render: 'kbd',
  fontFamily: '$mono',
  fontSize: '$1',
  lineHeight: '$1',
  color: '$mutedForeground',
  backgroundColor: '$muted',
  borderWidth: 1,
  borderColor: '$border',
  borderBottomWidth: 2,
  borderRadius: '$sm',
  paddingHorizontal: '$1.5',
  paddingVertical: '$0.5',
  userSelect: 'none',
})

export type KbdProps = GetProps<typeof Kbd>
