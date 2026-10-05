import { defineMeta } from '@advui/core/meta'

export default defineMeta({
  name: 'Timeline',
  slug: 'timeline',
  category: 'data-display',
  description: 'Events in order along a vertical line, such as an activity feed or order history.',
  status: 'stable',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Timeline',
    'TimelineFrame',
    'TimelineItemFrame',
    'TimelineTitle',
    'TimelineTime',
    'TimelineDescription',
    'TimelineProps',
    'TimelineItemProps',
    'TimelineTone',
  ],
  files: ['components/timeline/Timeline.tsx', 'components/timeline/index.ts'],
  keywords: ['timeline', 'history', 'activity', 'feed', 'events', 'log', 'tracking', 'steps'],
  usage: `import { Timeline } from '@advui/data'

<Timeline>
  <Timeline.Item title="Published" time="Sep 24" description="Shared with partners." />
  <Timeline.Item title="Survey closed" time="Sep 10" />
</Timeline>`,
  parts: [
    {
      name: 'Timeline',
      description: 'The list of events, newest or oldest first.',
      props: [],
      children: { accepts: ['Timeline.Item'] },
    },
    {
      name: 'Timeline.Item',
      props: [
        { name: 'title', type: 'ReactNode', required: true, description: 'What happened.' },
        { name: 'time', type: 'ReactNode', description: 'When it happened, already formatted.' },
        { name: 'description', type: 'ReactNode', description: 'Details under the title.' },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon in the marker. Without one, the marker is a dot.',
        },
        {
          name: 'tone',
          type: "'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'",
          options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
          default: "'default'",
          description: 'Color of the marker.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Extra content under the description.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['Timeline'],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    {
      name: 'tones',
      title: 'Icons and tones',
      description: 'The current event carries `aria-current="step"`.',
    },
    { name: 'activity', title: 'Activity feed', description: 'Items can hold any content.' },
  ],
  accessibility: [
    'The timeline has the `list` role and each event `listitem`, so screen readers announce how many there are.',
    'Markers and the line are decorative and hidden. Tone is only color, so say what happened in the title ("Delivery failed").',
    'Mark the current event with `aria-current="step"` on web.',
  ],
  platformNotes: {
    ios: '`aria-current` has no VoiceOver equivalent; put the state in the title if it matters.',
    android: 'Same as iOS.',
  },
  related: ['list', 'progress', 'card'],
})
