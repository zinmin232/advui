import { CodeBlock } from '@advui/core'

const code = `import { UniversalProvider } from '@advui/core'
import { config } from './tamagui.config'

export default function App({ children }) {
  return <UniversalProvider config={config}>{children}</UniversalProvider>
}`

export default function CodeBlockTitle() {
  return <CodeBlock title="app/providers.tsx" language="tsx" code={code} width="100%" />
}
