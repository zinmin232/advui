import { CodeBlock, type CodeToken } from '@advui/core'

// Tokens as a highlighter returns them, in theme colors so they follow dark mode.
const keyword = { color: 'infoSoftForeground' } as const
const name = { color: 'warningSoftForeground' } as const
const text = { color: 'successSoftForeground' } as const
const comment = { color: 'mutedForeground', italic: true } as const

const tokens: CodeToken[][] = [
  [{ content: '// Greets the signed-in user', ...comment }],
  [
    { content: 'export function', ...keyword },
    { content: ' ' },
    { content: 'greet', ...name },
    { content: '(name: ' },
    { content: 'string', ...keyword },
    { content: ') {' },
  ],
  [
    { content: '  ' },
    { content: 'return', ...keyword },
    { content: ' ' },
    { content: '`Hello, ${name}!`', ...text },
  ],
  [{ content: '}' }],
]

const code = tokens.map((line) => line.map((token) => token.content).join('')).join('\n')

export default function CodeBlockColors() {
  return <CodeBlock language="ts" code={code} tokens={tokens} width="100%" />
}
