import { Heading, Link, Text, VStack, VisuallyHidden, toast } from '@advui/core'

const posts = [
  {
    title: 'Plans for teams',
    summary: 'Shared billing, seats and roles for every workspace.',
  },
  {
    title: 'Single sign-on',
    summary: 'Sign in with your company account through SAML or OIDC.',
  },
]

export default function VisuallyHiddenBasic() {
  return (
    <VStack gap="5" maxWidth="112">
      {posts.map((post) => (
        <VStack key={post.title} gap="1">
          <Heading level={3} size="lg">
            {post.title}
          </Heading>
          <Text size="sm" tone="muted">
            {post.summary}
          </Text>
          {/* Read as “Read more about plans for teams”: each link names its post. */}
          <Link
            onPress={() => toast(`Go to ${post.title}`)}
            size="sm"
            weight="medium"
            alignSelf="flex-start"
          >
            Read more<VisuallyHidden> about {post.title.toLowerCase()}</VisuallyHidden>
          </Link>
        </VStack>
      ))}
    </VStack>
  )
}
