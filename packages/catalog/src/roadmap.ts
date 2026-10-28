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

export const roadmap: RoadmapItem[] = [
  // Phase 9: more charts, and data at scale.
  {
    name: 'Virtual List',
    slug: 'virtual-list',
    category: 'data-display',
    phase: 9,
    package: '@advui/data',
  },
  {
    name: 'Infinite Scroll',
    slug: 'infinite-scroll',
    category: 'data-display',
    phase: 9,
    package: '@advui/data',
  },
  {
    name: 'Kanban',
    slug: 'kanban',
    category: 'advanced',
    phase: 9,
    package: '@advui/data',
  },
  {
    name: 'Event Calendar',
    slug: 'event-calendar',
    category: 'advanced',
    phase: 9,
    package: '@advui/data',
  },
]
