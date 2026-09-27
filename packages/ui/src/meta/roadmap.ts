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
  { name: 'Button Group', slug: 'button-group', category: 'buttons', phase: 2 },

  { name: 'Multi Select', slug: 'multi-select', category: 'forms', phase: 3 },
  { name: 'Combobox', slug: 'combobox', category: 'forms', phase: 3 },
  { name: 'Autocomplete', slug: 'autocomplete', category: 'forms', phase: 3 },
  { name: 'Date Picker', slug: 'date-picker', category: 'forms', phase: 3 },
  { name: 'Date Range Picker', slug: 'date-range-picker', category: 'forms', phase: 3 },
  { name: 'Time Picker', slug: 'time-picker', category: 'forms', phase: 3 },
  { name: 'Number Input', slug: 'number-input', category: 'forms', phase: 3 },
  { name: 'Password Input', slug: 'password-input', category: 'forms', phase: 3 },
  { name: 'OTP Input', slug: 'otp-input', category: 'forms', phase: 3 },
  { name: 'Form Field', slug: 'form-field', category: 'forms', phase: 3 },

  { name: 'Aspect Ratio', slug: 'aspect-ratio', category: 'layout', phase: 2 },
  { name: 'Scroll Area', slug: 'scroll-area', category: 'layout', phase: 2 },

  { name: 'Pagination', slug: 'pagination', category: 'navigation', phase: 4 },
  { name: 'Menu', slug: 'menu', category: 'navigation', phase: 2 },
  { name: 'Navigation Menu', slug: 'navigation-menu', category: 'navigation', phase: 4 },
  { name: 'Sidebar', slug: 'sidebar', category: 'navigation', phase: 4 },
  { name: 'Stepper', slug: 'stepper', category: 'navigation', phase: 4 },

  { name: 'Circular Progress', slug: 'circular-progress', category: 'feedback', phase: 2 },
  { name: 'Empty State', slug: 'empty-state', category: 'feedback', phase: 4 },
  { name: 'Error State', slug: 'error-state', category: 'feedback', phase: 4 },

  { name: 'Drawer', slug: 'drawer', category: 'overlay', phase: 2 },
  { name: 'Hover Card', slug: 'hover-card', category: 'overlay', phase: 2 },
  { name: 'Context Menu', slug: 'context-menu', category: 'overlay', phase: 2 },

  { name: 'Table', slug: 'table', category: 'data-display', phase: 4 },
  { name: 'Data Table', slug: 'data-table', category: 'data-display', phase: 4 },
  { name: 'List', slug: 'list', category: 'data-display', phase: 4 },
  { name: 'Timeline', slug: 'timeline', category: 'data-display', phase: 4 },
  { name: 'Collapsible', slug: 'collapsible', category: 'data-display', phase: 2 },
  { name: 'Calendar', slug: 'calendar', category: 'data-display', phase: 3 },
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
