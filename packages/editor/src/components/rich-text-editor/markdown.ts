/**
 * The Markdown subset Rich Text Editor writes and Rich Text Content reads:
 * **bold**, _italic_, ~~strike~~, `code`, [links](https://…), `#` headings,
 * `-` and `1.` lists, and `>` quotes.
 */

export type RichTextTool =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'link'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'quote'

export interface TextSelection {
  start: number
  end: number
}

export interface FormatResult {
  value: string
  selection: TextSelection
}

const marks = { bold: '**', italic: '_', strikethrough: '~~', code: '`' } as const

const linePatterns = {
  heading: /^#{1,6} /,
  bulletList: /^[-*] /,
  orderedList: /^\d+\. /,
  quote: /^> /,
} as const

/** Lists replace each other; a heading replaces a list. Quotes nest around anything. */
const replaces: Record<keyof typeof linePatterns, RegExp[]> = {
  heading: [linePatterns.heading, linePatterns.bulletList, linePatterns.orderedList],
  bulletList: [linePatterns.bulletList, linePatterns.orderedList, linePatterns.heading],
  orderedList: [linePatterns.orderedList, linePatterns.bulletList, linePatterns.heading],
  quote: [linePatterns.quote],
}

/**
 * Applies a toolbar tool to the text around the selection. Pressing a tool
 * again removes it. Returns the new text and what to select next.
 */
export function applyFormat(
  value: string,
  selection: TextSelection,
  tool: RichTextTool,
  placeholder = tool === 'link' ? 'link text' : 'text',
): FormatResult {
  const start = Math.max(0, Math.min(selection.start, selection.end, value.length))
  const end = Math.min(value.length, Math.max(selection.start, selection.end))
  const selected = value.slice(start, end)

  if (tool in marks) {
    const mark = marks[tool as keyof typeof marks]
    const n = mark.length
    // The marks sit just outside the selection: remove them.
    if (value.slice(start - n, start) === mark && value.slice(end, end + n) === mark) {
      return {
        value: value.slice(0, start - n) + selected + value.slice(end + n),
        selection: { start: start - n, end: end - n },
      }
    }
    // The selection includes the marks: remove them.
    if (selected.length >= 2 * n && selected.startsWith(mark) && selected.endsWith(mark)) {
      const inner = selected.slice(n, -n)
      return {
        value: value.slice(0, start) + inner + value.slice(end),
        selection: { start, end: start + inner.length },
      }
    }
    const text = selected || placeholder
    return {
      value: value.slice(0, start) + mark + text + mark + value.slice(end),
      selection: { start: start + n, end: start + n + text.length },
    }
  }

  if (tool === 'link') {
    const url = 'https://'
    const text = selected || placeholder
    const inserted = `[${text}](${url})`
    // With text selected the address is next to type; otherwise the text is.
    const focus = selected
      ? { start: start + text.length + 3, end: start + text.length + 3 + url.length }
      : { start: start + 1, end: start + 1 + text.length }
    return { value: value.slice(0, start) + inserted + value.slice(end), selection: focus }
  }

  // Line tools work on every line the selection touches.
  const kind = tool as keyof typeof linePatterns
  const lineStart = value.lastIndexOf('\n', start - 1) + 1
  const endsAtBreak = end > start && value[end - 1] === '\n'
  let lineEnd = value.indexOf('\n', endsAtBreak ? end - 1 : end)
  if (lineEnd === -1) lineEnd = value.length
  const lines = value.slice(lineStart, lineEnd).split('\n')
  const filled = lines.filter((line) => line.trim() !== '')
  const remove = filled.length > 0 && filled.every((line) => linePatterns[kind].test(line))
  let number = 0
  const next = lines.map((line) => {
    if (remove) return line.replace(linePatterns[kind], '')
    if (line.trim() === '' && lines.length > 1) return line
    const bare = replaces[kind].reduce((text, pattern) => text.replace(pattern, ''), line)
    number += 1
    const prefix =
      kind === 'heading'
        ? '## '
        : kind === 'bulletList'
          ? '- '
          : kind === 'orderedList'
            ? `${number}. `
            : '> '
    return prefix + bare
  })
  const block = next.join('\n')
  const result = value.slice(0, lineStart) + block + value.slice(lineEnd)
  if (lines.length > 1) {
    return { value: result, selection: { start: lineStart, end: lineStart + block.length } }
  }
  const delta = block.length - (lineEnd - lineStart)
  return {
    value: result,
    selection: {
      start: Math.max(lineStart, start + delta),
      end: Math.max(lineStart, end + delta),
    },
  }
}

