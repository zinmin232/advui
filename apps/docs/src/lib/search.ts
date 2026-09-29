import { components, roadmap } from '@advui/catalog'
import { appExamples } from '@advui/examples/meta'
import { guides } from './guides'

export type SearchKind = 'component' | 'guide' | 'example' | 'prop' | 'planned' | 'app-example'

export interface SearchEntry {
  id: string
  kind: SearchKind
  title: string
  subtitle?: string
  href: string
  /** Lower-cased text matched against the query. */
  text: string
}

export { appExamples } from '@advui/examples/meta'

/** Builds the search index from metadata — runs at build time on the server. */
export function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = []
  for (const guide of guides) {
    entries.push({
      id: `guide-${guide.slug}`,
      kind: 'guide',
      title: guide.title,
      subtitle: guide.description,
      href: `/docs/${guide.slug}`,
      text: [guide.title, guide.description, ...(guide.keywords ?? [])].join(' ').toLowerCase(),
    })
  }
  for (const c of components) {
    const href = `/docs/components/${c.slug}`
    entries.push({
      id: `component-${c.slug}`,
      kind: 'component',
      title: c.name,
      subtitle: c.description,
      href,
      text: [c.name, c.slug, c.description, c.category, ...(c.keywords ?? []), ...c.exports]
        .join(' ')
        .toLowerCase(),
    })
    for (const example of c.examples) {
      entries.push({
        id: `example-${c.slug}-${example.name}`,
        kind: 'example',
        title: `${c.name}: ${example.title}`,
        subtitle: example.description,
        href: `${href}#example-${example.name}`,
        text: `${c.name} ${example.title} ${example.description ?? ''} example`.toLowerCase(),
      })
    }
    for (const part of c.parts) {
      for (const prop of part.props) {
        entries.push({
          id: `prop-${c.slug}-${part.name}-${prop.name}`,
          kind: 'prop',
          title: `${part.name} · ${prop.name}`,
          subtitle: prop.description,
          href: `${href}#api`,
          text: `${part.name} ${prop.name} ${prop.type} ${prop.description} prop`.toLowerCase(),
        })
      }
    }
  }
  for (const r of roadmap) {
    entries.push({
      id: `planned-${r.slug}`,
      kind: 'planned',
      title: r.name,
      subtitle: `Planned — phase ${r.phase}`,
      href: `/docs/components/${r.slug}`,
      text: `${r.name} ${r.slug} ${r.category} planned`.toLowerCase(),
    })
  }
  for (const ex of appExamples) {
    entries.push({
      id: `app-${ex.slug}`,
      kind: 'app-example',
      title: ex.title,
      subtitle: ex.description,
      href: `/examples/${ex.slug}`,
      text: `${ex.title} ${ex.description} example app screen`.toLowerCase(),
    })
  }
  return entries
}

const kindWeight: Record<SearchKind, number> = {
  component: 40,
  guide: 35,
  'app-example': 20,
  example: 15,
  planned: 10,
  prop: 5,
}

/** Small, dependency-free ranking: prefix > word start > substring > subsequence. */
export function searchEntries(entries: SearchEntry[], query: string, limit = 30): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries.filter((e) => e.kind === 'component' || e.kind === 'guide').slice(0, limit)
  const terms = q.split(/\s+/)
  const scored: Array<{ entry: SearchEntry; score: number }> = []
  for (const entry of entries) {
    const title = entry.title.toLowerCase()
    let score = 0
    let matchedAll = true
    for (const term of terms) {
      if (title.startsWith(term)) score += 100
      else if (new RegExp(`\\b${escapeRegExp(term)}`).test(title)) score += 70
      else if (title.includes(term)) score += 50
      else if (entry.text.includes(term)) score += 20
      else if (isSubsequence(term, title)) score += 8
      else matchedAll = false
    }
    if (matchedAll && score > 0) scored.push({ entry, score: score + kindWeight[entry.kind] })
  }
  return scored
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((s) => s.entry)
}

function isSubsequence(needle: string, haystack: string) {
  let i = 0
  for (const char of haystack) if (char === needle[i]) i++
  return i === needle.length
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
