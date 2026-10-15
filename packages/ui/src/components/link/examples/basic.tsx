import { Link, Text, VStack, toast } from '@advui/core'

// In an app, pass `href` (web) and/or `onPress` with your router, e.g.
// onPress={() => router.push('/pricing')}.
const go = (page: string) => () => toast(`Go to ${page}`)

export default function LinkBasic() {
  return (
    <VStack gap="$3" maxWidth="$112">
      <Text>
        Compare the plans on the <Link onPress={go('Pricing')}>pricing page</Link>, or read how
        billing works in the <Link onPress={go('Help')}>help center</Link>.
      </Text>
      <Text size="sm" tone="muted">
        By signing up you agree to the{' '}
        <Link onPress={go('Terms')} tone="inherit">
          terms of service
        </Link>
        .
      </Text>
      <Link onPress={go('All posts')} size="sm" weight="medium" underline="hover">
        See all posts
      </Link>
    </VStack>
  )
}
