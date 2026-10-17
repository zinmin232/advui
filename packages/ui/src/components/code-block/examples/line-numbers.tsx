import { CodeBlock } from '@advui/core'

const code = `{
  "name": "clinic-app",
  "dependencies": {
    "@advui/core": "^0.14.0",
    "@advui/icons": "^0.14.0"
  }
}`

export default function CodeBlockLineNumbers() {
  return (
    <CodeBlock
      title="package.json"
      language="json"
      code={code}
      lineNumbers
      highlightLines={[4, 5]}
      width="100%"
    />
  )
}
