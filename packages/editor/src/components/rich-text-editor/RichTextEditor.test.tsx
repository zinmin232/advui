import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, within } from '../../../test/utils'
import { RichTextContent } from './RichTextContent'
import { RichTextEditor } from './RichTextEditor'
import { applyFormat, parseInline, parseMarkdown } from './markdown'

describe('applyFormat', () => {
  it('wraps the selection, or a placeholder, and toggles back', () => {
    expect(applyFormat('clean water', { start: 6, end: 11 }, 'bold')).toEqual({
      value: 'clean **water**',
      selection: { start: 8, end: 13 },
    })
    expect(applyFormat('clean **water**', { start: 8, end: 13 }, 'bold')).toEqual({
      value: 'clean water',
      selection: { start: 6, end: 11 },
    })
    expect(applyFormat('', { start: 0, end: 0 }, 'italic')).toEqual({
      value: '_text_',
      selection: { start: 1, end: 5 },
    })
  })

  it('makes links, selecting what to type next', () => {
    expect(applyFormat('see MIMU', { start: 4, end: 8 }, 'link')).toEqual({
      value: 'see [MIMU](https://)',
      selection: { start: 11, end: 19 },
    })
  })

  it('prefixes every selected line, numbers lists and toggles back', () => {
    const text = 'water\nshelter'
    const listed = applyFormat(text, { start: 0, end: text.length }, 'orderedList')
    expect(listed.value).toBe('1. water\n2. shelter')
    expect(applyFormat(listed.value, listed.selection, 'bulletList').value).toBe(
      '- water\n- shelter',
    )
    expect(applyFormat('- water', { start: 3, end: 3 }, 'bulletList')).toEqual({
      value: 'water',
      selection: { start: 1, end: 1 },
    })
    expect(applyFormat('Update', { start: 6, end: 6 }, 'heading').value).toBe('## Update')
  })
})

describe('parseMarkdown', () => {
  it('reads blocks and nested inline marks', () => {
    expect(parseMarkdown('## Title\n\n- a\n- b\n\n> quote').map((b) => b.type)).toEqual([
      'heading',
      'list',
      'quote',
    ])
    expect(parseInline('**bold _both_**')).toEqual([
      {
        type: 'bold',
        children: [
          { type: 'text', text: 'bold ' },
          { type: 'italic', children: [{ type: 'text', text: 'both' }] },
        ],
      },
    ])
  })

  it('drops unsafe link targets', () => {
    expect(parseInline('[x](javascript:alert(1))')[0]).toEqual({ type: 'text', text: 'x' })
  })
})

describe('RichTextEditor', () => {
  it('has a named field and a toolbar with one tab stop', () => {
    renderWithProvider(<RichTextEditor aria-label="Report" />)
    expect(screen.getByRole('textbox', { name: 'Report' })).toBeInTheDocument()
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    const tools = within(toolbar).getAllByRole('button')
    expect(tools.map((tool) => tool.getAttribute('aria-label'))).toEqual([
      'Bold',
      'Italic',
      'Strikethrough',
      'Heading',
      'Bulleted list',
      'Numbered list',
      'Quote',
      'Link',
      'Code',
    ])
    expect(tools.filter((tool) => tool.getAttribute('tabindex') === '0')).toHaveLength(1)
  })

  it('formats the selected text from the toolbar and the keyboard', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <RichTextEditor
        aria-label="Report"
        defaultValue="clean water"
        onValueChange={onValueChange}
      />,
    )
    const field = screen.getByRole<HTMLTextAreaElement>('textbox')
    field.focus()
    field.setSelectionRange(6, 11)
    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onValueChange).toHaveBeenLastCalledWith('clean **water**')
    expect(field).toHaveFocus()
    expect([field.selectionStart, field.selectionEnd]).toEqual([8, 13])
    field.setSelectionRange(0, 5)
    await user.keyboard('{Control>}i{/Control}')
    expect(onValueChange).toHaveBeenLastCalledWith('_clean_ **water**')
  })

  it('moves through the toolbar with the arrow keys', async () => {
    const { user } = renderWithProvider(
      <RichTextEditor aria-label="Report" tools={['bold', 'italic', 'link']} />,
    )
    await user.tab()
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('button', { name: 'Link' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus()
  })

  it('previews the Markdown and counts characters', async () => {
    const { user } = renderWithProvider(
      <RichTextEditor aria-label="Report" defaultValue={'## Needs\n\n- water'} maxLength={100} />,
    )
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('17 of 100 characters')
    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true')
    const region = screen.getByRole('region', { name: 'Preview' })
    expect(within(region).getByRole('heading', { name: 'Needs', level: 3 })).toBeInTheDocument()
    expect(within(region).getByRole('listitem')).toHaveTextContent('water')
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled()
  })

  it('keeps the native-only accessibilityHint off the DOM', () => {
    const { container } = renderWithProvider(
      <RichTextEditor aria-label="Report" accessibilityHint="Markdown is supported." />,
    )
    expect(container.querySelector('[accessibilityhint]')).toBeNull()
  })
})

describe('RichTextContent', () => {
  it('renders headings, lists, quotes and safe links', () => {
    renderWithProvider(
      <RichTextContent>
        {'# Plan\n\n1. Register\n2. Distribute\n\n> Note with [MIMU](https://themimu.info)'}
      </RichTextContent>,
    )
    expect(screen.getByRole('heading', { name: 'Plan', level: 2 })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    const link = screen.getByRole('link', { name: 'MIMU' })
    expect(link).toHaveAttribute('href', 'https://themimu.info')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
