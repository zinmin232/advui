import { Button, Text, Toolbar, VStack } from '@advui/core'

const variants = ['default', 'outline', 'filled', 'ghost'] as const

export default function ToolbarVariants() {
  return (
    <VStack gap="3" width="100%">
      {variants.map((variant) => (
        <Toolbar
          key={variant}
          aria-label={`${variant} toolbar`}
          variant={variant}
          leading={
            <Text size="sm" tone="muted">
              {variant}
            </Text>
          }
          trailing={
            <>
              <Button size="sm" variant="outline">
                Cancel
              </Button>
              <Button size="sm">Save</Button>
            </>
          }
        />
      ))}
    </VStack>
  )
}
