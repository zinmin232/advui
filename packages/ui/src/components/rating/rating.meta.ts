import { defineMeta } from '../../meta/types.ts'

export default defineMeta({
  name: 'Rating',
  slug: 'rating',
  category: 'forms',
  description:
    'A row of stars, or any icon, to give a score with a press or the keyboard, or to show one read-only, with half and part-filled icons.',
  status: 'stable',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Rating'],
  files: ['components/rating/Rating.tsx', 'components/rating/index.ts'],
  keywords: ['stars', 'star rating', 'score', 'review', 'feedback', 'hearts', 'rate'],
  usage: `import { Field, Rating } from '@advui/core'

<Field label="How was your stay?">
  <Rating value={stars} onValueChange={setStars} allowHalf />
</Field>

<Rating aria-label="Average rating" readOnly value={4.3} size="sm" />`,
  parts: [
    {
      name: 'Rating',
      description: 'A row of icons in a View; style props go to the row.',
      props: [
        {
          name: 'value',
          type: 'number',
          description: 'The rating, from 0 (none) to `count`, when you control it.',
        },
        {
          name: 'defaultValue',
          type: 'number',
          default: '0',
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: number) => void',
          description: 'Called when the user picks a rating with a press, a key or a swipe.',
        },
        {
          name: 'count',
          type: 'number',
          default: '5',
          min: 1,
          max: 10,
          step: 1,
          description: 'How many icons, and the highest rating.',
        },
        {
          name: 'allowHalf',
          type: 'boolean',
          default: 'false',
          description:
            'Lets the user pick half ratings (3.5): the start half of an icon picks the half, the end half the whole. Keys step by 0.5.',
        },
        {
          name: 'readOnly',
          type: 'boolean',
          default: 'false',
          description:
            'Shows the rating without letting anyone change it, as an image named by its value. Any fraction shows as a part-filled icon: 4.3 fills 30% of the fifth.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Icons of 16, 24 or 32px.',
        },
        {
          name: 'icon',
          type: 'IconComponent',
          default: 'StarIcon',
          description:
            'The icon to repeat: any icon from `@advui/icons` (`HeartIcon`), one made with `createIcon`, or a Lucide icon. It must take `fill`.',
        },
        {
          name: 'color',
          type: 'ColorTokens',
          token: 'color',
          default: "'warning', outlined in 'warningSoftForeground'",
          description:
            'Fill and outline of the chosen icons. The default amber has a darker outline so the icons stand out on light backgrounds.',
        },
        {
          name: 'emptyColor',
          type: 'ColorTokens',
          token: 'color',
          default: "'mutedForeground'",
          description: 'Outline of the icons that are not chosen. `error` while invalid.',
        },
        {
          name: 'getValueText',
          type: '(value: number) => string',
          default: '"3 of 5"',
          description:
            'The value screen readers read, and a read-only rating’s name. Translate it here.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Dims the icons and ignores presses and keys. Also on inside a disabled Field or Form.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description:
            'Error outline on the empty icons and `aria-invalid`. On inside a Field with an `error`.',
        },
        {
          name: 'name',
          type: 'string',
          platforms: ['web'],
          description: 'Field name for a native form: the rating submits its value under it.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description:
            'Names the rating. Inside a Field, the field’s label names it instead. A read-only rating reads it before the value.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Basic',
      description: 'A controlled rating with a word for each score beside it.',
    },
    {
      name: 'half',
      title: 'Half ratings and sizes',
      description:
        'With `allowHalf`, each half of an icon is its own value. Small, medium and large.',
    },
    {
      name: 'read-only',
      title: 'Read-only score',
      description: 'A product’s average beside its review count; 4.3 fills part of the fifth star.',
    },
    {
      name: 'field',
      title: 'In a Field',
      description:
        'The field names the rating, shows the error until one is picked, and submits it as `stay`.',
    },
    {
      name: 'custom-icon',
      title: 'Other icons and counts',
      description: 'Hearts in the primary color, and a ten-point scale.',
    },
  ],
  playground: {
    component: 'Rating',
    staticProps: { 'aria-label': 'Playground rating', defaultValue: 3 },
    controls: [
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'count', type: 'number', default: 5, min: 1, max: 10, step: 1 },
      { prop: 'allowHalf', type: 'boolean', default: false },
      { prop: 'readOnly', type: 'boolean', default: false },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'An interactive rating is one `role="slider"` from 0 to `count`, as in the WAI-ARIA rating slider example, with `aria-valuetext` such as "3 of 5" (`getValueText`). The icons inside are hidden from assistive technology.',
    'Named by `aria-label` or, inside a Field, by the field’s label (`aria-labelledby`); the field’s help and error text describe it. A slider has no required state, so say what is required in the help or error text.',
    '`readOnly` makes it `role="img"`, named by its label and value ("Average rating: 4.3 of 5"), and takes it out of the Tab order.',
    'The chosen icons are filled, not only colored, so the score does not rely on color alone. The default empty outline (`mutedForeground`) has at least 3:1 contrast on the background in every preset.',
    'On iOS and Android each icon reaches a 44pt touch target with `hitSlop`.',
  ],
  keyboard: [
    { keys: 'ArrowRight / ArrowUp', action: 'One step higher (half a step with `allowHalf`).' },
    { keys: 'ArrowLeft / ArrowDown', action: 'One step lower. Left and right swap in RTL.' },
    { keys: 'Home', action: 'Clears the rating (0).' },
    { keys: 'End', action: 'Picks the top score.' },
  ],
  platformNotes: {
    web: 'A `div` with `role="slider"` and `tabindex="0"`. Hovering an icon previews its value until the pointer leaves. With `name`, a hidden input submits the value.',
    ios: 'An adjustable element: VoiceOver users swipe up or down to change it, and hear the value text. Tap an icon (or its half) to pick it.',
    android:
      'An adjustable element: TalkBack users change it with its swipe adjustments, and hear the value text. Tap an icon (or its half) to pick it.',
  },
  related: ['slider', 'radio-group', 'field', 'toggle-group'],
})
