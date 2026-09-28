import type { CategoryId } from './types'

/**
 * Components on the roadmap that are not implemented yet. They appear in the
 * docs navigation with a "Planned" badge so the full scope is visible.
 * When a component ships, delete its entry here and add a `*.meta.ts` file.
 */
export interface RoadmapItem {
  name: string
  slug: string
  category: CategoryId
  phase: 2 | 3 | 4 | 5
}

export const roadmap: RoadmapItem[] = [
  { name: 'Video', slug: 'video', category: 'media', phase: 5 },
  { name: 'Audio Player', slug: 'audio-player', category: 'media', phase: 5 },

  { name: 'Rich Text Editor', slug: 'rich-text-editor', category: 'advanced', phase: 5 },
  { name: 'Resizable Panel', slug: 'resizable-panel', category: 'advanced', phase: 5 },
  { name: 'Data Grid', slug: 'data-grid', category: 'advanced', phase: 5 },
]
