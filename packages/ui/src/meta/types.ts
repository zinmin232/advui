/**
 * Component metadata schema. Every `*.meta.ts` file exports one `ComponentMeta`.
 * Metadata is plain serializable data (no React imports) so it can be read by
 * React Server Components, the search index, the registry builder and the CLI.
 */

export type ComponentStatus = 'stable' | 'beta' | 'experimental' | 'deprecated' | 'planned'
export type Platform = 'web' | 'ios' | 'android'

export type CategoryId =
  | 'foundations'
  | 'buttons'
  | 'forms'
  | 'layout'
  | 'navigation'
  | 'feedback'
  | 'overlay'
  | 'data-display'
  | 'media'
  | 'advanced'
  | 'charts'

export interface PropDoc {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}

export interface PartDoc {
  /** Component or sub-component name, e.g. `Card.Header`. */
  name: string
  description?: string
  props: PropDoc[]
}

export interface ExampleMeta {
  /** File name in `examples/` without extension; also the key in the examples map. */
  name: string
  title: string
  description?: string
}

export type PlaygroundControl =
  | { prop: string; type: 'select'; options: string[]; default: string }
  | { prop: string; type: 'boolean'; default: boolean }
  | { prop: string; type: 'text'; default: string }
  | { prop: string; type: 'number'; default: number; min?: number; max?: number; step?: number }

export interface PlaygroundSpec {
  /** Export name from `@advui/core`. */
  component: string
  controls: PlaygroundControl[]
  /** Text rendered as children (omit for void components). */
  children?: string
  /** Extra props always passed (e.g. an `aria-label`). */
  staticProps?: Record<string, string | number | boolean>
}

export interface KeyboardDoc {
  keys: string
  action: string
}

export interface ComponentMeta {
  name: string
  slug: string
  category: CategoryId
  description: string
  status: ComponentStatus
  /** First version the component shipped in. */
  since: string
  platforms: Platform[]
  /** Public exports this page documents. */
  exports: string[]
  /** Source files relative to `packages/ui/src` (drives the registry / CLI). */
  files: string[]
  keywords?: string[]
  usage: string
  parts: PartDoc[]
  examples: ExampleMeta[]
  playground?: PlaygroundSpec
  accessibility: string[]
  keyboard?: KeyboardDoc[]
  responsive?: string
  platformNotes?: Partial<Record<Platform, string>>
  related?: string[]
}

export interface CategoryMeta {
  id: CategoryId
  label: string
  description: string
}

export const categories: CategoryMeta[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Tokens, typography and small building blocks.',
  },
  { id: 'buttons', label: 'Buttons & Actions', description: 'Trigger actions and toggles.' },
  { id: 'forms', label: 'Forms', description: 'Collect and validate input.' },
  { id: 'layout', label: 'Layout', description: 'Arrange content responsively.' },
  { id: 'navigation', label: 'Navigation', description: 'Move between views and sections.' },
  { id: 'feedback', label: 'Feedback', description: 'Communicate status and progress.' },
  { id: 'overlay', label: 'Overlay', description: 'Content layered above the page.' },
  { id: 'data-display', label: 'Data Display', description: 'Present information and records.' },
  { id: 'media', label: 'Media', description: 'Images, video and audio.' },
  { id: 'advanced', label: 'Advanced', description: 'Complex, composite widgets.' },
  { id: 'charts', label: 'Charts', description: 'Data visualisation.' },
]

export function defineMeta(meta: ComponentMeta): ComponentMeta {
  return meta
}
