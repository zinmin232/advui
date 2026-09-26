/** Pure data (safe for React Server Components and search indexing). */
export interface AppExampleMeta {
  slug: string
  title: string
  description: string
  /** Preferred frame in the docs; every example also runs on iOS/Android. */
  device: 'desktop' | 'mobile'
  components: string[]
}

export const appExamples: AppExampleMeta[] = [
  {
    slug: 'login',
    title: 'Login page',
    description: 'Email + password sign in with validation, loading state and SSO option.',
    device: 'desktop',
    components: ['Card', 'Input', 'Label', 'Checkbox', 'Button', 'Separator', 'Toast'],
  },
  {
    slug: 'dashboard',
    title: 'Dashboard',
    description: 'KPIs, a revenue chart, recent sales and quarterly goals.',
    device: 'desktop',
    components: ['Grid', 'Card', 'Tabs', 'Avatar', 'Badge', 'Progress'],
  },
  {
    slug: 'admin',
    title: 'Admin dashboard',
    description:
      'Team management: search, roles, invite dialog, undoable removal and security policies.',
    device: 'desktop',
    components: ['Tabs', 'Dialog', 'Select', 'Tooltip', 'IconButton', 'Switch', 'Toast'],
  },
  {
    slug: 'settings',
    title: 'Profile settings',
    description: 'Profile form, notification preferences and a confirmed destructive action.',
    device: 'desktop',
    components: ['Card', 'Grid', 'Select', 'Textarea', 'RadioGroup', 'Switch', 'Dialog', 'Alert'],
  },
  {
    slug: 'product',
    title: 'E-commerce product page',
    description: 'Image gallery, size picker, quantity stepper, add to cart and reviews.',
    device: 'desktop',
    components: ['RadioGroup', 'IconButton', 'Button', 'Tabs', 'Badge', 'Card'],
  },
  {
    slug: 'mobile-home',
    title: 'Mobile home screen',
    description: 'Greeting, search, promo card, quick actions and recent orders.',
    device: 'mobile',
    components: ['Avatar', 'Input', 'Card', 'Grid', 'Badge', 'IconButton'],
  },
  {
    slug: 'mobile-settings',
    title: 'Mobile settings screen',
    description: 'Grouped settings list with switches and navigation rows.',
    device: 'mobile',
    components: ['Card', 'Switch', 'Separator', 'Avatar', 'Badge'],
  },
]
