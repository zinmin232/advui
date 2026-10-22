import { Sheet, styled } from 'tamagui/unstyled'

/**
 * The grab handle above a bottom sheet. Tamagui 3's unstyled `Sheet.Handle`
 * has no size, so without these it renders nothing; this keeps the pill
 * Tamagui's default skin drew before.
 */
export const SheetHandle = styled(Sheet.Handle, {
  displayName: 'SheetHandle',
  height: '2-5',
  borderRadius: 'xl',
  backgroundColor: 'borderStrong',
  marginHorizontal: '35%',
  marginBottom: '2',
})
