import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import { GuidePage } from '../../../components/guide-page'
import type { TocItem } from '../../../components/docs-shell'
import {
  ColorsGuide,
  IconsGuide,
  SpacingGuide,
  ThemeGuide,
  TypographyGuide,
  colorsToc,
  iconsToc,
  spacingToc,
  themeToc,
  typographyToc,
} from '../../../content/guides/foundations'
import {
  Accessibility,
  Cli,
  Installation,
  Introduction,
  Platforms,
  accessibilityToc,
  cliToc,
  installationToc,
  introductionToc,
  platformsToc,
} from '../../../content/guides/getting-started'
import { getGuide, guides } from '../../../lib/guides'
import { flatPages, guideSectionTitles } from '../../../lib/navigation'
import { editUrl } from '../../../lib/site'

const content: Record<string, { Body: ComponentType; toc: TocItem[] }> = {
  introduction: { Body: Introduction, toc: introductionToc },
  installation: { Body: Installation, toc: installationToc },
  cli: { Body: Cli, toc: cliToc },
  accessibility: { Body: Accessibility, toc: accessibilityToc },
  platforms: { Body: Platforms, toc: platformsToc },
  theme: { Body: ThemeGuide, toc: themeToc },
  colors: { Body: ColorsGuide, toc: colorsToc },
  typography: { Body: TypographyGuide, toc: typographyToc },
  spacing: { Body: SpacingGuide, toc: spacingToc },
  icons: { Body: IconsGuide, toc: iconsToc },
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const guide = getGuide((await params).slug)
  return guide ? { title: guide.title, description: guide.description } : {}
}

export default async function GuideRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)
  const page = content[slug]
  if (!guide || !page) notFound()
  const pages = flatPages()
  const index = pages.findIndex((p) => p.href === `/docs/${slug}`)
  const { Body } = page
  return (
    <GuidePage
      title={guide.title}
      description={guide.description}
      section={guideSectionTitles[guide.section]}
      toc={page.toc}
      editUrl={editUrl(
        `apps/docs/src/content/guides/${guide.section === 'foundations' ? 'foundations' : 'getting-started'}.tsx`,
      )}
      prev={index > 0 ? pages[index - 1] : undefined}
      next={index >= 0 && index < pages.length - 1 ? pages[index + 1] : undefined}
    >
      <Body />
    </GuidePage>
  )
}
