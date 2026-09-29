import { describe, expect, it } from 'vitest'
import * as editor from './index'

describe('@advui/editor public API', () => {
  it('exports the editor, its viewer and the Markdown helpers', () => {
    expect(Object.keys(editor).sort()).toEqual([
      'RichTextContent',
      'RichTextEditor',
      'applyFormat',
      'defaultRichTextTools',
      'parseMarkdown',
    ])
  })
})
