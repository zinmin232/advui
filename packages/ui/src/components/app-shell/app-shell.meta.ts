import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'App Shell',
  slug: 'app-shell',
  category: 'layout',
  description:
    'The frame of an app screen: header, sidebar, main content and footer. It fills the screen, Main scrolls between the bars, and the sidebar becomes a drawer on phones.',
  status: 'beta',
  since: '0.11.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'AppShell',
    'AppShellProps',
    'AppShellLayout',
    'AppShellBreakpoint',
    'AppShellHeaderProps',
    'AppShellSidebarProps',
    'AppShellMainProps',
    'AppShellFooterProps',
    'AppShellSidebarTriggerProps',
    'useAppShell',
  ],
  files: ['components/app-shell/AppShell.tsx', 'components/app-shell/index.ts'],
  keywords: [
    'app shell',
    'layout',
    'page layout',
    'dashboard',
    'header',
    'sidebar',
    'navigation drawer',
    'hamburger',
    'responsive',
    'landmarks',
  ],
  usage: `import { AppShell, Sidebar } from '@advui/core'

<AppShell sidebarBreakpoint="md">
  <AppShell.Header>
    <AppShell.SidebarTrigger />
    …
  </AppShell.Header>
  <AppShell.Sidebar aria-label="Main">
    <Sidebar>…</Sidebar>
  </AppShell.Sidebar>
  <AppShell.Main>…</AppShell.Main>
  <AppShell.Footer>…</AppShell.Footer>
</AppShell>`,
  parts: [
    {
      name: 'AppShell',
      description:
        'The screen: `100dvh` tall on web and `flex: 1` on iOS and Android (a `height` prop overrides it). Its children are the four areas, each at most once, as direct children; they can come in any order.',
      props: [
        {
          name: 'layout',
          type: "'header-full' | 'sidebar-full'",
          options: ['header-full', 'sidebar-full'],
          default: "'header-full'",
          description:
            'Which spans its whole edge: with `header-full` the header and footer span the width and the sidebar sits between them; with `sidebar-full` the sidebar spans the height and the header and footer sit beside it.',
        },
        {
          name: 'sidebarBreakpoint',
          type: "'sm' | 'md' | 'lg' | 'xl'",
          options: ['sm', 'md', 'lg', 'xl'],
          default: "'md'",
          description:
            'Below this width the sidebar is a drawer from the left, opened by `AppShell.SidebarTrigger`.',
        },
        {
          name: 'drawerWidth',
          type: 'number',
          default: '280',
          min: 160,
          step: 1,
          description: 'Width of the drawer, in px, at most 85% of the screen.',
        },
        {
          name: 'sidebarOpen',
          type: 'boolean',
          description: 'Whether the drawer is open (controlled). Always closed at desktop sizes.',
        },
        {
          name: 'defaultSidebarOpen',
          type: 'boolean',
          default: 'false',
          description: 'Starting `sidebarOpen` when uncontrolled.',
        },
        {
          name: 'onSidebarOpenChange',
          type: '(open: boolean) => void',
          description:
            'Called with the new `sidebarOpen`, including `false` when the window widens past the breakpoint.',
        },
        {
          name: 'stickyHeader',
          type: 'boolean',
          default: 'true',
          description:
            'Keep the header in place while Main scrolls. With `false` it scrolls away at the top of Main, so it spans Main’s column only.',
        },
        {
          name: 'safeArea',
          type: 'boolean',
          default: 'true',
          platforms: ['ios', 'android'],
          description:
            'Pad the edges the shell touches for the notch and home indicator. Turn it off when the shell sits below a navigation header or above a tab bar, which pad them already. The drawer always pads.',
        },
      ],
      children: {
        accepts: ['AppShell.Header', 'AppShell.Sidebar', 'AppShell.Main', 'AppShell.Footer'],
        max: 4,
      },
    },
    {
      name: 'AppShell.Header',
      description:
        'The top bar: a row with a border below, `<header>` (banner landmark) on web. Pads the top safe area on iOS and Android.',
      props: [],
      children: { accepts: 'any' },
      parents: ['AppShell'],
    },
    {
      name: 'AppShell.Sidebar',
      description:
        'The side area, a `<nav>` from the breakpoint up. It is as wide as its content, so a collapsible Sidebar inside still shrinks. Below the breakpoint its children move into the drawer. A Sidebar inside drops its own landmark, and in the drawer it fills the width and closes the drawer when an item is pressed.',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Main'",
          description: 'Names the navigation landmark and the drawer.',
        },
      ],
      children: { accepts: 'any' },
      parents: ['AppShell'],
    },
    {
      name: 'AppShell.Main',
      description:
        'The content, `<main>` on web. It sits in the area that scrolls (a ScrollView on iOS and Android) and fills it, so short content keeps the footer at the bottom. Add padding or a Container inside.',
      props: [],
      children: { accepts: 'any' },
      parents: ['AppShell'],
    },
    {
      name: 'AppShell.Footer',
      description:
        'The bottom bar, `<footer>` (contentinfo landmark) on web. It stays at the bottom edge; for a footer at the end of the content, put it at the end of Main instead. Pads the bottom safe area on iOS and Android.',
      props: [],
      children: { accepts: 'any' },
      parents: ['AppShell'],
    },
    {
      name: 'AppShell.SidebarTrigger',
      description:
        'An IconButton that opens the drawer, shown only below the breakpoint. It reports `aria-expanded` and `aria-controls`, and focus returns to it when the drawer closes. It renders nothing in a shell without a sidebar.',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          default: "'Open navigation'",
          description: 'The button’s accessible name.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Button size.',
        },
      ],
      children: { accepts: 'none' },
      within: 'AppShell',
    },
    {
      name: 'useAppShell()',
      kind: 'hook',
      description:
        'The drawer state, `{ sidebarOpen, setSidebarOpen }`, for your own menu button or to close the drawer after navigating.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'dashboard',
      title: 'Dashboard',
      description:
        'The default `header-full` layout: the header spans the top, with a menu button that appears below md.',
    },
    {
      name: 'docs',
      title: 'Docs',
      description:
        '`layout="sidebar-full"` with `sidebarBreakpoint="lg"`: the sidebar spans the height, and is a drawer below lg.',
    },
  ],
  accessibility: [
    'Web landmarks: the header is a banner, the sidebar a navigation landmark named by its `aria-label`, Main is `main` and the footer is contentinfo.',
    'The drawer is a Drawer: a dialog named after the sidebar, with focus trapped inside while open and returned to the trigger on close. Escape, the overlay and its × button close it.',
    'The scrolling area takes keyboard focus (web), so arrow keys and Page Down scroll Main without a mouse.',
    'The desktop sidebar stays in the document below the breakpoint, hidden with CSS, so it is out of the accessibility tree there and the drawer is the only copy screen readers meet.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'On the trigger: opens the drawer.' },
    { keys: 'Tab / Shift+Tab', action: 'Cycles focus inside the open drawer.' },
    { keys: 'Escape', action: 'Closes the drawer.' },
  ],
  responsive:
    'Below `sidebarBreakpoint` the sidebar moves into a drawer and the trigger appears. On web that is CSS media queries, so server-rendered HTML is right at every width with no flash; on iOS and Android it follows the window size. A drawer left open closes when the window widens past the breakpoint.',
  platformNotes: {
    web: 'The shell is `100dvh` tall and only Main scrolls, inside the shell, so the header, sidebar and footer need no sticky positioning. The desktop sidebar scrolls on its own when it is taller than the screen.',
    ios: 'The shell is `flex: 1` and Main is a ScrollView. The header pads the top safe area, the footer the bottom one, and the drawer every edge it touches; the insets come from UniversalProvider.',
    android:
      'The shell is `flex: 1` and Main is a ScrollView. The back button closes an open drawer. Safe areas are padded as on iOS.',
  },
  related: ['sidebar', 'drawer', 'navigation-bar', 'show-hide'],
})
