import { appExamples } from '@adv-ui/examples/meta'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExampleViewer } from '../../../components/app-examples'

export function generateStaticParams() {
  return appExamples.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const example = appExamples.find((e) => e.slug === slug)
  return example ? { title: example.title, description: example.description } : {}
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!appExamples.some((e) => e.slug === slug)) notFound()
  return <ExampleViewer slug={slug} />
}
