import { type BlockNode, type InlineNode, safeHref } from '../markdown-editor/markdown'

/**
 * Reads the HTML Rich Text Editor writes (TipTap's `p`, `h1`–`h6`, `strong`,
 * `em`, `u`, `s`, `code`, `a`, `ul`, `ol`, `li`, `blockquote` and `br`) into
 * the blocks both viewers draw. It builds no DOM, so it runs on iOS and
 * Android too, and nothing in the HTML runs: scripts and styles are dropped
 * with their content, other tags keep only their text, and links keep only
 * `http(s)` and `mailto` addresses.
 */

type HtmlElement = { tag: string; attrs: Record<string, string>; children: HtmlNode[] }
type HtmlNode = HtmlElement | string

const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])
// Dropped with everything inside them.
const skippedTags = new Set([
  'head',
  'iframe',
  'math',
  'noscript',
  'object',
  'script',
  'select',
  'style',
  'svg',
  'template',
  'textarea',
  'title',
])
const headings: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }
const marks: Record<string, 'bold' | 'italic' | 'strike' | 'underline'> = {
  b: 'bold',
  strong: 'bold',
  em: 'italic',
  i: 'italic',
  del: 'strike',
  s: 'strike',
  strike: 'strike',
  ins: 'underline',
  u: 'underline',
}
const codeTags = new Set(['code', 'kbd', 'samp'])
// Tags that start a new block. Containers among them (div, section…) hold
// paragraphs of their own; the rest are read below.
const blockTags = new Set([
  ...Object.keys(headings),
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'details',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'header',
  'hr',
  'li',
  'main',
  'nav',
  'ol',
  'p',
  'pre',
  'section',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
])

const entities: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

export function decodeEntities(text: string) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return entities[code.toLowerCase()] ?? match
    const hex = code[1] === 'x' || code[1] === 'X'
    const point = parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10)
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match
  })
}

/** Escapes text for HTML, such as a link's address and text. */
export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** TipTap writes `<p></p>` for an empty document; that is saved as `''`. */
export function normalizeHtml(html: string) {
  return /^(\s|<p>(\s|<br\s*\/?>)*<\/p>)*$/i.test(html) ? '' : html
}

