import { type ComponentStatus, categories, components, roadmap } from '@advui/core/meta'
import { guides } from './guides'

export interface NavItem {
  title: string
  href: string
  status?: ComponentStatus
  /** Planned items link to a roadmap page. */
  planned?: boolean
}

/** A labelled run of links inside a section (untitled for flat sections). */
export interface NavCategory {
  id: string
  title?: string
  items: NavItem[]
}

/** A top-level, collapsible sidebar section. */
export interface NavSection {
  id: string
  title: string
  /** Landing page shown above the categories (e.g. "All components"). */
  overview?: NavItem
  categories: NavCategory[]
}

/** Guide sections and how the sidebar and breadcrumbs name them. */
export const guideSectionTitles = {
  'getting-started': 'Getting started',
  foundations: 'Customization',
} as const

const guideLinks = (section: keyof typeof guideSectionTitles): NavItem[] =>
  guides
    .filter((g) => g.section === section)
    .map((g) => ({ title: g.title, href: `/docs/${g.slug}` }))

/**
 * The sidebar is generated from component metadata + the roadmap, so adding a
 * `*.meta.ts` file is enough to make a component appear here.
 */
export function buildNavigation(): NavSection[] {
  const componentCategories: NavCategory[] = categories
    .map((category) => {
      const implemented: NavItem[] = components
        .filter((c) => c.category === category.id)
        .map((c) => ({ title: c.name, href: `/docs/components/${c.slug}`, status: c.status }))
      const planned: NavItem[] = roadmap
        .filter((r) => r.category === category.id)
        .map((r) => ({
          title: r.name,
          href: `/docs/components/${r.slug}`,
          status: 'planned',
          planned: true,
        }))
      const items = [...implemented, ...planned].sort((a, b) => a.title.localeCompare(b.title))
      return { id: category.id, title: category.label, items }
    })
    .filter((category) => category.items.length > 0)

  return [
    {
      id: 'getting-started',
      title: guideSectionTitles['getting-started'],
      categories: [{ id: 'getting-started', items: guideLinks('getting-started') }],
    },
    {
      id: 'customization',
      title: guideSectionTitles.foundations,
      categories: [{ id: 'customization', items: guideLinks('foundations') }],
    },
    {
      id: 'components',
      title: 'Components',
      overview: { title: 'All components', href: '/docs/components' },
      categories: componentCategories,
    },
  ]
}

/** Every link in a section, in display order. */
export function sectionLinks(section: NavSection): NavItem[] {
  return [
    ...(section.overview ? [section.overview] : []),
    ...section.categories.flatMap((category) => category.items),
  ]
}

/** Flat, ordered list of pages for previous / next links. */
export function flatPages(): NavItem[] {
  return buildNavigation()
    .flatMap((section) => section.categories.flatMap((category) => category.items))
    .filter((item) => !item.planned)
}
