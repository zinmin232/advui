import { useMemo } from 'react'
import { type GetProps, View } from 'tamagui/unstyled'
import { ContentBlocks } from '../markdown-editor/MarkdownContent'
import { parseHtml } from './html'

export interface RichTextContentProps extends Omit<GetProps<typeof View>, 'children'> {
  /** HTML, as written by Rich Text Editor. */
  children: string
  /** Added to heading levels: with 0 (default), the editor's headings stay `h2`. */
  headingOffset?: number
}

/**
 * Shows HTML written with Rich Text Editor, with the same styles on every
 * platform. It draws the HTML as views instead of setting it as markup, so
 * scripts and styles in it never run.
 */
export function RichTextContent({ children, headingOffset = 0, ...props }: RichTextContentProps) {
  const blocks = useMemo(() => parseHtml(children), [children])
  return (
    <View gap="3" {...props}>
      <ContentBlocks blocks={blocks} headingOffset={headingOffset} />
    </View>
  )
}