function parseAttrs(source: string) {
  const attrs: Record<string, string> = {}
  for (const match of source.matchAll(
    /([^\s=/"'<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g,
  ))
    attrs[match[1]!.toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '')
  return attrs
}

/** A tree of the tags; a closing tag closes any still open inside it. */
function parseTree(html: string): HtmlNode[] {
  const root: HtmlElement = { tag: '', attrs: {}, children: [] }
  const open = [root]
  let skipping: string | null = null
  const tokens =
    /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-z][a-z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+|<)/gi
  for (const [, closing, name, attrs = '', text] of html.matchAll(tokens)) {
    if (text !== undefined) {
      if (!skipping) open[open.length - 1]!.children.push(decodeEntities(text))
      continue
    }
    // A comment.
    if (!name) continue
    const tag = name.toLowerCase()
    if (skipping) {
      if (closing && tag === skipping) skipping = null
      continue
    }
    if (closing) {
      for (let i = open.length - 1; i > 0; i--) {
        if (open[i]!.tag !== tag) continue
        open.length = i
        break
      }
      continue
    }
    const selfClosing = attrs.trimEnd().endsWith('/')
    if (skippedTags.has(tag)) {
      if (!selfClosing) skipping = tag
      continue
    }
    const element: HtmlElement = { tag, attrs: parseAttrs(attrs), children: [] }
    open[open.length - 1]!.children.push(element)
    if (!voidTags.has(tag) && !selfClosing) open.push(element)
  }
  return root.children
}

const textOf = (nodes: HtmlNode[]): string =>
  nodes.map((node) => (typeof node === 'string' ? node : textOf(node.children))).join('')

/** Text and marks; blocks inside (paragraphs in a list item) become lines. */
function toInline(nodes: HtmlNode[]): InlineNode[] {
  const result: InlineNode[] = []
  const line = () => {
    const last = result[result.length - 1]
    if (last && !(last.type === 'text' && last.text.endsWith('\n'))) {
      result.push({ type: 'text', text: '\n' })
    }
  }
  for (const node of nodes) {
    if (typeof node === 'string') {
      // HTML collapses runs of white space; no-break spaces stay.
      result.push({ type: 'text', text: node.replace(/[ \t\n\r\f]+/g, ' ') })
      continue
    }
    const { tag, attrs, children } = node
    if (tag === 'br') result.push({ type: 'text', text: '\n' })
    else if (codeTags.has(tag)) result.push({ type: 'code', text: textOf(children) })
    else if (marks[tag]) result.push({ type: marks[tag], children: toInline(children) })
    else if (tag === 'a') {
      const href = safeHref(attrs.href ?? '')
      if (href) result.push({ type: 'link', href, children: toInline(children) })
      else result.push(...toInline(children))
    } else if (blockTags.has(tag)) {
      line()
      result.push(...toInline(children))
      line()
    } else result.push(...toInline(children))
  }
  return result
}

/** Drops the white space at the ends; null when nothing is left to show. */
function trimInline(nodes: InlineNode[]): InlineNode[] | null {
  const trimmed = [...nodes]
  const trimText = (index: number, pattern: RegExp) => {
    const node = trimmed[index]
    if (node?.type !== 'text') return false
    const text = node.text.replace(pattern, '')
    if (text) trimmed[index] = { type: 'text', text }
    else trimmed.splice(index, 1)
    return !text
  }
  while (trimmed.length && trimText(0, /^[ \n]+/));
  while (trimmed.length && trimText(trimmed.length - 1, /[ \n]+$/));
  const visible = (node: InlineNode): boolean =>
    node.type === 'text' || node.type === 'code'
      ? node.text.trim() !== ''
      : node.children.some(visible)
  return trimmed.some(visible) ? trimmed : null
}

function toBlocks(nodes: HtmlNode[]): BlockNode[] {
  const blocks: BlockNode[] = []
  let run: HtmlNode[] = []
  const flush = () => {
    const children = trimInline(toInline(run))
    if (children) blocks.push({ type: 'paragraph', children })
    run = []
  }
  for (const node of nodes) {
    if (typeof node === 'string' || !blockTags.has(node.tag)) {
      run.push(node)
      continue
    }
    flush()
    const { tag, attrs, children } = node
    if (headings[tag]) {
      const inline = trimInline(toInline(children))
      if (inline) blocks.push({ type: 'heading', level: headings[tag], children: inline })
    } else if (tag === 'blockquote') {
      const inner = toBlocks(children)
      if (inner.length) blocks.push({ type: 'quote', children: inner })
    } else if (tag === 'ul' || tag === 'ol') {
      const items = listItems(children)
      if (items.length) {
        const start = parseInt(attrs.start ?? '', 10)
        blocks.push({
          type: 'list',
          ordered: tag === 'ol',
          start: tag === 'ol' && start > 0 ? start : 1,
          items,
        })
      }
    } else if (tag === 'pre') {
      blocks.push({ type: 'paragraph', children: [{ type: 'code', text: textOf(children) }] })
    } else if (tag !== 'hr') blocks.push(...toBlocks(children))
  }
  flush()
  return blocks
}

const isList = (node: HtmlNode): node is HtmlElement =>
  typeof node !== 'string' && (node.tag === 'ul' || node.tag === 'ol')

/** One line per item. Lists nested in an item follow it in the same list. */
function listItems(nodes: HtmlNode[]): InlineNode[][] {
  const items: InlineNode[][] = []
  for (const node of nodes) {
    if (typeof node === 'string') continue
    if (node.tag === 'ul' || node.tag === 'ol') {
      items.push(...listItems(node.children))
      continue
    }
    const own = trimInline(toInline(node.children.filter((child) => !isList(child))))
    if (own) items.push(own)
    for (const list of node.children.filter(isList)) items.push(...listItems(list.children))
  }
  return items
}

export function parseHtml(html: string): BlockNode[] {
  return toBlocks(parseTree(html))
}
