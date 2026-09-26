// Hand-written documentation pages (rendered from src/app/docs/[slug]).
// Component pages are generated from metadata instead.
export interface GuideMeta {
  slug: string
  title: string
  description: string
  section: 'getting-started' | 'foundations'
  keywords?: string[]
}

export const guides: GuideMeta[] = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'What Adv UI is, why it is built on Tamagui and how it is organised.',
    section: 'getting-started',
    keywords: ['overview', 'about', 'tamagui'],
  },
  {
    slug: 'installation',
    title: 'Installation',
    description: 'Add Adv UI to a Next.js, Expo or React Native app.',
    section: 'getting-started',
    keywords: ['setup', 'install', 'next.js', 'expo', 'getting started'],
  },
  {
    slug: 'cli',
    title: 'CLI',
    description: 'Copy component source into your project with `npx adv-ui add`.',
    section: 'getting-started',
    keywords: ['command line', 'registry', 'shadcn', 'add', 'init'],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    description: 'How components handle roles, focus, keyboard, contrast and reduced motion.',
    section: 'getting-started',
    keywords: ['a11y', 'screen reader', 'keyboard', 'wcag', 'aria'],
  },
  {
    slug: 'platforms',
    title: 'Platforms',
    description: 'How the same components behave on web, iOS and Android.',
    section: 'getting-started',
    keywords: ['react native', 'ios', 'android', 'web', 'differences'],
  },
  {
    slug: 'theme',
    title: 'Theme',
    description: 'Presets, brand colors, radius and font scale — all from one config.',
    section: 'foundations',
    keywords: ['theming', 'dark mode', 'customize', 'config', 'tokens'],
  },
  {
    slug: 'colors',
    title: 'Colors',
    description: 'Semantic color tokens and how they adapt to light and dark mode.',
    section: 'foundations',
    keywords: ['palette', 'tokens', 'contrast', 'primary'],
  },
  {
    slug: 'typography',
    title: 'Type scale',
    description: 'The type scale and font tokens.',
    section: 'foundations',
    keywords: ['font', 'text', 'type scale'],
  },
  {
    slug: 'spacing',
    title: 'Spacing & Layout tokens',
    description: 'Space, size, radius, z-index, shadows and breakpoints.',
    section: 'foundations',
    keywords: ['space', 'size', 'radius', 'breakpoints', 'z-index', 'shadow'],
  },
  {
    slug: 'icons',
    title: 'Icons',
    description: 'The icon abstraction and the built-in Lucide-based set.',
    section: 'foundations',
    keywords: ['lucide', 'svg', 'icon'],
  },
]

export const getGuide = (slug: string) => guides.find((guide) => guide.slug === slug)
