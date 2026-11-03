import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PACKAGE_SCOPE, PRODUCT_NAME } from './constants.js'

type Setting = string | string[] | { [key: string]: Setting }

/** Next.js looks for its config in this order. */
const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts', 'next.config.mts']

/**
 * What Next.js needs to render Adv UI: the packages it compiles, and React Native Web in
 * place of React Native, whose `.web` files come first.
 */
export function nextSettings(dependencies: Record<string, string>): Record<string, Setting> {
  const optional = ['data', 'charts', 'editor'].map((name) => `${PACKAGE_SCOPE}/${name}`)
  return {
    transpilePackages: [
      ...['core', 'theme', 'icons', 'utils'].map((name) => `${PACKAGE_SCOPE}/${name}`),
      ...optional.filter((name) => dependencies[name]),
      'react-native-web',
    ],
    turbopack: {
      resolveAlias: { 'react-native': 'react-native-web' },
      resolveExtensions: [
        '.web.tsx',
        '.web.ts',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  }
}

const notes: Record<string, string> = {
  turbopack: `${PRODUCT_NAME} is written for React Native; on the web, React Native Web stands in for it.`,
}

// A small scanner, so the CLI keeps no runtime dependencies: it knows strings, templates,
// comments, regexes and brackets, which is all it takes to find an object's members.

interface Token {
  start: number
  end: number
  /** Bracket depth from where the scan started; a closing bracket has its opener's depth. */
  depth: number
}

function* scan(src: string, from: number): Generator<Token> {
  let depth = 0
  let prev = ''
  for (let i = from; i < src.length;) {
    const c = src[i]!
    const n = src[i + 1]
    if (/\s/.test(c)) i++
    else if (c === '/' && n === '/') i = src.includes('\n', i) ? src.indexOf('\n', i) : src.length
    else if (c === '/' && n === '*')
      i = src.includes('*/', i + 2) ? src.indexOf('*/', i + 2) + 2 : src.length
    else {
      let end = i + 1
      if (c === '"' || c === "'") end = stringEnd(src, i)
      else if (c === '`') end = templateEnd(src, i)
      else if (c === '/' && (prev === '' || '(,=:[!&|?{};'.includes(prev))) end = regexEnd(src, i)
      else if (')]}'.includes(c)) depth--
      yield { start: i, end, depth }
      if (end === i + 1 && '([{'.includes(c)) depth++
      prev = end > i + 1 ? '"' : c
      i = end
    }
  }
}

function stringEnd(src: string, i: number) {
  let j = i + 1
  while (j < src.length && src[j] !== src[i] && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1
  return j + 1
}

function templateEnd(src: string, i: number) {
  let j = i + 1
  while (j < src.length && src[j] !== '`') {
    if (src[j] === '\\') j += 2
    else if (src[j] === '$' && src[j + 1] === '{') {
      const close = closing(src, j + 1)
      j = close < 0 ? src.length : close + 1
    } else j++
  }
  return j + 1
}

function regexEnd(src: string, i: number) {
  let j = i + 1
  let inClass = false
  while (j < src.length && src[j] !== '\n' && (inClass || src[j] !== '/')) {
    if (src[j] === '\\') j++
    else if (src[j] === '[') inClass = true
    else if (src[j] === ']') inClass = false
    j++
  }
  return j + 1
}

/** The index of the bracket that closes the one at `open`, or -1. */
function closing(src: string, open: number) {
  for (const token of scan(src, open))
    if (token.start > open && token.depth === 0) return token.start
  return -1
}

interface Member {
  /** Null for a spread or a computed key. */
  key: string | null
  start: number
  end: number
  /** Null for a method or a shorthand. */
  value: { start: number; end: number } | null
}

interface ObjectLiteral {
  open: number
  close: number
  members: Member[]
  trailingComma: boolean
}

function readObject(src: string, open: number): ObjectLiteral | null {
  const close = src[open] === '{' ? closing(src, open) : -1
  if (close < 0) return null
  const members: Member[] = []
  let tokens: Token[] = []
  let trailingComma = false
  const finish = () => {
    if (tokens.length) members.push(readMember(src, tokens))
    tokens = []
  }
  for (const token of scan(src, open + 1)) {
    if (token.start >= close) break
    trailingComma = token.depth === 0 && src[token.start] === ','
    if (trailingComma) finish()
    else tokens.push(token)
  }
  finish()
  return { open, close, members, trailingComma }
}

function readMember(src: string, tokens: Token[]): Member {
  const first = tokens[0]!
  const end = tokens.at(-1)!.end
  const quoted = '"\''.includes(src[first.start]!) && first.end > first.start + 1
  const word = /[A-Za-z_$][\w$]*/y
  word.lastIndex = first.start
  const key = quoted ? src.slice(first.start + 1, first.end - 1) : (word.exec(src)?.[0] ?? null)
  const keyEnd = quoted ? first.end : first.start + (key?.length ?? 0)
  const colon = tokens.findIndex((token) => token.start >= keyEnd)
  const hasValue = key !== null && colon > 0 && src[tokens[colon]!.start] === ':'
  const value = hasValue ? tokens[colon + 1] : undefined
  return { key, start: first.start, end, value: value ? { start: value.start, end } : null }
}

/** The strings of an array literal of string literals, or null for anything else. */
function readStrings(src: string, open: number, end: number): string[] | null {
  if (src[open] !== '[' || closing(src, open) !== end - 1) return null
  const items: string[] = []
  let expectItem = true
  for (const token of scan(src, open + 1)) {
    if (token.start >= end - 1) break
    const text = src.slice(token.start, token.end)
    if (!expectItem && text === ',') expectItem = true
    else if (expectItem && /^(["']).*\1$/.test(text) && !text.includes('\\')) {
      items.push(text.slice(1, -1))
      expectItem = false
    } else return null
  }
  return items
}

/** The object the file exports as its config: `export default` or `module.exports`, as an
 * object literal or a `const` that holds one (also inside a call, as with `withMDX(config)`). */
function configObject(src: string): ObjectLiteral | string {
  const top = [...scan(src, 0)].filter((token) => token.depth === 0)
  const matchAt = (pattern: RegExp, index: number) => {
    pattern.lastIndex = index
    return /[\w$.]/.test(src[index - 1] ?? '') ? null : pattern.exec(src)
  }
  let exported: { start: number; end: number } | null = null
  for (const token of top) {
    const match = matchAt(/(?:export\s+default|module\.exports\s*=)\s*/y, token.start)
    if (!match) continue
    const start = token.start + match[0].length
    const end = top.find((t) => t.start >= start && src[t.start] === ';')?.start ?? src.length
    exported = { start, end }
  }
  if (!exported) return 'it has no default export'
  if (src[exported.start] === '{') return readObject(src, exported.start) ?? 'it does not parse'
  for (const [name] of src.slice(exported.start, exported.end).matchAll(/[A-Za-z_$][\w$]*/g)) {
    const declaration = new RegExp(
      `(?:const|let|var)\\s+${name.replace(/\$/g, '\\$')}\\s*(?::[^=]*)?=\\s*`,
      'y',
    )
    for (const token of top) {
      const match = matchAt(declaration, token.start)
      const object = match && readObject(src, token.start + match[0].length)
      if (object) return object
    }
  }
  return 'its config is not an object literal'
}

interface Edit {
  start: number
  end: number
  text: string
}

interface Style {
  quote: string
  unit: string
}

const quoteWith = (style: Style, text: string) => `${style.quote}${text}${style.quote}`
const renderKey = (style: Style, key: string) =>
  /^[A-Za-z_$][\w$]*$/.test(key) ? key : quoteWith(style, key)
const pathName = (path: string[]) =>
  path
    .map((key, index) =>
      /^[A-Za-z_$][\w$]*$/.test(key) ? `${index ? '.' : ''}${key}` : `['${key}']`,
    )
    .join('')

// Prettier's default width, which create-next-app's files also keep to.
const width = 80

function render(style: Style, value: Setting, indent: string, column: number): string {
  if (typeof value === 'string') return quoteWith(style, value)
  if (Array.isArray(value)) {
    const inline = `[${value.map((item) => quoteWith(style, item)).join(', ')}]`
    if (column + inline.length < width) return inline
    const items = value.map((item) => `${indent}${style.unit}${quoteWith(style, item)},\n`)
    return `[\n${items.join('')}${indent}]`
  }
  const entries = Object.entries(value)
  if (entries.every(([, item]) => typeof item === 'string')) {
    const pairs = entries.map(
      ([key, item]) => `${renderKey(style, key)}: ${render(style, item, '', 0)}`,
    )
    const inline = `{ ${pairs.join(', ')} }`
    if (column + inline.length < width) return inline
  }
  return `{\n${renderMembers(style, entries, indent + style.unit, false)}\n${indent}}`
}

/** Members to insert, one per line, each with a trailing comma. */
function renderMembers(style: Style, entries: [string, Setting][], indent: string, root: boolean) {
  return entries
    .map(([key, value]) => {
      const note = root && notes[key] ? `${indent}// ${notes[key]}\n` : ''
      const head = `${indent}${renderKey(style, key)}: `
      return `${note}${head}${render(style, value, indent, head.length)},`
    })
    .join('\n')
}

/** Adds each item of `wanted` that is missing, before the next wanted item the list has. */
function mergeList(existing: string[], wanted: string[]) {
  const list = [...existing]
  wanted.forEach((item, index) => {
    if (list.includes(item)) return
    const next = wanted.slice(index + 1).find((later) => list.includes(later))
    list.splice(next === undefined ? list.length : list.indexOf(next), 0, item)
  })
  return list
}

const lineStart = (src: string, index: number) => src.lastIndexOf('\n', index - 1) + 1
const lineIndent = (src: string, index: number) =>
  /^[ \t]*/.exec(src.slice(lineStart(src, index)))![0]

interface Context {
  src: string
  style: Style
  edits: Edit[]
  changed: string[]
}

/**
 * Plans the edits that give `object` every wanted setting, or says why it cannot. `outer` is
 * the indent of the line the object starts on, once its parent is written out.
 */
function ensure(
  context: Context,
  object: ObjectLiteral,
  wanted: Record<string, Setting>,
  path: string[],
  outer = lineIndent(context.src, object.open),
): string | null {
  const { src, style } = context
  const planned = context.edits.length
  // A one-line object that changes opens up, one member per line.
  const oneLine = !src.slice(object.open, object.close).includes('\n')
  const first = object.members[0]
  const indent =
    !oneLine &&
    first &&
    lineStart(src, first.start) + lineIndent(src, first.start).length === first.start
      ? lineIndent(src, first.start)
      : outer + style.unit
  const missing: [string, Setting][] = []
  for (const [key, want] of Object.entries(wanted)) {
    const name = pathName([...path, key])
    // A later member wins, as it does when the file runs.
    const member = object.members.findLast((m) => m.key === key)
    if (!member) {
      missing.push([key, want])
      continue
    }
    if (!member.value) return `${name} is not written out`
    const { start, end } = member.value
    const memberIndent = oneLine ? indent : lineIndent(src, member.start)
    if (typeof want === 'string') {
      const text = src.slice(start, end)
      if (!/^(["']).*\1$/.test(text) || text.slice(1, -1) !== want)
        return `${name} is set to ${text}`
    } else if (Array.isArray(want)) {
      const items = readStrings(src, start, end)
      if (!items) return `${name} is not a list of strings`
      const merged = mergeList(items, want)
      if (merged.length === items.length) continue
      const column = oneLine ? indent.length + start - member.start : start - lineStart(src, start)
      context.edits.push({ start, end, text: render(style, merged, memberIndent, column) })
      context.changed.push(name)
    } else {
      const inner = closing(src, start) === end - 1 ? readObject(src, start) : null
      if (!inner) return `${name} is not an object`
      const error = ensure(context, inner, want, [...path, key], memberIndent)
      if (error) return error
    }
  }
  // A spread may already set what is missing, and a member after it would replace that.
  if (missing.length && object.members.some((member) => src.startsWith('...', member.start)))
    return `${path.length ? pathName(path) : 'its config'} spreads another object`
  const opens = oneLine && (missing.length > 0 || context.edits.length > planned)
  if (!missing.length && !opens) return null

  if (opens)
    for (const member of object.members) {
      let gap = member.start
      while (gap > object.open + 1 && /[ \t]/.test(src[gap - 1]!)) gap--
      context.edits.push({ start: gap, end: member.start, text: `\n${indent}` })
    }
  // After the last member, or the comment that stands in for one.
  let at = object.close
  while (at > object.open + 1 && /\s/.test(src[at - 1]!)) at--
  const last = object.members.at(-1)
  if (missing.length && last && !object.trailingComma)
    context.edits.push({ start: last.end, end: last.end, text: ',' })
  const added = missing.length ? `\n${renderMembers(style, missing, indent, !path.length)}` : ''
  const multiline = src.slice(at, object.close).includes('\n')
  context.edits.push({
    start: at,
    end: multiline ? at : object.close,
    text: multiline ? added : `${added}\n${outer}`,
  })
  context.changed.push(...missing.map(([key]) => pathName([...path, key])))
  return null
}

function styleOf(src: string): Style {
  const first = [...scan(src, 0)].find((token) => '"\''.includes(src[token.start]!))
  const indented = src.split('\n').find((line) => /^[ \t]+[^\s*]/.test(line))
  return {
    quote: first ? src[first.start]! : "'",
    unit: indented ? /^[ \t]+/.exec(indented)![0] : '  ',
  }
}

/** Gives a Next.js config's source Adv UI's settings, or says why it cannot. */
export function editNextConfig(
  source: string,
  settings: Record<string, Setting>,
): { text: string; changed: string[] } | { error: string } {
  const crlf = source.includes('\r\n')
  const src = crlf ? source.replace(/\r\n/g, '\n') : source
  const object = configObject(src)
  if (typeof object === 'string') return { error: object }
  const context: Context = { src, style: styleOf(src), edits: [], changed: [] }
  const error = ensure(context, object, settings, [])
  if (error) return { error }
  // From the end, so earlier offsets hold; at one offset, the edit planned last goes last.
  const edits = context.edits
    .map((edit, order) => ({ ...edit, order }))
    .sort((a, b) => b.start - a.start || b.order - a.order)
  let text = src
  for (const edit of edits) text = text.slice(0, edit.start) + edit.text + text.slice(edit.end)
  return { text: crlf ? text.replace(/\n/g, '\r\n') : text, changed: context.changed }
}

export type NextConfigResult =
  | { file: string; status: 'created' | 'unchanged' }
  | { file: string; status: 'updated'; changed: string[] }
  | { file: string; status: 'skipped'; reason: string; settings: string }

/** Writes Adv UI's settings into the app's Next.js config, creating one if it has none. */
export function setUpNextConfig(
  root: string,
  typescript: boolean,
  dependencies: Record<string, string>,
): NextConfigResult {
  const settings = nextSettings(dependencies)
  const existing = configFiles.find((name) => existsSync(join(root, name)))
  const file = existing ?? (typescript ? 'next.config.ts' : 'next.config.mjs')
  const source = existing
    ? readFileSync(join(root, file), 'utf8')
    : typescript
      ? `import type { NextConfig } from 'next'\n\nconst nextConfig: NextConfig = {}\n\nexport default nextConfig\n`
      : `/** @type {import('next').NextConfig} */\nconst nextConfig = {}\n\nexport default nextConfig\n`
  const result = editNextConfig(source, settings)
  if ('error' in result) {
    const style = { quote: "'", unit: '  ' }
    const lines = renderMembers(style, Object.entries(settings), '  ', true)
    return { file, status: 'skipped', reason: result.error, settings: lines }
  }
  if (existing && !result.changed.length) return { file, status: 'unchanged' }
  writeFileSync(join(root, file), result.text)
  return existing
    ? { file, status: 'updated', changed: result.changed }
    : { file, status: 'created' }
}
