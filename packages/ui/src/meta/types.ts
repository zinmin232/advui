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

/** Min-width breakpoints from `@advui/theme`, smallest first. */
export type { Breakpoint } from '../utils/responsive'

/**
 * One prop. `type` is what the docs show; the optional fields after
 * `description` are for tools such as the AdvUI Builder, which builds an
 * editor for each prop from them.
 */
export interface PropDoc {
  /** One prop per row: `value`, not `value / defaultValue`. */
  name: string
  type: string
  /** A literal as written in code (`'column'`, `true`, `12`), or a note such as "from `trend`". */
  default?: string
  required?: boolean
  description: string
  /**
   * Closed list of allowed values, in display order, written without quotes:
   * `"'sm' | 'md'"` → `['sm', 'md']`, `1 | 2` → `['1', '2']`.
   */
  options?: string[]
  /** Also accepts a mobile-first map `{ base?, xs?, sm?, md?, lg?, xl?, xxl? }` of the same value. */
  responsive?: boolean
  /** The value is a theme token of this scale, such as `$4` for `space`. */
  token?: 'space' | 'size' | 'color' | 'radius' | 'zIndex'
  /** Numbers only. */
  min?: number
  max?: number
  step?: number
  /** Only when the prop works on some platforms, not all. */
  platforms?: Platform[]
}

/** What may go inside a part. */
export interface ChildRules {
  /**
   * `'any'`: any elements; `'text'`: strings and numbers only; `'none'`: no
   * children; a list: only these parts, e.g. `['Tabs.Trigger']`.
   */
  accepts: 'any' | 'text' | 'none' | string[]
  min?: number
  max?: number
}

export interface PartDoc {
  /** Component or sub-component name, e.g. `Card.Header`. One part per entry. */
  name: string
  /**
   * What the part is. Defaults to `'component'`. Hooks, functions and types
   * are documented here too, but are never placed in a tree, so they have no
   * child rules.
   */
  kind?: 'component' | 'hook' | 'function' | 'type'
  description?: string
  props: PropDoc[]
  /** What may go inside this part. Every component part has them. */
  children?: ChildRules
  /** This part must be a direct child of one of these parts. */
  parents?: string[]
  /** This part must sit somewhere inside this component or part, because it reads its context. */
  within?: string
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

/** A reference table on the docs page, such as a mapping from another library. */
export interface DocTable {
  /** Anchor on the docs page, e.g. `from-bootstrap`. */
  id: string
  title: string
  description?: string
  columns: string[]
  /** One cell per column; text in backticks renders as code. */
  rows: string[][]
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
  /** Reference tables shown after the API reference. */
  tables?: DocTable[]
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
