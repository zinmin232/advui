import { Button, Field } from '@advui/core'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor, within } from '../../../test/utils'
import { RichTextContent } from './RichTextContent'
import { RichTextEditor } from './RichTextEditor'
import { normalizeHtml, parseHtml } from './html'

describe('parseHtml', () => {
  it('reads blocks, marks and links', () => {
    const blocks = parseHtml(
      '<h2>Needs</h2><p>Clean <strong>water <em>now</em></strong>, <u>kits</u> and <s>tents</s>' +
        '<br>at <a href="https://themimu.info" target="_blank">MIMU</a> &amp; <code>5W</code></p>' +
        '<blockquote><p>Quoted</p></blockquote>',
    )
    expect(blocks.map((block) => block.type)).toEqual(['heading', 'paragraph', 'quote'])
    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Needs' }],
    })
    expect(blocks[1]).toEqual({
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Clean ' },
        {
          type: 'bold',
          children: [
            { type: 'text', text: 'water ' },
            { type: 'italic', children: [{ type: 'text', text: 'now' }] },
          ],
        },
        { type: 'text', text: ', ' },
        { type: 'underline', children: [{ type: 'text', text: 'kits' }] },
        { type: 'text', text: ' and ' },
        { type: 'strike', children: [{ type: 'text', text: 'tents' }] },
        { type: 'text', text: '\n' },
        { type: 'text', text: 'at ' },
        { type: 'link', href: 'https://themimu.info', children: [{ type: 'text', text: 'MIMU' }] },
        { type: 'text', text: ' & ' },
        { type: 'code', text: '5W' },
      ],
    })
  })

  it('reads lists one level deep, with their start, and nested items after their parent', () => {
    expect(
      parseHtml(
        '<ol start="3"><li><p>Register</p><ul><li><p>by tract</p></li></ul></li><li><p>Hand out</p></li></ol>',
      ),
    ).toEqual([
      {
        type: 'list',
        ordered: true,
        start: 3,
        items: [
          [{ type: 'text', text: 'Register' }],
          [{ type: 'text', text: 'by tract' }],
          [{ type: 'text', text: 'Hand out' }],
        ],
      },
    ])
  })

  it('drops what could run or is not text, and empty paragraphs', () => {
    expect(
      parseHtml(
        '<p></p><script>alert(1)</script><style>p{}</style><p onclick="x()">Hi ' +
          '<a href="javascript:alert(1)">there</a><img src="x" onerror="y()"></p>\n<p> </p>',
      ),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Hi ' },
          { type: 'text', text: 'there' },
        ],
      },
    ])
  })

  it('collapses white space between and inside tags', () => {
    expect(parseHtml('\n  <p>\n  one\n  two  </p>\n')).toEqual([
      { type: 'paragraph', children: [{ type: 'text', text: 'one two' }] },
    ])
  })

  it('saves an empty document as an empty string', () => {
    expect(normalizeHtml('<p></p>')).toBe('')
    expect(normalizeHtml('<p><br></p>')).toBe('')
    expect(normalizeHtml('<p>a</p>')).toBe('<p>a</p>')
  })
})

