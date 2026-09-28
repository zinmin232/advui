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

  { name: 'Pagination', slug: 'pagination', category: 'navigation', phase: 4 },
  { name: 'Navigation Menu', slug: 'navigation-menu', category: 'navigation', phase: 4 },
  { name: 'Sidebar', slug: 'sidebar', category: 'navigation', phase: 4 },
  { name: 'Stepper', slug: 'stepper', category: 'navigation', phase: 4 },

  { name: 'Table', slug: 'table', category: 'data-display', phase: 4 },
  { name: 'Data Table', slug: 'data-table', category: 'data-display', phase: 4 },
  { name: 'List', slug: 'list', category: 'data-display', phase: 4 },
  { name: 'Timeline', slug: 'timeline', category: 'data-display', phase: 4 },
  { name: 'Stat', slug: 'stat', category: 'data-display', phase: 4 },
  { name: 'KPI Card', slug: 'kpi-card', category: 'data-display', phase: 4 },

  { name: 'Image', slug: 'image', category: 'media', phase: 4 },
  { name: 'Image Gallery', slug: 'image-gallery', category: 'media', phase: 5 },
  { name: 'Video', slug: 'video', category: 'media', phase: 5 },
  { name: 'Audio Player', slug: 'audio-player', category: 'media', phase: 5 },

  { name: 'Command Palette', slug: 'command-palette', category: 'advanced', phase: 5 },
  { name: 'Search', slug: 'search', category: 'advanced', phase: 5 },
  { name: 'Rich Text Editor', slug: 'rich-text-editor', category: 'advanced', phase: 5 },
  { name: 'File Upload', slug: 'file-upload', category: 'advanced', phase: 3 },
  { name: 'File Dropzone', slug: 'file-dropzone', category: 'advanced', phase: 3 },
  { name: 'Resizable Panel', slug: 'resizable-panel', category: 'advanced', phase: 5 },
  { name: 'Tree View', slug: 'tree-view', category: 'advanced', phase: 4 },
  { name: 'Data Grid', slug: 'data-grid', category: 'advanced', phase: 5 },

  { name: 'Line Chart', slug: 'line-chart', category: 'charts', phase: 5 },
  { name: 'Bar Chart', slug: 'bar-chart', category: 'charts', phase: 5 },
  { name: 'Area Chart', slug: 'area-chart', category: 'charts', phase: 5 },
  { name: 'Pie Chart', slug: 'pie-chart', category: 'charts', phase: 5 },
]
