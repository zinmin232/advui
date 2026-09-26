import { type CodeLang, highlight } from '../lib/highlight'
import { CodeBlock } from './code-block'

/** Server component: highlights at build time, ships only HTML + a copy button. */
export async function Code({
  code,
  lang = 'tsx',
  title,
  maxHeight,
}: {
  code: string
  lang?: CodeLang
  title?: string
  maxHeight?: number
}) {
  const html = await highlight(code, lang)
  return <CodeBlock html={html} code={code.trimEnd()} title={title} maxHeight={maxHeight} />
}
