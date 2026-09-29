import { Timeline } from '@advui/data'

export default function TimelineBasic() {
  return (
    <Timeline width="100%" maxWidth="$96">
      <Timeline.Item
        title="Assessment published"
        time="Sep 24"
        description="Shared on the website and with the cluster leads."
      />
      <Timeline.Item
        title="Data cleaned"
        time="Sep 18"
        description="Duplicates removed and place codes matched."
      />
      <Timeline.Item title="Survey closed" time="Sep 10" />
    </Timeline>
  )
}
