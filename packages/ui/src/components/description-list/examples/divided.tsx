import { DescriptionList, Link } from '@advui/core'

export default function DescriptionListDivided() {
  return (
    <DescriptionList orientation="vertical" divided width="100%" maxWidth="96">
      <DescriptionList.Item term="Full name">Ada Lovelace</DescriptionList.Item>
      <DescriptionList.Item term="Email">
        <Link href="mailto:ada@example.com" size="sm">
          ada@example.com
        </Link>
      </DescriptionList.Item>
      <DescriptionList.Item term="Role">Admin</DescriptionList.Item>
      <DescriptionList.Item term="About">
        Writes the release notes and looks after the design system, and knows the build best.
      </DescriptionList.Item>
    </DescriptionList>
  )
}
