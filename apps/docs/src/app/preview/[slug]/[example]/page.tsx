import { components } from '@advui/core/meta'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PreviewFrame } from './preview-frame'

export const metadata: Metadata = { robots: { index: false } }

export function generateStaticParams() {
  return components.flatMap((c) => c.examples.map((e) => ({ slug: c.slug, example: e.name })))
}

/** Bare example page used by responsive iframes and visual tests. */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string; example: string }>
}) {
  const { slug, example } = await params
  const meta = components.find((c) => c.slug === slug)
  if (!meta?.examples.some((e) => e.name === example)) notFound()
  return <PreviewFrame slug={slug} name={example} />
}
