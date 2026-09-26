import { type GetProps, View, styled } from 'tamagui'

/** The base layout primitive — a `View` that accepts every style prop and token. */
export const Box = styled(View, {
  name: 'Box',
})

/**
 * Flex container (column by default). Use regular style props for layout:
 * `flexDirection`, `alignItems`, `justifyContent`, `flexWrap`, `gap` — or the
 * shorthands `items`/`justify` — and media props for responsive changes.
 */
export const Stack = styled(View, {
  name: 'Stack',
  flexDirection: 'column',
})

/** Horizontal stack. Use `gap="$2"` for spacing. */
export const HStack = styled(Stack, {
  name: 'HStack',
  flexDirection: 'row',
  alignItems: 'center',
})

/** Vertical stack. Use `gap="$2"` for spacing. */
export const VStack = styled(Stack, {
  name: 'VStack',
  flexDirection: 'column',
})

/** Centers its children on both axes. */
export const Center = styled(View, {
  name: 'Center',
  alignItems: 'center',
  justifyContent: 'center',
})

/** Flexible space that pushes siblings apart inside a stack. */
export const Spacer = styled(View, {
  name: 'Spacer',
  flex: 1,
  alignSelf: 'stretch',
  'aria-hidden': true,
})

export type BoxProps = GetProps<typeof Box>
export type StackProps = GetProps<typeof Stack>
export type HStackProps = GetProps<typeof HStack>
export type VStackProps = GetProps<typeof VStack>
export type CenterProps = GetProps<typeof Center>
export type SpacerProps = GetProps<typeof Spacer>
