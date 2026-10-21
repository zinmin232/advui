import { Alert, VStack } from '@advui/core'

export default function AlertSizes() {
  return (
    <VStack gap="3" width="100%">
      <Alert
        size="sm"
        variant="info"
        title="Small"
        description="For forms, tables and other dense layouts."
      />
      <Alert variant="info" title="Medium" description="The default, for most pages." />
      <Alert
        size="lg"
        variant="info"
        title="Large"
        description="For the one message a page is about."
      />
    </VStack>
  )
}
