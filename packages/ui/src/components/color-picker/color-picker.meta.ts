import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Color Picker',
  slug: 'color-picker',
  category: 'forms',
  description:
    'Pick a color by dragging over saturation and brightness, sliding hue and opacity, typing a hex or pressing a swatch, in a field that opens a popover or inline.',
  status: 'stable',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ColorPicker'],
  files: [
    'components/color-picker/ColorPicker.tsx',
    'components/color-picker/ColorArea.tsx',
    'components/color-picker/ChannelSlider.tsx',
    'components/color-picker/Swatch.tsx',
    'components/color-picker/Checkerboard.tsx',
    'components/color-picker/Checkerboard.native.tsx',
    'components/color-picker/useColorDrag.ts',
    'components/color-picker/shared.ts',
    'components/color-picker/index.ts',
  ],
  keywords: [
    'color',
    'colour',
    'color input',
    'swatch',
    'palette',
    'hex',
    'hue',
    'eyedropper',
    'rgb',
    'hsv',
  ],
  usage: `import { ColorPicker, Field } from '@advui/core'

<Field label="Brand color">
  <ColorPicker value={color} onValueChange={setColor} />
</Field>

<ColorPicker inline alpha aria-label="Tint" value={tint} onValueChange={setTint} />`,
  parts: [
    {
      name: 'ColorPicker',
      description:
        'A field-shaped button that opens the picker in a popover, or the picker itself with `inline`. Style props go to the button, or to the inline picker.',
      props: [
        {
          name: 'value',
          type: 'string',
          description:
            'The color, when you control it: hex (`#3b82f6`, `#3b82f680`), `rgb()` or `hsl()`.',
        },
        {
          name: 'defaultValue',
          type: 'string',
          default: "'#000000'",
          description: 'Starting `value` when uncontrolled.',
        },
        {
          name: 'onValueChange',
          type: '(value: string) => void',
          description:
            'Called as the color changes, also while dragging, with a lowercase `#rrggbb`, or `#rrggbbaa` when `alpha` is on and the color is translucent.',
        },
        {
          name: 'onValueCommit',
          type: '(value: string) => void',
          description:
            'Called once a drag ends, after a key or a swatch press, and when typed text is confirmed with Enter or by leaving the field. Save the color here.',
        },
        {
          name: 'inline',
          type: 'boolean',
          default: 'false',
          description:
            'Shows the picker in the page (256px wide, up to the container) instead of a field that opens it.',
        },
        {
          name: 'alpha',
          type: 'boolean',
          default: 'false',
          description:
            'Shows the opacity slider over a transparency grid, and lets the value be translucent. Without it, colors come back opaque.',
        },
        {
          name: 'swatches',
          type: 'Array<string | { value: string; label: string }>',
          description:
            'Preset colors below the picker. Give them names (`{ value, label }`) for screen readers; a plain string is read as the color. The swatch that matches the color shows a check mark.',
        },
        {
          name: 'showInput',
          type: 'boolean',
          default: 'true',
          description:
            'Shows the text field, which takes hex with or without `#`, `rgb()` or `hsl()`. A whole hex shows as it is typed; anything else on Enter or blur, and text that is not a color is undone.',
        },
        {
          name: 'eyeDropper',
          type: 'boolean',
          default: 'true',
          platforms: ['web'],
          description:
            'Shows a button that picks a color from anywhere on the screen, in browsers with the EyeDropper API (Chrome, Edge). Others show no button.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          options: ['sm', 'md', 'lg'],
          default: "'md'",
          description: 'Height of the field, as with Input. Not used with `inline`.',
        },
        {
          name: 'open',
          type: 'boolean',
          description: 'Whether the popover is open, when you control it.',
        },
        {
          name: 'defaultOpen',
          type: 'boolean',
          default: 'false',
          description: 'Starting `open` when uncontrolled.',
        },
        {
          name: 'onOpenChange',
          type: '(open: boolean) => void',
          description: 'Called when the popover opens or closes.',
        },
        {
          name: 'title',
          type: 'string',
          default: "'Choose a color'",
          description: 'Title of the popover, which names it for screen readers.',
        },
        {
          name: 'labels',
          type: 'Partial<ColorPickerLabels>',
          description:
            'Names and value texts to translate: `area`, `areaRole`, `areaValue(saturation, brightness)`, `saturate`, `desaturate`, `hue`, `hueValue(degrees)`, `alpha`, `input`, `eyeDropper` and `swatches`.',
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description:
            'Dims the picker and ignores drags, keys and presses. Also on inside a disabled Field or Form.',
        },
        {
          name: 'invalid',
          type: 'boolean',
          default: 'false',
          description:
            'Error border on the field, or on the text field when `inline`. On inside a Field with an `error`.',
        },
        {
          name: 'name',
          type: 'string',
          platforms: ['web'],
          description: 'Field name for a native form: the color submits under it.',
        },
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the picker. Inside a Field, the field’s label names it instead.',
        },
      ],
      children: { accepts: 'none' },
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Basic',
      description: 'A field in a Field: it shows the color and opens the picker in a popover.',
    },
    {
      name: 'inline',
      title: 'Inline',
      description:
        'The picker in the page. `onValueChange` follows the drag; `onValueCommit` fires once it ends.',
    },
    {
      name: 'alpha',
      title: 'Opacity',
      description: 'With `alpha`, an opacity slider, and a translucent color as `#rrggbbaa`.',
    },
    {
      name: 'swatches',
      title: 'Swatches',
      description: 'Named preset colors; the one that matches has a check mark.',
    },
  ],
  playground: {
    component: 'ColorPicker',
    staticProps: { 'aria-label': 'Playground color', defaultValue: '#3b82f6' },
    controls: [
      { prop: 'inline', type: 'boolean', default: false },
      { prop: 'alpha', type: 'boolean', default: false },
      { prop: 'showInput', type: 'boolean', default: true },
      { prop: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'disabled', type: 'boolean', default: false },
    ],
  },
  accessibility: [
    'The field is a button named by its Field label (or `aria-label`) and described by the color (`#3b82f6`); it opens a dialog named by `title`. Inline, the picker is a `role="group"` named the same way.',
    'The saturation and brightness area is one `role="slider"` with `aria-roledescription="2D slider"` and a value text such as "Saturation 72%, brightness 40%". Left and right change the saturation, up and down the brightness.',
    'Hue and opacity are sliders with value texts ("200°", "50%"). The text field is named "Hex color", and the swatches are toggle buttons (`aria-pressed`) in a group named "Swatches". `labels` translates every name and value text.',
    'Every color can be set without dragging: by keys, by typing it, or with a swatch. The picked swatch has a check mark, so it does not rely on color alone.',
    'Thumbs are a white ring outlined in black, so they show on light and dark colors alike.',
    'On iOS and Android the area and sliders are adjustable: swipes change the brightness, hue or opacity by 10, and the actions menu has "More saturated" and "Less saturated". Inline, each control reads the Field’s label and help as its hint. The sliders reach a 44pt touch target with `hitSlop`.',
  ],
  keyboard: [
    {
      keys: 'ArrowRight / ArrowLeft',
      action: 'Area: saturation ±1%. Sliders: ±1 (degree or percent).',
    },
    { keys: 'ArrowUp / ArrowDown', action: 'Area: brightness ±1%. Sliders: ±1.' },
    { keys: 'Shift + Arrow', action: 'Steps of 10.' },
    { keys: 'PageUp / PageDown', action: 'Area: brightness ±10%. Sliders: ±10.' },
    { keys: 'Home / End', action: 'Area: no or full saturation. Sliders: the start or the end.' },
    { keys: 'Enter', action: 'Text field: applies the typed color.' },
    { keys: 'Escape', action: 'Closes the popover.' },
  ],
  platformNotes: {
    web: 'Dragging uses pointer capture, so it continues outside the area, and `touch-action: none` keeps a touch drag from scrolling the page. The eyedropper button shows only where `window.EyeDropper` exists. With `name`, a hidden input submits the color. Phones get a bottom sheet instead of the popover.',
    ios: 'The picker opens in a bottom sheet. Dragging on the area or a slider keeps the touch from the sheet and from scroll views. Gradients use React Native’s `experimental_backgroundImage` (New Architecture) and the transparency grid react-native-svg.',
    android: 'Same as iOS. The back button closes the sheet.',
  },
  related: ['input', 'slider', 'popover', 'field', 'date-picker'],
})
