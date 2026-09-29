import type { CategoryId } from '@advui/core/meta'

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

export const roadmap: RoadmapItem[] = []
