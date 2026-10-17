import { CopyButton, HStack } from '@advui/core'

export default function CopyButtonLabel() {
  return (
    <HStack flexWrap="wrap" gap="$3">
      <CopyButton value="https://example.org/invite/7Hq2" labels={{ copied: 'Link copied' }}>
        Copy invite link
      </CopyButton>
      <CopyButton value="#A-2041" variant="secondary" size="sm">
        Copy order number
      </CopyButton>
    </HStack>
  )
}
