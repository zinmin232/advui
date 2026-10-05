import { type PropDoc, defineMeta } from '../../meta/types'

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

const rangeProps = (verb: string): PropDoc[] => [
  {
    name: 'above',
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'",
    options: breakpoints,
    description: `${verb} from this breakpoint up (width ≥ the breakpoint). Give \`above\`, \`below\` or both.`,
  },
  {
    name: 'below',
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'",
    options: breakpoints,
    description: `${verb} below this breakpoint (width < the breakpoint). With \`above\`, it must be larger.`,
  },
]

export default defineMeta({
  name: 'Show / Hide',
  slug: 'show-hide',
  category: 'layout',
  description:
    'Show or hide content by screen width, with CSS on web (no flash during SSR), plus useBreakpoint and useBreakpointValue.',
  status: 'beta',
  since: '0.10.0',
  platforms: ['web', 'ios', 'android'],
  exports: [
    'Show',
    'Hide',
    'ShowProps',
    'HideProps',
    'BreakpointRange',
    'useBreakpoint',
    'useBreakpointValue',
  ],
  files: [
    'components/show-hide/ShowHide.tsx',
    'components/show-hide/ShowHide.native.tsx',
    'components/show-hide/range.ts',
    'components/show-hide/index.ts',
    'hooks/useBreakpoint.ts',
  ],
  keywords: ['responsive', 'breakpoint', 'media query', 'hidden', 'visible', 'mobile', 'desktop'],
  usage: `import { Hide, Show, useBreakpointValue } from '@advui/core'

<Show above="md"><DesktopNav /></Show>        // width ≥ md
<Show below="md"><MenuButton /></Show>        // width < md
<Show above="sm" below="lg">…</Show>          // sm ≤ width < lg
<Hide below="sm">…</Hide>

const rows = useBreakpointValue({ base: 3, md: 10 })`,
  parts: [
    {
      name: 'Show',
      description:
        'Renders its children only while the window is in the range. On web the wrapper is `display: contents`, so it does not change the layout.',
      props: rangeProps('Shown'),
      children: { accepts: 'any' },
    },
    {
      name: 'Hide',
      description:
        'The opposite of Show: renders its children except while the window is in the range.',
      props: rangeProps('Hidden'),
      children: { accepts: 'any' },
    },
    {
      name: 'useBreakpoint()',
      kind: 'hook',
      description:
        "The largest breakpoint the window matches: `'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'` (`'base'` below 460px). It re-renders when that changes.",
      props: [],
    },
    {
      name: 'useBreakpointValue(value)',
      kind: 'hook',
      description:
        'The value of a responsive map at the current breakpoint, with the same mobile-first cascade as the layout props: `useBreakpointValue({ base: 3, md: 10 })` is 3 below md and 10 from md. `undefined` below the first breakpoint of a map without `base`.',
      props: [],
    },
  ],
  examples: [
    {
      name: 'navigation',
      title: 'Navigation',
      description:
        'Links from md and a menu button below it; search is hidden on the smallest phones.',
    },
    {
      name: 'breakpoint-value',
      title: 'useBreakpoint and useBreakpointValue',
      description:
        'How many items to preview at each width. The grid itself uses responsive props.',
    },
  ],
  accessibility: [
    'Hidden content is hidden from screen readers too: `display: none` on web, not rendered on iOS and Android.',
    'Show the same content in another form at each width (links or a menu), so nobody loses access to it.',
  ],
  responsive:
    'Breakpoints are min-widths from `@advui/theme`: xs 460, sm 640, md 768, lg 1024, xl 1280, xxl 1536. `above="md"` is width ≥ 768; `below="md"` is width < 768. The hooks see a phone (`xs`) on the first server render and correct themselves after hydration, so lay pages out with Show / Hide or responsive props, which are CSS on web, and keep the hooks for behavior.',
  platformNotes: {
    web: 'CSS media queries hide the content, so the server renders the right thing at every width, with no flash and no hydration mismatch. Hidden children stay mounted (their state survives a resize).',
    ios: 'Reads the window size with `useMedia()` and renders nothing while hidden: hidden children are unmounted, so their state resets when they come back.',
    android:
      'Reads the window size with `useMedia()` and renders nothing while hidden: hidden children are unmounted, so their state resets when they come back.',
  },
  related: ['stack', 'grid', 'section'],
})
