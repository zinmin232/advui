import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Image',
  slug: 'image',
  category: 'media',
  description: 'A picture in a box of a set size or ratio, with a placeholder and a fallback.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Image', 'ImageProps'],
  files: ['components/image/Image.tsx', 'components/image/index.ts'],
  keywords: ['image', 'img', 'picture', 'photo', 'media', 'fallback', 'placeholder', 'object-fit'],
  usage: `import { Image } from '@advui/core'

<Image src={photo.url} alt="A desert road between red rock canyons" ratio={16 / 9} borderRadius="$lg" />`,
  parts: [
    {
      name: 'Image',
      description: 'Also takes View style props for the box (`width`, `height`, `borderRadius`…).',
      props: [
        {
          name: 'src',
          type: 'string | number',
          required: true,
          description: 'URL, or the result of `require()` for a bundled image on native.',
        },
        {
          name: 'alt',
          type: 'string',
          required: true,
          description: 'What the image shows. `""` for decoration.',
        },
        {
          name: 'ratio',
          type: 'number',
          description: 'Width divided by height. Without it, give the image a `height`.',
        },
        {
          name: 'fit',
          type: "'cover' | 'contain' | 'fill' | 'none' | 'scale-down'",
          default: "'cover'",
          description: 'How the picture fills the box (`object-fit` / `resizeMode`).',
        },
        {
          name: 'fallback',
          type: 'ReactNode',
          default: 'image icon',
          description: 'Shown when the image fails to load.',
        },
        {
          name: 'loading',
          type: "'lazy' | 'eager'",
          description: 'Web only: `lazy` waits until the image nears the viewport.',
        },
        { name: 'onLoad', type: '() => void', description: 'The image loaded.' },
        { name: 'onError', type: '() => void', description: 'The image failed to load.' },
      ],
    },
  ],
  examples: [
    { name: 'basic', title: 'Basic' },
    { name: 'fit', title: 'Cover and contain' },
    {
      name: 'fallback',
      title: 'Fallback',
      description: 'A missing file shows the default icon, or your own content.',
    },
  ],
  accessibility: [
    '`alt` is required. It names the image (`img` role) on every platform; pass `alt=""` when the image is decoration or its content is already in nearby text, and it is hidden from screen readers.',
    'When the image fails, the fallback keeps the `img` role and the `alt` name, so the page reads the same.',
    'The placeholder and default fallback icon are decorative.',
  ],
  responsive:
    'With `ratio`, the height follows the width, so `width="100%"` scales with the layout. Without it, set both `width` and `height`.',
  platformNotes: {
    web: 'Renders an `<img>` with `object-fit`. A load or error that happened before hydration is read from the element once mounted.',
    ios: 'Uses React Native’s `Image`; `fit` maps to `resizeMode`. Remote images need a size from the box (`ratio` or `height`).',
    android: 'Same as iOS. Use HTTPS URLs.',
  },
  related: ['aspect-ratio', 'avatar', 'skeleton'],
})
