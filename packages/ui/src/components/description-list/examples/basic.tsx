import { Badge, DescriptionList } from '@advui/core'

export default function DescriptionListBasic() {
  return (
    <DescriptionList width="100%" maxWidth="112">
      <DescriptionList.Item term="Order">#4021</DescriptionList.Item>
      <DescriptionList.Item term="Placed">October 14, 2026</DescriptionList.Item>
      <DescriptionList.Item term="Status">
        <Badge variant="success">Paid</Badge>
      </DescriptionList.Item>
      <DescriptionList.Item term="Ship to">
        Ada Lovelace, 12 Garden Lane, Bristol BS1 4DJ
      </DescriptionList.Item>
    </DescriptionList>
  )
}
