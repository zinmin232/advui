import { categories, components, roadmap } from '@advui/core/meta'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ComponentDoc, type ComponentDocData } from '../../../../components/component-doc'
import { PlannedDoc } from '../../../../components/planned-doc'
import { highlight } from '../../../../lib/highlight'
import { flatPages } from '../../../../lib/navigation'
import { siteConfig, editUrl } from '../../../../lib/site'
import { componentFolder, lastUpdated, readExampleSource, repoRoot } from '../../../../lib/source'

interface RegistryIndexItem {
  name: string
  dependencies: string[]
  registryDependencies: string[]
}

export function generateStaticParams() {
  return [...components.map((c) => ({ slug: c.slug })), ...roadmap.map((r) => ({ slug: r.slug }))]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = components.find((c) => c.slug === slug)
  const planned = roadmap.find((r) => r.slug === slug)
  if (meta) return { title: meta.name, description: meta.description }
  if (planned) return { title: `${planned.name} (planned)` }
  return {}
}

function readRegistry(): RegistryIndexItem[] {
  try {
    const index = JSON.parse(readFileSync(join(repoRoot, 'registry', 'index.json'), 'utf8')) as {
      items: RegistryIndexItem[]
    }
    return index.items
  } catch {
    return []
  }
}

async function code(source: string, lang: 'tsx' | 'bash' = 'tsx') {
  return { code: source.trimEnd(), html: await highlight(source, lang) }
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = components.find((c) => c.slug === slug)
  if (!meta) {
    const planned = roadmap.find((r) => r.slug === slug)
    if (!planned) notFound()
    const category = categories.find((c) => c.id === planned.category)
    return <PlannedDoc item={planned} categoryLabel={category?.label ?? ''} />
  }

  const folder = componentFolder(meta.files)
  const registryItem = readRegistry().find((item) => item.name === meta.slug)
  const pages = flatPages()
  const index = pages.findIndex((p) => p.href === `/docs/components/${slug}`)
  const known = new Map<string, { name: string; planned: boolean }>([
    ...components.map((c) => [c.slug, { name: c.name, planned: false }] as const),
    ...roadmap.map((r) => [r.slug, { name: r.name, planned: true }] as const),
  ])

  const data: ComponentDocData = {
    meta,
    categoryLabel: categories.find((c) => c.id === meta.category)?.label ?? meta.category,
    usage: await code(meta.usage),
    install: {
      pnpm: await code(`pnpm add ${siteConfig.corePackage}`, 'bash'),
      npm: await code(`npm install ${siteConfig.corePackage}`, 'bash'),
      cli: await code(`npx ${siteConfig.cliName} add ${meta.slug}`, 'bash'),
    },
    examples: await Promise.all(
      meta.examples.map(async (example) => ({
        ...example,
        ...(await code(readExampleSource(folder, example.name))),
      })),
    ),
    registryDependencies: registryItem?.registryDependencies ?? [],
    dependencies: registryItem?.dependencies ?? [],
    related: (meta.related ?? [])
      .filter((r) => known.has(r))
      .map((r) => ({ slug: r, name: known.get(r)!.name, planned: known.get(r)!.planned })),
    lastUpdated: lastUpdated(folder, meta.files),
    editUrl: editUrl(`packages/ui/src/components/${folder}/${meta.slug}.meta.ts`),
    sourceUrl: `${siteConfig.github}/tree/${siteConfig.githubBranch}/packages/ui/src/${meta.files[0]}`,
    prev: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined,
  }

  return <ComponentDoc data={data} />
}
