import { CodeBlock, VStack } from '@advui/core'

const command =
  'curl --request POST https://api.example.org/v1/clinics/42/reports --header "Authorization: Bearer $TOKEN" --header "Content-Type: application/json" --data @report.json --retry 3'

const log = Array.from(
  { length: 24 },
  (_, i) => `[08:${String(i * 2).padStart(2, '0')}] sync: uploaded batch ${i + 1} of 24`,
).join('\n')

export default function CodeBlockLongLines() {
  return (
    <VStack gap="$4" width="100%">
      <CodeBlock language="bash" code={command} />
      <CodeBlock language="bash" code={command} wrap />
      <CodeBlock title="sync.log" code={log} lineNumbers maxHeight="$48" />
    </VStack>
  )
}
