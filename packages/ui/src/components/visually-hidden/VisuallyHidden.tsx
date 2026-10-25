import { type GetProps, Text, isWeb, styled } from 'tamagui/unstyled'
import { visuallyHidden } from '../../utils/visuallyHidden'

/**
 * Text that screen readers read and the screen does not show: the rest of a
 * link's name, a status only a color shows, a heading sighted users can do
 * without. A `span` on web, so it fits inside links, buttons and headings.
 *
 * @example
 * <Link href="/pricing">
 *   Read more<VisuallyHidden> about pricing</VisuallyHidden>
 * </Link>
 */
export const VisuallyHidden = styled(Text, {
  displayName: 'VisuallyHidden',
  ...visuallyHidden,
  // Inside another Text, iOS and Android draw it as part of that text, where
  // the box above does nothing. The words stay in the text's string, which
  // screen readers read, with no color and almost no width.
  ...(!isWeb && { color: 'transparent', fontSize: 0.1 }),
})

export type VisuallyHiddenProps = GetProps<typeof VisuallyHidden>
