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
  phase: 7 | 8 | 9
  /** The package it will ship in, when not `@advui/core`. */
  package?: '@advui/data' | '@advui/charts' | '@advui/editor'
}

export const roadmap: RoadmapItem[] = []