/** Keyboard shortcuts (with ⌘ or Ctrl). */
export const shortcuts: Partial<Record<string, RichTextTool>> = {
  b: 'bold',
  i: 'italic',
  k: 'link',
}

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'code'; text: string }
  | { type: 'bold' | 'italic' | 'strike'; children: InlineNode[] }
  | { type: 'link'; href: string; children: InlineNode[] }

export type BlockNode =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'quote'; children: BlockNode[] }
  | { type: 'list'; ordered: boolean; start: number; items: InlineNode[][] }

const inlinePatterns: { type: InlineNode['type']; pattern: RegExp }[] = [
  { type: 'code', pattern: /`([^`\n]+)`/ },
  { type: 'link', pattern: /\[([^\]\n]+)\]\(([^)\s]+)\)/ },
  { type: 'bold', pattern: /\*\*(.+?)\*\*/ },
  { type: 'strike', pattern: /~~(.+?)~~/ },
  { type: 'italic', pattern: /(?<![\w\\])_(.+?)_(?!\w)|(?<!\*)\*([^*\n]+)\*(?!\*)/ },
]

/** Only web and mail links are followed; anything else (e.g. `javascript:`) stays text. */
export function safeHref(href: string) {
  return /^(https?:\/\/|mailto:)/i.test(href) ? href : null
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = []
  let rest = text
  while (rest) {
    let first: { type: InlineNode['type']; match: RegExpExecArray } | null = null
    for (const { type, pattern } of inlinePatterns) {
      const match = pattern.exec(rest)
      if (match && (!first || match.index < first.match.index)) first = { type, match }
    }
    if (!first) {
      nodes.push({ type: 'text', text: rest })
      break
    }
    const { type, match } = first
    if (match.index > 0) nodes.push({ type: 'text', text: rest.slice(0, match.index) })
    const inner = match[1] ?? match[2] ?? ''
    if (type === 'code') nodes.push({ type: 'code', text: inner })
    else if (type === 'link') {
      const href = safeHref(match[2]!)
      if (href) nodes.push({ type: 'link', href, children: parseInline(inner) })
      else nodes.push(...parseInline(inner))
    } else nodes.push({ type: type as 'bold', children: parseInline(inner) })
    rest = rest.slice(match.index + match[0].length)
  }
  return nodes
}

export function parseMarkdown(source: string): BlockNode[] {
  const blocks: BlockNode[] = []
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    if (line.trim() === '') {
      i++
      continue
    }
    const heading = /^(#{1,6}) (.*)$/.exec(line)
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1]!.length,
        children: parseInline(heading[2]!),
      })
      i++
      continue
    }
    if (/^> ?/.test(line)) {
      const quoted: string[] = []
      while (i < lines.length && /^> ?/.test(lines[i]!))
        quoted.push(lines[i++]!.replace(/^> ?/, ''))
      blocks.push({ type: 'quote', children: parseMarkdown(quoted.join('\n')) })
      continue
    }
    const listItem = /^([-*]|\d+\.) (.*)$/.exec(line)
    if (listItem) {
      const ordered = listItem[1]!.endsWith('.')
      const items: InlineNode[][] = []
      while (i < lines.length) {
        const item = /^([-*]|\d+\.) (.*)$/.exec(lines[i]!)
        if (!item || item[1]!.endsWith('.') !== ordered) break
        items.push(parseInline(item[2]!))
        i++
      }
      blocks.push({ type: 'list', ordered, start: ordered ? parseInt(listItem[1]!, 10) : 1, items })
      continue
    }
    const paragraph: string[] = []
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !/^(#{1,6} |> ?|[-*] |\d+\. )/.test(lines[i]!)
    )
      paragraph.push(lines[i++]!)
    blocks.push({ type: 'paragraph', children: parseInline(paragraph.join('\n')) })
  }
  return blocks
}
