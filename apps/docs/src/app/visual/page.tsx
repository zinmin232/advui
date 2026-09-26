import { components } from '@adv-ui/core/meta'
import type { Metadata } from 'next'
import { VisualGallery } from '../../components/visual-gallery'

export const metadata: Metadata = { title: 'Visual tests', robots: { index: false } }

/**
 * Every example of every component on one page — the target of the Playwright
 * visual regression suite (light/dark × desktop/mobile).
 */
export default function VisualPage() {
  const items = components.flatMap((c) =>
    c.examples.map((e) => ({ slug: c.slug, name: e.name, title: `${c.name} / ${e.title}` })),
  )
  return <VisualGallery items={items} />
}
