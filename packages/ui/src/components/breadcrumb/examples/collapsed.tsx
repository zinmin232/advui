import { Breadcrumb, Text, VStack, toast } from '@advui/core'

const path = ['Home', 'Acme Inc.', 'Workspaces', 'Design', 'Projects', 'Atlas', 'Billing']
const go = (page: string) => () => toast(`Go to ${page}`)

export default function BreadcrumbCollapsed() {
  return (
    <VStack gap="$4">
      {/* Deep paths: keep the first item and the last two; the rest are one press away. */}
      <Breadcrumb maxItems={3}>
        {path.map((page, index) => (
          <Breadcrumb.Item key={page} onPress={index < path.length - 1 ? go(page) : undefined}>
            {page}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <Breadcrumb
        separator={
          <Text size="sm" tone="muted">
            /
          </Text>
        }
      >
        <Breadcrumb.Item onPress={go('Docs')}>Docs</Breadcrumb.Item>
        <Breadcrumb.Item onPress={go('Guides')}>Guides</Breadcrumb.Item>
        <Breadcrumb.Item>Theming</Breadcrumb.Item>
      </Breadcrumb>
    </VStack>
  )
}
