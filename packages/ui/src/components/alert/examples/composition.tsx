import { Alert, Text, VStack } from '@advui/core'
import { PackageIcon } from '@advui/icons'

export default function AlertComposition() {
  return (
    <Alert variant="info" icon={<PackageIcon />} width="100%">
      <Alert.Title>Before you upgrade</Alert.Title>
      <VStack gap="$1">
        <Alert.Description>1. Back up the database.</Alert.Description>
        <Alert.Description>2. Read the migration guide.</Alert.Description>
        <Alert.Description>3. Update every package at once.</Alert.Description>
      </VStack>
      <Text size="xs" tone="info">
        Takes about ten minutes.
      </Text>
    </Alert>
  )
}
