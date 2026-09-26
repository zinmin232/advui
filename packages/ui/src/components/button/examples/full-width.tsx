import { Button, VStack } from '@adv-ui/core'

export default function ButtonFullWidth() {
  return (
    <VStack gap="$2" width="100%" maxWidth="$80">
      <Button fullWidth size="lg">
        Create account
      </Button>
      <Button fullWidth size="lg" variant="ghost">
        I already have an account
      </Button>
    </VStack>
  )
}
