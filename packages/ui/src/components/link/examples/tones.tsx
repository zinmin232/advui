import { HStack, Link, Text, VStack, toast } from '@advui/core'

const go = (page: string) => () => toast(`Go to ${page}`)

export default function LinkTones() {
  return (
    <VStack gap="$4">
      <HStack gap="$4" flexWrap="wrap" alignItems="center">
        <Link onPress={go('Primary')} size="sm">
          Primary
        </Link>
        <Link onPress={go('Muted')} size="sm" tone="muted">
          Muted
        </Link>
        <Text size="sm" tone="success">
          <Link onPress={go('Inherit')} tone="inherit">
            Inherit
          </Link>
        </Text>
      </HStack>
      {/* Links outside running text, like a footer, may underline on hover only. */}
      <HStack gap="$4" flexWrap="wrap">
        {['About', 'Blog', 'Careers', 'Privacy'].map((page) => (
          <Link key={page} onPress={go(page)} size="sm" tone="muted" underline="hover">
            {page}
          </Link>
        ))}
      </HStack>
    </VStack>
  )
}
