import { Alert, VStack } from '@advui/core'

export default function AlertVariants() {
  return (
    <VStack gap="$3" width="100%">
      <Alert>
        <Alert.Title>Heads up</Alert.Title>
        <Alert.Description>You can add components using the CLI.</Alert.Description>
      </Alert>
      <Alert variant="info">
        <Alert.Title>Scheduled maintenance</Alert.Title>
        <Alert.Description>Sunday 02:00–03:00 UTC.</Alert.Description>
      </Alert>
      <Alert variant="success">
        <Alert.Title>Payment received</Alert.Title>
      </Alert>
      <Alert variant="warning">
        <Alert.Title>Storage almost full</Alert.Title>
        <Alert.Description>You have used 92% of your quota.</Alert.Description>
      </Alert>
      <Alert variant="error">
        <Alert.Title>Build failed</Alert.Title>
        <Alert.Description>Check the logs for details.</Alert.Description>
      </Alert>
    </VStack>
  )
}
