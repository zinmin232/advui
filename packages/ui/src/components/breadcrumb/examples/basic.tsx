import { Breadcrumb, toast } from '@advui/core'

// In an app, pass `href="/projects"`; on iOS and Android register your router
// once with setRouter (see Getting Started).
const go = (page: string) => () => toast(`Go to ${page}`)

export default function BreadcrumbBasic() {
  return (
    <Breadcrumb>
      <Breadcrumb.Item onPress={go('Home')}>Home</Breadcrumb.Item>
      <Breadcrumb.Item onPress={go('Projects')}>Projects</Breadcrumb.Item>
      <Breadcrumb.Item onPress={go('Atlas')}>Atlas</Breadcrumb.Item>
      <Breadcrumb.Item>Settings</Breadcrumb.Item>
    </Breadcrumb>
  )
}
