import { categories, components, roadmap } from '@advui/catalog'
import type { Metadata } from 'next'
import { ComponentsIndex } from '../../../components/components-index'

export const metadata: Metadata = {
  title: 'Components',
  description: 'Every Adv UI component, grouped by category, with status and platform support.',
}

export default function ComponentsPage() {
  return (
    <ComponentsIndex
      categories={categories}
      components={components.map(({ slug, name, description, category, status, platforms }) => ({
        slug,
        name,
        description,
        category,
        status,
        platforms,
      }))}
      roadmap={roadmap}
    />
  )
}
