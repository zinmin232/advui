import { appExamples } from '@adv-ui/examples/meta'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExampleFrame } from '../../../../components/app-examples'

export const metadata: Metadata = { robots: { index: false } }

export function generateStaticParams() {
  return appExamples.map((e) => ({ slug: e.slug }))
}

export default async function ExampleFramePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!appExamples.some((e) => e.slug === slug)) notFound()
  return <ExampleFrame slug={slug} />
}
