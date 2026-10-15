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
  // Phase 7: the components apps reach for most.
  { name: 'Checkbox Group', slug: 'checkbox-group', category: 'forms', phase: 7 },
  { name: 'Tags Input', slug: 'tags-input', category: 'forms', phase: 7 },
  { name: 'Carousel', slug: 'carousel', category: 'media', phase: 7 },
  { name: 'Rating', slug: 'rating', category: 'forms', phase: 7 },
  { name: 'Color Picker', slug: 'color-picker', category: 'forms', phase: 7 },
  { name: 'Menubar', slug: 'menubar', category: 'navigation', phase: 7 },
  { name: 'Code Block', slug: 'code-block', category: 'data-display', phase: 7 },
  { name: 'Copy Button', slug: 'copy-button', category: 'buttons', phase: 7 },

  // Phase 8: less common, still in most libraries.
  { name: 'Date Time Picker', slug: 'date-time-picker', category: 'forms', phase: 8 },
  { name: 'Description List', slug: 'description-list', category: 'data-display', phase: 8 },
  { name: 'Indicator', slug: 'indicator', category: 'foundations', phase: 8 },
  { name: 'Tour', slug: 'tour', category: 'overlay', phase: 8 },
  { name: 'Spoiler', slug: 'spoiler', category: 'data-display', phase: 8 },
  { name: 'Meter', slug: 'meter', category: 'feedback', phase: 8 },
  { name: 'Table of Contents', slug: 'table-of-contents', category: 'navigation', phase: 8 },
  { name: 'Back to Top', slug: 'back-to-top', category: 'buttons', phase: 8 },
  { name: 'Transfer List', slug: 'transfer-list', category: 'advanced', phase: 8 },
  { name: 'Visually Hidden', slug: 'visually-hidden', category: 'foundations', phase: 8 },
  { name: 'Portal', slug: 'portal', category: 'foundations', phase: 8 },

  // Phase 9: more charts, and data at scale.
  {
    name: 'Scatter Chart',
    slug: 'scatter-chart',
    category: 'charts',
    phase: 9,
    package: '@advui/charts',
  },
  {
    name: 'Radar Chart',
    slug: 'radar-chart',
    category: 'charts',
    phase: 9,
    package: '@advui/charts',
  },
  {
    name: 'Radial Chart',
    slug: 'radial-chart',
    category: 'charts',
    phase: 9,
    package: '@advui/charts',
  },
  {
    name: 'Composed Chart',
    slug: 'composed-chart',
    category: 'charts',
    phase: 9,
    package: '@advui/charts',
  },
  {
    name: 'Heatmap',
    slug: 'heatmap',
    category: 'charts',
    phase: 9,
    package: '@advui/charts',
  },
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
