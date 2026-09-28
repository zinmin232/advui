import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Navigation Menu',
  slug: 'navigation-menu',
  category: 'navigation',
  description: 'Site navigation with links and buttons that open panels of more links.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'NavigationMenu',
    'NavigationMenuProps',
    'NavigationMenuLinkProps',
    'NavigationMenuItemProps',
  ],
  files: ['components/navigation-menu/NavigationMenu.tsx', 'components/navigation-menu/index.ts'],
  keywords: ['navigation', 'nav', 'menu bar', 'mega menu', 'header', 'top bar', 'links'],
  usage: `import { NavigationMenu } from '@advui/core'

<NavigationMenu aria-label="Main">
  <NavigationMenu.Link href="/" active>Home</NavigationMenu.Link>
  <NavigationMenu.Item label="Data">
    <NavigationMenu.Link href="/5w" description="Who does what, where">5W dashboard</NavigationMenu.Link>
  </NavigationMenu.Item>
</NavigationMenu>`,
  parts: [
    {
      name: 'NavigationMenu',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Main'",
          description: 'Names the landmark. Needed when a page has more than one.',
        },
        {
          name: 'value / defaultValue / onValueChange',
          type: 'string | null',
          description: 'The open item (its `value` or `label`).',
        },
      ],
    },
    {
      name: 'NavigationMenu.Link',
      props: [
        { name: 'href', type: 'string', description: 'Link target on web.' },
        {
          name: 'onPress',
          type: '(event) => void',
          description: 'Navigate with your router (needed on iOS and Android).',
        },
        {
          name: 'render',
          type: 'ReactElement',
          description: 'Your router’s link, e.g. `render={<Link href="/maps" />}`.',
        },
        {
          name: 'active',
          type: 'boolean',
          default: 'false',
          description: 'The current page (`aria-current="page"`).',
        },
        { name: 'description', type: 'ReactNode', description: 'Second line, in panels.' },
        { name: 'icon', type: 'ReactNode', description: 'Icon before the title, in panels.' },
      ],
    },
    {
      name: 'NavigationMenu.Item',
      props: [
        { name: 'label', type: 'string', required: true, description: 'Button text.' },
        { name: 'value', type: 'string', description: 'Id for `value`. Default: `label`.' },
        {
          name: 'panelWidth',
          type: 'size token | number',
          default: "'$72'",
          description: 'Width of the panel on web.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          required: true,
          description: '`NavigationMenu.Link` elements shown in the panel.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Links and panels' }],
  accessibility: [
    'A `nav` landmark with a list of links and buttons. It follows the WAI-ARIA disclosure navigation pattern, not `menu`, so every link is a normal Tab stop and is announced as a link.',
    'Item buttons set `aria-expanded` and (on web) `aria-controls` pointing at their panel.',
    'The current page has `aria-current="page"` on web; on native its name ends with "current page".',
    'Escape closes the open panel and returns focus to its button. Pressing or tabbing outside closes it, and so does following a link.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the links and buttons, into an open panel.' },
    { keys: 'Enter / Space', action: 'Opens or closes a panel; follows a link.' },
    { keys: 'Escape', action: 'Closes the panel and focuses its button.' },
  ],
  responsive:
    'The bar wraps when it runs out of room. On phones, prefer a Sidebar in a Drawer for long navigation.',
  platformNotes: {
    web: 'Panels float under their button (`zIndex.dropdown`).',
    ios: 'The open panel shows under the bar instead of floating, so it never covers the screen.',
    android: 'Same as iOS; the back button closes an open panel.',
  },
  related: ['sidebar', 'breadcrumb', 'dropdown-menu', 'navigation-bar'],
})
