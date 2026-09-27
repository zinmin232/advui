import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Navigation Bar',
  slug: 'navigation-bar',
  category: 'navigation',
  description:
    'Switches between three to five top-level destinations of an app, at the bottom of the screen on phones.',
  status: 'beta',
  since: '0.2.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['NavigationBar'],
  files: ['components/navigation-bar/NavigationBar.tsx', 'components/navigation-bar/index.ts'],
  keywords: ['bottom navigation', 'tab bar', 'bottom tabs', 'material', 'app bar', 'nav'],
  usage: `import { NavigationBar } from '@advui/core'
import { BellIcon, HomeIcon, SearchIcon } from '@advui/icons'

<NavigationBar value={tab} onValueChange={setTab} aria-label="Main">
  <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
  <NavigationBar.Item value="search" icon={<SearchIcon />} label="Search" />
  <NavigationBar.Item value="inbox" icon={<BellIcon />} label="Inbox" badge={3} />
</NavigationBar>`,
  parts: [
    {
      name: 'NavigationBar',
      props: [
        {
          name: 'value / defaultValue',
          type: 'string',
          description: 'The current destination.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description: 'Called with the item the user picks; navigate here.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the navigation landmark, e.g. “Main”.',
        },
      ],
    },
    {
      name: 'NavigationBar.Item',
      props: [
        { name: 'value', type: 'string', required: true, description: 'Unique value.' },
        { name: 'icon', type: 'ReactNode', required: true, description: 'Destination icon.' },
        { name: 'label', type: 'string', required: true, description: 'Always visible.' },
        {
          name: 'badge',
          type: 'number | boolean',
          description: 'A count (99+ above 99) or a dot. Announced as “Inbox, 3 new”.',
        },
        {
          name: 'render',
          type: 'ReactElement',
          description: 'Web: your router’s link, e.g. `<Link href="/inbox" />`.',
        },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not selectable.' },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Four destinations with badges' }],
  accessibility: [
    'On web a `nav` landmark whose items are buttons (or your links) with `aria-current="page"` on the current one.',
    'On iOS and Android a tab bar: items are tabs with a selected state, so screen readers say “Inbox, tab, 2 of 4, selected”.',
    'Badges are part of the item’s name (“Inbox, 3 new”); the visual bubble is hidden from screen readers.',
    'The current destination is shown by the pill, color and bolder label together.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves between destinations.' },
    { keys: 'Enter / Space', action: 'Opens the focused destination.' },
  ],
  responsive:
    'Items share the width equally. On tablets and desktop, a side navigation usually fits better.',
  platformNotes: {
    web: 'Keep it fixed at the bottom of mobile layouts; use `render` with your router’s link.',
    ios: 'Add the bottom safe-area inset as padding so it clears the home indicator.',
    android: 'Can replace Expo Router’s default tab bar through its `tabBar` option.',
  },
  related: ['tabs', 'fab', 'breadcrumb'],
})
