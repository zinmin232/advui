'use client'

import { Text } from '@advui/core'
import type { ReactNode } from 'react'
import { Breadcrumbs, DocPage, PrevNext, type TocItem } from './docs-shell'
import { PageHeader } from './prose'

export function GuidePage({
  title,
  description,
  section,
  toc,
  editUrl,
  prev,
  next,
  children,
}: {
  title: string
  description: string
  section: string
  toc: TocItem[]
  editUrl: string
  prev?: { title: string; href: string }
  next?: { title: string; href: string }
  children: ReactNode
}) {
  return (
    <DocPage toc={toc}>
      <Breadcrumbs
        items={[{ title: 'Docs', href: '/docs/introduction' }, { title: section }, { title }]}
      />
      <PageHeader title={title} description={description} />
      {children}
      <a href={editUrl} className="prose-link" target="_blank" rel="noreferrer">
        <Text size="xs" color="$primaryText" paddingTop="$6">
          Edit this page on GitHub
        </Text>
      </a>
      <PrevNext prev={prev} next={next} />
    </DocPage>
  )
}
