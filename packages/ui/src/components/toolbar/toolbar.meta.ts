import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Toolbar',
  slug: 'toolbar',
  category: 'layout',
  description:
    'A row or column of related controls, such as actions, filters or formatting, with optional leading, center and trailing regions.',
  status: 'stable',
  since: '0.13.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Toolbar'],
  files: [
    'components/toolbar/Toolbar.tsx',
    'components/toolbar/arrowKeys.ts',
    'components/toolbar/index.ts',
  ],
  keywords: [
    'toolbar',
    'action bar',
    'button bar',
    'app bar',
    'filters',
    'formatting',
    'bulk actions',
    'controls',
  ],
  usage: `import { Button, Toolbar } from '@advui/core'

<Toolbar aria-label="Project actions" variant="outline">
  <Button size="sm">New</Button>
  <Button size="sm" variant="outline">Edit</Button>
  <Toolbar.Separator />
  <Button size="sm" variant="outline">Delete</Button>
</Toolbar>`,
  parts: [
    {
      name: 'Toolbar',
      props: [
        {
          name: 'role',
          type: "'group' | 'toolbar'",
          options: ['group', 'toolbar'],
          default: "'group'",
          description:
            '`group`: a named set of controls, each its own Tab stop; right for bars with fields. `toolbar`: the WAI-ARIA toolbar, one Tab stop with the arrow keys moving between controls (web); for buttons, toggles and menus.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description:
            'Names the bar, e.g. "Formatting". Recommended; needed when a page has several.',
        },
        {
          name: 'aria-labelledby',
          type: 'string',
          description: 'The id of a visible heading that names the bar, in place of `aria-label`.',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: "'horizontal'",
          description:
            'A row or a column. Sets the arrow keys of `role="toolbar"`, the direction of groups and of separators. A column hugs its controls (`alignSelf="flex-start"`).',
        },
        {
          name: 'variant',
          type: "'default' | 'outline' | 'filled' | 'ghost'",
          options: ['default', 'outline', 'filled', 'ghost'],
          default: "'default'",
          description:
            'The container only: `default` the page background (opaque, for sticky bars), `outline` adds a border, `filled` a muted surface, `ghost` no fill, border or padding, for a bar inside a card or panel. Controls keep their own look.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description:
            'Gap, padding and minimum height (a control of the same size plus the padding). Controls keep their own `size`: set it on them too.',
        },
        {
          name: 'align',
          type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
          options: ['start', 'center', 'end', 'stretch', 'baseline'],
          default: "'center' in a row, 'stretch' in a column",
          responsive: true,
          description:
            'Where controls sit across the bar (the cross axis), in groups and regions too. A value or a map such as `{ base: "stretch", md: "center" }`.',
        },
        {
          name: 'distribute',
          type: "'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'",
          options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
          default: "'start'",
          responsive: true,
          description:
            'How free space is shared along the bar (the main axis). With `center` or `trailing`, that region takes the free space instead.',
        },
        {
          name: 'wrap',
          type: 'boolean',
          default: 'false',
          description:
            'Let controls wrap onto more lines when the bar is too narrow, in groups and regions too. Turn it on for bars that must fit phone widths.',
        },
        {
          name: 'leading',
          type: 'ReactNode',
          description:
            'Content at the start edge, such as a title or a back button. A string is shown as Text.',
        },
        {
          name: 'center',
          type: 'ReactNode',
          description:
            'Content that takes the free space between the others, centered in it: a title, a search field (give it `flex={1}`), a Toggle Group.',
        },
        {
          name: 'trailing',
          type: 'ReactNode',
          description:
            'Content kept at the end edge, such as the main actions. A fragment holds several.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`',
          description: 'Space between controls and between regions.',
        },
        {
          name: 'padding',
          type: 'SpaceTokens | number',
          token: 'space',
          default: 'from `size`, none for `ghost`',
          description: '`paddingHorizontal`, `paddingVertical` and the shorthands work too.',
        },
        {
          name: 'backgroundColor',
          type: 'ColorTokens',
          token: 'color',
          default: 'from `variant`',
          description: 'Overrides the variant surface.',
        },
        {
          name: 'borderColor',
          type: 'ColorTokens',
          token: 'color',
          default: "'border' (outline)",
          description: 'Overrides the outline color. Other variants show it with a `borderWidth`.',
        },
        {
          name: 'borderRadius',
          type: 'RadiusTokens | number',
          token: 'radius',
          default: "'lg'",
          description: 'Corner radius of the container.',
        },
      ],
      children: { accepts: 'any' },
    },
    {
      name: 'Toolbar.Group',
      description:
        'Related controls kept together, with a tighter gap than the toolbar. A `role="group"` that takes the toolbar orientation, alignment and wrapping. Any other style prop works too.',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the group, e.g. "History".',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          options: ['horizontal', 'vertical'],
          default: 'the toolbar orientation',
          description: 'Lay this group out the other way, such as a column of zoom buttons.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens | number',
          token: 'space',
          default: "from the toolbar's `size`",
          description: 'Space between the controls in the group.',
        },
      ],
      children: { accepts: 'any' },
      within: 'Toolbar',
    },
    {
      name: 'Toolbar.Separator',
      description:
        'A 1px line between groups, across the toolbar direction (vertical in a row). Built on Separator.',
      props: [
        {
          name: 'decorative',
          type: 'boolean',
          default: 'true',
          description:
            'Hidden from assistive technology. Set `false` for `role="separator"`, when the line separates meaningful sets.',
        },
      ],
      children: { accepts: 'none' },
      within: 'Toolbar',
    },
  ],
  playground: {
    component: 'Toolbar',
    staticProps: { 'aria-label': 'Actions' },
    controls: [
      { prop: 'role', type: 'select', options: ['group', 'toolbar'], default: 'group' },
      {
        prop: 'orientation',
        type: 'select',
        options: ['horizontal', 'vertical'],
        default: 'horizontal',
      },
      {
        prop: 'variant',
        type: 'select',
        options: ['default', 'outline', 'filled', 'ghost'],
        default: 'default',
      },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      {
        prop: 'align',
        type: 'select',
        options: ['', 'start', 'center', 'end', 'stretch'],
        default: '',
      },
      {
        prop: 'distribute',
        type: 'select',
        options: ['start', 'center', 'end', 'between'],
        default: 'start',
      },
      { prop: 'wrap', type: 'boolean', default: false },
      { prop: 'leading', type: 'boolean', default: false },
      { prop: 'center', type: 'boolean', default: false },
      { prop: 'trailing', type: 'boolean', default: false },
      { prop: 'separators', type: 'boolean', default: true },
      { prop: 'gap', type: 'text', default: '' },
      { prop: 'padding', type: 'text', default: '' },
      { prop: 'backgroundColor', type: 'text', default: '' },
      { prop: 'borderColor', type: 'text', default: '' },
      { prop: 'borderRadius', type: 'text', default: '' },
    ],
  },
  examples: [
    { name: 'basic', title: 'Action toolbar', description: 'Controls as children, in a row.' },
    {
      name: 'groups',
      title: 'Groups and separators',
      description:
        '`Toolbar.Group` keeps related actions together; `Toolbar.Separator` divides them.',
    },
    {
      name: 'regions',
      title: 'Search toolbar',
      description:
        '`leading`, `center` and `trailing`. The center takes the free space; the field fills it up to `maxWidth`.',
    },
    {
      name: 'data-table',
      title: 'Data table toolbar',
      description:
        'A title and count, then a filter field and actions at the end. `ghost` sits flush above a table; `wrap` moves the actions below on phones.',
    },
    {
      name: 'bulk-actions',
      title: 'Bulk actions',
      description: 'A filled bar for the selected rows. Text alone is as tall as a bar of buttons.',
    },
    {
      name: 'formatting',
      title: 'Formatting toolbar',
      description:
        '`role="toolbar"`: one Tab stop, and the arrow keys move across the Toggle Groups and buttons.',
    },
    {
      name: 'vertical',
      title: 'Vertical editor toolbar',
      description: 'A column of tools with tooltips to the side; Up and Down move between them.',
    },
    {
      name: 'variants',
      title: 'Variants',
      description: '`default`, `outline`, `filled` and `ghost` style the container only.',
    },
    {
      name: 'sizes',
      title: 'Sizes',
      description: 'The size sets gap, padding and height; the buttons are given the same size.',
    },
    {
      name: 'custom',
      title: 'Custom styling',
      description: 'A pill: style props for the background, border color, radius and padding.',
    },
    {
      name: 'wrap',
      title: 'Wrapping on narrow screens',
      description:
        'In a phone-width frame, `wrap` moves the field and the actions onto their own lines; the actions stay at the end edge.',
    },
  ],
  accessibility: [
    'By default a `group` named by `aria-label`: every control keeps its own Tab stop and its own name.',
    '`role="toolbar"` is the WAI-ARIA toolbar on web: one Tab stop (the control used last, else the first), and the arrow keys along the orientation, Home and End move between enabled controls, wrapping at the ends. It sets `aria-orientation`. Use it for buttons, toggles, Toggle Groups, checkboxes and menu triggers.',
    'In a `toolbar`, text fields, selects, sliders and spin buttons keep their own Tab stop and their arrow keys (the caret, the value); the arrow keys pass over them. With several fields, keep the default `group`.',
    'Keys a control uses first are left to it: an open menu (portalled content is ignored), or any handler that prevents the default. A Toggle Group inside a `toolbar` hands its arrow keys to the toolbar, so they move out of the group; Space or Enter chooses.',
    'Disabled controls are skipped by the arrow keys. Toolbar has no `disabled` of its own: disable controls one by one, or put fields in a disabled Form.',
    'Separators are decorative (hidden from assistive technology) unless `decorative={false}`. Groups are `role="group"`; name them when the name helps.',
    'Toolbar never clips its content, so focus rings stay visible; it sets no fixed height, so larger text grows it.',
  ],
  keyboard: [
    {
      keys: 'Tab',
      action:
        '`group`: moves through the controls one by one. `toolbar`: moves into the toolbar, to a field in it, and out.',
    },
    {
      keys: 'Arrow Right / Arrow Left',
      action: '`toolbar`, horizontal: the next or previous control (mirrored right-to-left).',
    },
    { keys: 'Arrow Down / Arrow Up', action: '`toolbar`, vertical: the next or previous control.' },
    { keys: 'Home / End', action: '`toolbar`: the first or last control.' },
  ],
  responsive:
    'Toolbar fills the width of a column and sizes to its content in a row. On narrow screens leading and center shrink first (a title wraps, a search field with `flex={1}` narrows); trailing keeps its size. On web, leading, trailing and a text center never shrink below their content, so they do not run into each other; a center holding a control that cannot shrink (a Toggle Group) needs `wrap`. Give bars that must fit phone widths `wrap`: controls and regions move onto new lines, a wrapped trailing region wraps its own controls, and it stays at the end edge (the left one in right-to-left layouts). `align` and `distribute` take breakpoint maps; for anything else use media props such as `$md={{ gap: "3" }}`. Toolbar never turns controls into a menu: show a Dropdown Menu for the overflow yourself (with Show / Hide).',
  tables: [
    {
      id: 'regions',
      title: 'Regions',
      description:
        'Each region given gets one box; a missing one adds nothing. Children go between leading and center.',
      columns: ['Given', 'Layout'],
      rows: [
        ['children only', 'The children, unwrapped, laid out by `distribute`.'],
        [
          '`leading` + `trailing`',
          'Leading at the start; trailing takes the free space and keeps its content at the end.',
        ],
        [
          '`leading` + `center` + `trailing`',
          'The center takes the free space and centers its content in it.',
        ],
        ['`center` + `trailing`', 'No empty start box: the center starts at the edge.'],
      ],
    },
  ],
  platformNotes: {
    web: 'A `div` with `role="group"` or `role="toolbar"`; the arrow keys are web only. Fields, sliders and nested toolbars are left alone, and so are keys from portalled content such as an open menu.',
    ios: 'The container is not one accessible element (no `accessible`), so VoiceOver reaches each control; `role` and `aria-label` go to the native view. There are no arrow keys.',
    android: 'Same as iOS, for TalkBack.',
  },
  related: ['button-group', 'toggle-group', 'icon-button', 'separator', 'stack', 'dropdown-menu'],
})
