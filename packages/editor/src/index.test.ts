import { describe, expect, it } from 'vitest'
import * as editor from './index'

describe('@advui/editor public API', () => {
  it('exports both editors, their viewers and the helpers', () => {
    expect(Object.keys(editor).sort()).toEqual([
      'MarkdownContent',
      'MarkdownEditor',
      'RichTextContent',
      'RichTextEditor',
      'applyFormat',
      'defaultMarkdownTools',
      'defaultRichTextTools',
      'parseHtml',
      'parseMarkdown',
    ])
  })
})
