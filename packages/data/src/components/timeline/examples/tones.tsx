import { Timeline } from '@advui/data'
import { CheckIcon, CircleIcon, PackageIcon, XIcon } from '@advui/icons'

export default function TimelineTones() {
  return (
    <Timeline width="100%" maxWidth="$96">
      <Timeline.Item
        tone="success"
        icon={<CheckIcon />}
        title="Order placed"
        time="Mon, 09:12"
        description="Payment confirmed."
      />
      <Timeline.Item tone="success" icon={<PackageIcon />} title="Packed" time="Mon, 15:40" />
      <Timeline.Item
        tone="error"
        icon={<XIcon />}
        title="Delivery failed"
        time="Tue, 11:05"
        description="No one was at the address. We will try again tomorrow."
      />
      <Timeline.Item
        tone="primary"
        icon={<CircleIcon />}
        title="Out for delivery"
        time="Wed, 08:30"
        aria-current="step"
      />
    </Timeline>
  )
}
