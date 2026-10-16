import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: 'Carousel',
  slug: 'carousel',
  category: 'media',
  description:
    'A row of slides shown one or a few at a time, moved by swipes, previous and next buttons or dots, with optional autoplay.',
  status: 'beta',
  since: '0.14.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['Carousel', 'CarouselItem', 'CarouselLabels'],
  files: [
    'components/carousel/Carousel.tsx',
    'components/carousel/CarouselTrack.tsx',
    'components/carousel/CarouselTrack.native.tsx',
    'components/carousel/shared.ts',
    'components/carousel/index.ts',
  ],
  keywords: ['carousel', 'slider', 'slideshow', 'swiper', 'slides', 'banner', 'onboarding'],
  usage: `import { Card, Carousel } from '@advui/core'

<Carousel aria-label="Featured articles" slidesPerView={{ base: 1, md: 3 }}>
  {articles.map((article) => (
    <Card key={article.id} flexGrow={1}>…</Card>
  ))}
</Carousel>`,
  parts: [
    {
      name: 'Carousel',
      description:
        'Each child is a slide; children that are not `Carousel.Item` are wrapped in one. Style and layout props go to the outer box.',
      props: [
        {
          name: 'aria-label',
          type: 'string',
          description: 'Names the carousel, e.g. "Featured articles". Recommended.',
        },
        {
          name: 'index',
          type: 'number',
          description: 'The slide first in view, when you control it.',
        },
        {
          name: 'defaultIndex',
          type: 'number',
          default: '0',
          min: 0,
          step: 1,
          description: 'Starting `index` when uncontrolled.',
        },
        {
          name: 'onIndexChange',
          type: '(index: number) => void',
          description: 'Called with the new `index` after a button, dot, key, swipe or autoplay.',
        },
        {
          name: 'slidesPerView',
          type: 'number',
          responsive: true,
          default: '1',
          min: 1,
          step: 0.1,
          description:
            'Slides in view at once, mobile first. A fraction such as 1.2 shows part of the next slide.',
        },
        {
          name: 'gap',
          type: 'SpaceTokens',
          token: 'space',
          default: "'$4'",
          description: 'Space between slides.',
        },
        {
          name: 'loop',
          type: 'boolean',
          default: 'false',
          description:
            'Next on the last slide goes back to the first, and Previous on the first goes to the last.',
        },
        {
          name: 'autoplay',
          type: 'boolean | number',
          default: 'false',
          description:
            'Moves to the next slide on its own, back to the first after the last: `true` every 5 seconds, or a delay in milliseconds. Adds a pause button.',
        },
        {
          name: 'showArrows',
          type: 'boolean',
          default: 'true',
          description: 'Previous and next buttons, disabled at the ends unless `loop`.',
        },
        {
          name: 'showDots',
          type: 'boolean',
          default: 'true',
          description: 'A dot for each slide that can come first, which jumps to it.',
        },
        {
          name: 'labels',
          type: 'Partial<CarouselLabels>',
          description:
            'Button names (`previous`, `next`, `goTo(index)`, `play`, `pause`), the announcement (`position(index, count)`) and the web role descriptions and slide names (`carousel`, `slide`, `slideName(index, count)`), for translation.',
        },
      ],
      children: { accepts: 'any', min: 1 },
    },
    {
      name: 'Carousel.Item',
      description:
        'One slide, for slide props such as padding or a background. Carousel sets its width; slides in a row share the tallest one’s height.',
      props: [],
      children: { accepts: 'any' },
      parents: ['Carousel'],
    },
  ],
  examples: [
    {
      name: 'basic',
      title: 'Basic',
      description: 'One card at a time; swipe, use the arrows or pick a dot.',
    },
    {
      name: 'several-per-view',
      title: 'Several per view',
      description: 'A part of the next card on phones, two from `sm` and three from `md`.',
    },
    {
      name: 'images',
      title: 'Photos',
      description: 'Images with captions; `loop` goes from the last photo back to the first.',
    },
    {
      name: 'autoplay',
      title: 'Autoplay',
      description:
        'Moves every 6 seconds and waits while the pointer or focus is on it. It starts paused for users who ask for less motion.',
    },
    {
      name: 'controlled',
      title: 'Controlled',
      description: 'An onboarding tour whose own buttons set `index`; the dots stay in step.',
    },
  ],
  accessibility: [
    'On web the carousel is a region named by `aria-label` and described as a “carousel”; each slide is a group named “2 of 5” and described as a “slide” (WAI-ARIA APG carousel pattern).',
    'Previous, next and the dots are buttons with names (“Next slide”, “Go to slide 3”); the current dot has `aria-current` on web and the selected state on iOS and Android.',
    'The controls come before the slides in focus and reading order, so the pause button is met before the slides move; they show under the slides.',
    'After a button, dot, key or swipe the new position (“Slide 3 of 5”) is announced: through a polite live region on web, with `AccessibilityInfo.announceForAccessibility` on iOS and Android. Autoplay moves are not announced.',
    'Autoplay waits while the pointer is over the carousel, focus is inside it or a finger is on it, and starts paused when the user asks for less motion. The pause button stops it (WCAG 2.2.2).',
    'Slides out of view stay in the tree, so screen readers can read them; on web, tabbing to a link in one scrolls it into view and updates the dots.',
  ],
  keyboard: [
    { keys: 'Tab', action: 'Moves through the controls, then the slides.' },
    {
      keys: 'Arrow Left / Arrow Right',
      action: 'Previous or next slide, while the slide area has focus (web).',
    },
    { keys: 'Home / End', action: 'First or last slide, while the slide area has focus (web).' },
    { keys: 'Enter / Space', action: 'Presses the focused button or dot.' },
  ],
  responsive:
    '`slidesPerView` takes a mobile-first map; on web the slide widths are CSS media queries, so the server renders them right. The number of dots follows the current breakpoint after hydration.',
  platformNotes: {
    web: 'CSS scroll snap: touch, trackpads and the scroll wheel move it, one slide per swipe. A mouse drag does not; the arrows and dots do. The scrollbar is hidden.',
    ios: 'A horizontal ScrollView that snaps to each slide, one per swipe. Slide widths come from its measured width, so they follow rotation.',
    android:
      'Same as iOS. It swipes sideways inside a vertically scrolling screen (`nestedScrollEnabled`).',
  },
  related: ['image-gallery', 'scroll-area', 'card', 'image'],
})
