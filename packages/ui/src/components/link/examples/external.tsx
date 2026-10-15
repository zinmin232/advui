import { Link, Text, VStack } from '@advui/core'

export default function LinkExternal() {
  return (
    <VStack gap="$3" maxWidth="$112">
      <Text>
        Adv UI is built on{' '}
        <Link href="https://tamagui.dev" external>
          Tamagui
        </Link>{' '}
        and tested with{' '}
        <Link href="https://vitest.dev" external>
          Vitest
        </Link>
        .
      </Text>
      <Text size="sm" tone="muted">
        Questions? Email{' '}
        <Link href="mailto:support@example.com" tone="inherit">
          support@example.com
        </Link>{' '}
        or call <Link href="tel:+15550100">+1 555 0100</Link>.
      </Text>
    </VStack>
  )
}
