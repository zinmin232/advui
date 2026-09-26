import 'server-only'
import { type HighlighterCore, createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Fine-grained Shiki bundle: only the grammars and themes the docs use, the JS
// regex engine (no WASM) and one highlighter shared across all server renders.
let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [
      import('shiki/themes/github-light-high-contrast.mjs'),
      import('shiki/themes/github-dark-default.mjs'),
    ],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/json.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

export type CodeLang = 'tsx' | 'typescript' | 'bash' | 'json'

/** Returns HTML with both light and dark colors as CSS variables. */
export async function highlight(code: string, lang: CodeLang = 'tsx'): Promise<string> {
  const shiki = await getHighlighter()
  return shiki.codeToHtml(code.trimEnd(), {
    lang,
    // High-contrast light theme: default GitHub keyword red is only 4.35:1 on our code background.
    themes: { light: 'github-light-high-contrast', dark: 'github-dark-default' },
    defaultColor: false,
  })
}