describe('RichTextContent', () => {
  it('renders headings, lists, quotes and safe links, and never runs scripts', () => {
    const { container } = renderWithProvider(
      <RichTextContent>
        {'<h2>Plan</h2><ol><li><p>Register</p></li><li><p>Distribute</p></li></ol>' +
          '<blockquote><p>Note with <a href="https://themimu.info">MIMU</a></p></blockquote>' +
          '<script>window.ran = true</script>'}
      </RichTextContent>,
    )
    expect(screen.getByRole('heading', { name: 'Plan', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    const link = screen.getByRole('link', { name: 'MIMU' })
    expect(link).toHaveAttribute('href', 'https://themimu.info')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(container.querySelector('script')).toBeNull()
    expect(container).not.toHaveTextContent('window.ran')
  })
})

// TipTap mounts after the first render (it is SSR-safe), so wait for the text.
const findText = (name: string) => screen.findByRole('textbox', { name })

describe('RichTextEditor', () => {
  it('has a named multi-line text and a toolbar of toggles with one tab stop', async () => {
    renderWithProvider(<RichTextEditor aria-label="Report" placeholder="Write the report" />)
    const text = await findText('Report')
    expect(text).toHaveAttribute('contenteditable', 'true')
    expect(text).toHaveAttribute('aria-multiline', 'true')
    expect(text).toHaveAttribute('aria-placeholder', 'Write the report')
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    expect(toolbar).toHaveAttribute('aria-controls', text.id)
    const tools = within(toolbar).getAllByRole('button')
    expect(tools.map((tool) => tool.getAttribute('aria-label'))).toEqual([
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Heading',
      'Bulleted list',
      'Numbered list',
      'Quote',
      'Link',
      'Code',
    ])
    expect(tools.every((tool) => tool.getAttribute('aria-pressed') === 'false')).toBe(true)
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-keyshortcuts',
      'Control+B Meta+B',
    )
    await waitFor(() =>
      expect(tools.filter((tool) => tool.getAttribute('tabindex') !== '-1')).toHaveLength(1),
    )
  })

  it('is named and described by a Field', async () => {
    renderWithProvider(
      <Field label="Report" description="Select text to format it." required>
        <RichTextEditor />
      </Field>,
    )
    const text = await screen.findByRole('textbox')
    expect(text).toHaveAccessibleName(expect.stringContaining('Report'))
    expect(text).toHaveAccessibleDescription('Select text to format it.')
    expect(text).toHaveAttribute('aria-required', 'true')
  })

  it('formats the selection from the toolbar and the keyboard, and shows it pressed', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <RichTextEditor
        aria-label="Report"
        defaultValue="<p>clean water</p>"
        onValueChange={onValueChange}
      />,
    )
    const text = await findText('Report')
    await user.click(text)
    await user.keyboard('{Control>}a{/Control}')
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onValueChange).toHaveBeenLastCalledWith('<p><strong>clean water</strong></p>')
    expect(text).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Control>}i{/Control}')
    expect(onValueChange).toHaveBeenLastCalledWith('<p><strong><em>clean water</em></strong></p>')
    await user.click(screen.getByRole('button', { name: 'Heading' }))
    expect(onValueChange).toHaveBeenLastCalledWith('<h2><strong><em>clean water</em></strong></h2>')
  })

  it('adds a link from the address field, and removes it', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <RichTextEditor
        aria-label="Report"
        defaultValue="<p>MIMU</p>"
        onValueChange={onValueChange}
      />,
    )
    const text = await findText('Report')
    await user.click(text)
    await user.keyboard('{Control>}a{/Control}{Control>}k{/Control}')
    const address = screen.getByRole('textbox', { name: 'Link address' })
    expect(address).toHaveFocus()
    expect(address).toHaveValue('https://')
    await user.type(address, 'themimu.info{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith(
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://themimu.info">MIMU</a></p>',
    )
    expect(screen.queryByRole('textbox', { name: 'Link address' })).toBeNull()
    expect(text).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Link' }))
    expect(screen.getByRole('textbox', { name: 'Link address' })).toHaveValue(
      'https://themimu.info',
    )
    await user.click(screen.getByRole('button', { name: 'Remove link' }))
    expect(onValueChange).toHaveBeenLastCalledWith('<p>MIMU</p>')
  })

  it('closes the address field with Escape, back in the text', async () => {
    const { user } = renderWithProvider(<RichTextEditor aria-label="Report" />)
    const text = await findText('Report')
    await user.click(screen.getByRole('button', { name: 'Link' }))
    expect(screen.getByRole('button', { name: 'Link' })).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('textbox', { name: 'Link address' })).toBeNull()
    expect(text).toHaveFocus()
  })

  it('loads a new value from outside without calling onValueChange', async () => {
    const onValueChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState('<p>Draft</p>')
      return (
        <>
          <RichTextEditor
            aria-label="Report"
            value={value}
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}
          />
          <Button onPress={() => setValue('<h2>Final</h2>')}>Load</Button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    const text = await findText('Report')
    expect(text).toHaveTextContent('Draft')
    await user.click(screen.getByRole('button', { name: 'Load' }))
    expect(within(text).getByRole('heading', { name: 'Final', level: 2 })).toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('cannot be edited or formatted while disabled', async () => {
    renderWithProvider(<RichTextEditor aria-label="Report" defaultValue="<p>Done</p>" disabled />)
    const text = await findText('Report')
    expect(text).toHaveAttribute('contenteditable', 'false')
    expect(text).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled()
  })
})
