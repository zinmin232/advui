import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Sidebar',
  slug: 'sidebar',
  category: 'navigation',
  description: 'App navigation down the side of the screen, collapsible to an icon rail.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Sidebar',
    'SidebarFrame',
    'SidebarItemFrame',
    'useSidebar',
    'SidebarProps',
    'SidebarItemProps',
    'SidebarGroupProps',
    'SidebarToggleProps',
  ],
  files: ['components/sidebar/Sidebar.tsx', 'components/sidebar/index.ts'],
  keywords: ['sidebar', 'side nav', 'navigation rail', 'app shell', 'drawer', 'menu'],
  usage: `import { Sidebar } from '@advui/core'
import { HomeIcon } from '@advui/icons'

<Sidebar aria-label="App">
  <Sidebar.Header>
    <Sidebar.Toggle />
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group label="Workspace">
      <Sidebar.Item href="/" icon={<HomeIcon />} active>Dashboard</Sidebar.Item>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar>`,
  parts: [
    {
      name: 'Sidebar',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Sidebar'",
          description: 'Names the navigation landmark.',
        },
        {
          name: 'collapsed / defaultCollapsed / onCollapsedChange',
          type: 'boolean',
          description: 'Icon-only rail (64px instead of 256px).',
        },
      ],
    },
    {
      name: 'Sidebar.Header / Sidebar.Content / Sidebar.Footer',
      description: 'Top row (brand, toggle), the scrolling middle, and the bottom (account).',
      props: [],
    },
    {
      name: 'Sidebar.Group',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Heading that names the list; hidden but still read when collapsed.',
        },
      ],
    },
    {
      name: 'Sidebar.Item',
      props: [
        { name: 'icon', type: 'ReactNode', description: 'Shown alone when collapsed.' },
        { name: 'href', type: 'string', description: 'Link target on web.' },
        {
          name: 'onPress',
          type: '(event) => void',
          description: 'Navigate with your router (needed on iOS and Android).',
        },
        { name: 'render', type: 'ReactElement', description: 'Your router’s link element.' },
        {
          name: 'active',
          type: 'boolean',
          default: 'false',
          description: 'The current page (`aria-current="page"`).',
        },
        { name: 'badge', type: 'ReactNode', description: 'A count or tag after the label.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Not pressable.' },
      ],
    },
    {
      name: 'Sidebar.Toggle',
      description: 'Collapse / expand button (`aria-expanded`, `aria-controls`).',
      props: [
        {
          name: 'labels',
          type: '{ collapse: string; expand: string }',
          description: 'Button names, for translation.',
        },
      ],
    },
    {
      name: 'useSidebar()',
      description: '`{ collapsed, setCollapsed }` for your own header and footer content.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'App sidebar',
      description: 'Groups, badges, a disabled item and the collapse toggle.',
    },
    { name: 'drawer', title: 'In a drawer on phones' },
  ],
  accessibility: [
    'A `nav` landmark named by `aria-label`; each group is a list named by its label.',
    'Items are links (`<a>` with `href`); the current page has `aria-current="page"` on web, and "current page" in its name on native.',
    'Collapsed, the labels and badges are visually hidden but stay in each link’s name, so the icon rail is still fully labelled.',
    'The toggle is a named button with `aria-expanded`. Rows are 44pt tall on touch screens.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the links and the toggle.' },
    { keys: 'Enter', action: 'Follows the focused link.' },
  ],
  responsive:
    'Give it the full height of the layout. On phones, hide it (`$max-md={{ display: "none" }}`) and put the same items in a Drawer.',
  platformNotes: {
    web: '`Sidebar.Content` scrolls when the items overflow.',
    ios: 'Wrap long content in a ScrollArea to scroll it.',
    android: 'Same as iOS, with the ripple when the config has `androidRipple`.',
  },
  related: ['drawer', 'navigation-menu', 'menu', 'navigation-bar'],
})
