import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Image Gallery',
  slug: 'image-gallery',
  category: 'media',
  description: 'A grid of thumbnails that open a viewer with previous and next.',
  status: 'beta',
  since: '0.6.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['ImageGallery', 'GalleryImage', 'ImageGalleryProps', 'ImageGalleryLabels'],
  files: ['components/image-gallery/ImageGallery.tsx', 'components/image-gallery/index.ts'],
  keywords: ['gallery', 'lightbox', 'photos', 'images', 'carousel', 'viewer', 'thumbnails'],
  usage: `import { ImageGallery } from '@advui/core'

<ImageGallery
  images={[{ src: photo.url, thumbnail: photo.thumbUrl, alt: 'Clinic entrance', caption: 'Opened in June' }]}
/>`,
  parts: [
    {
      name: 'ImageGallery',
      props: [
        {
          name: 'images',
          type: 'GalleryImage[]',
          required: true,
          description: '`{ src, alt, caption?, thumbnail? }`. `alt` is required.',
        },
        {
          name: 'columns',
          type: 'number | { base, sm, md… }',
          default: '{ base: 2, sm: 3 }',
          description: 'Thumbnails per row, mobile first.',
        },
        {
          name: 'ratio',
          type: 'number',
          default: '1',
          description: 'Thumbnail shape (width / height).',
        },
        {
          name: 'index / defaultIndex / onIndexChange',
          type: 'number | null',
          description: 'The image open in the viewer; `null` when closed.',
        },
        {
          name: 'labels',
          type: 'Partial<ImageGalleryLabels>',
          description: 'Button names and "3 of 12", for translation.',
        },
      ],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: [
    'Each thumbnail is a button named "View {alt}"; the thumbnail picture inside is decorative.',
    'The viewer is a modal dialog titled with the image’s `alt`; the image keeps its `alt`, the caption describes the dialog, and "2 of 6" is a polite live region.',
    'Previous and next are named buttons, disabled at the ends; focus returns to the thumbnail on close.',
  ],
  keyboard: [
    { keys: 'Enter / Space', action: 'Opens the focused thumbnail.' },
    { keys: 'Arrow Left / Arrow Right', action: 'Previous or next image (web).' },
    { keys: 'Escape', action: 'Closes the viewer.' },
  ],
  responsive: 'The grid follows `columns`; the viewer fits the screen and keeps the image’s shape.',
  platformNotes: {
    web: 'Pass smaller `thumbnail` URLs so the grid loads fast.',
    ios: 'Swipe is not wired; use the previous and next buttons.',
    android: 'Same as iOS; the back button closes the viewer.',
  },
  related: ['image', 'dialog', 'aspect-ratio'],
})
