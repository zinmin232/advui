#!/usr/bin/env node
// Scaffolds a new component that follows COMPONENT_GUIDELINES.md.
//
//   pnpm create-component <slug> [--category forms] [--name "Display Name"]
//
// Creates packages/ui/src/components/<slug>/ with the component, a test,
// metadata, an example and an index; exports it from the package; removes it
// from the roadmap; and regenerates the catalog.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { CATEGORY_IDS, componentsDir, pascal, repoRoot, uiSrc } from './lib/catalog.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { category: { type: 'string' }, name: { type: 'string' } },
})
const slug = positionals[0]
if (!slug || !/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(
    'Usage: pnpm create-component <kebab-case-slug> [--category <id>] [--name "Display Name"]',
  )
  process.exit(1)
}

const roadmapFile = join(uiSrc, 'meta', 'roadmap.ts')
const roadmapSource = readFileSync(roadmapFile, 'utf8')
const roadmapLine = roadmapSource.split('\n').find((line) => line.includes(`slug: '${slug}'`))
const roadmapCategory = roadmapLine?.match(/category: '([^']+)'/)?.[1]
const roadmapName = roadmapLine?.match(/name: '([^']+)'/)?.[1]

const category = values.category ?? roadmapCategory ?? 'foundations'
if (!CATEGORY_IDS.includes(category)) {
  console.error(`Unknown category "${category}". Use one of: ${CATEGORY_IDS.join(', ')}`)
  process.exit(1)
}
const Name = pascal(slug)
const title =
  values.name ??
  roadmapName ??
  slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
const dir = join(componentsDir, slug)
if (existsSync(dir)) {
  console.error(`packages/ui/src/components/${slug} already exists.`)
  process.exit(1)
}

const files = {
  [`${Name}.tsx`]: `import { forwardRef } from 'react'
import { type GetProps, type TamaguiElement, View, styled } from 'tamagui'

const ${Name}Frame = styled(View, {
  name: '${Name}',
  // Use theme tokens only: '$background', '$border', '$4', '$md'…
  backgroundColor: '$card',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: '$lg',
  padding: '$4',

  variants: {
    size: {
      sm: { padding: '$2' },
      md: { padding: '$4' },
    },
  } as const,

  defaultVariants: { size: 'md' },
})

export type ${Name}Props = GetProps<typeof ${Name}Frame>

/** TODO: one-line description (shown in editor tooltips). */
export const ${Name} = forwardRef<TamaguiElement, ${Name}Props>(function ${Name}(
  { size = 'md', ...props },
  ref,
) {
  return <${Name}Frame ref={ref} size={size} {...props} />
})
`,
  [`${Name}.test.tsx`]: `import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { ${Name} } from './${Name}'

describe('${Name}', () => {
  it('renders its children', () => {
    renderWithProvider(
      <${Name}>
        <Text>Content</Text>
      </${Name}>,
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  // TODO: test roles, keyboard interaction and states — not implementation details.
})
`,
  [`${slug}.meta.ts`]: `import { defineMeta } from '../../meta/types'

export default defineMeta({
  name: '${title}',
  slug: '${slug}',
  category: '${category}',
  description: 'TODO: one sentence describing when to use ${title}.',
  status: 'experimental',
  since: '0.1.0',
  platforms: ['web', 'ios', 'android'],
  exports: ['${Name}'],
  files: ['components/${slug}/${Name}.tsx', 'components/${slug}/index.ts'],
  keywords: [],
  usage: \`import { ${Name} } from '@advui/core'

<${Name}>…</${Name}>\`,
  parts: [
    {
      name: '${Name}',
      props: [{ name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Padding scale.' }],
    },
  ],
  examples: [{ name: 'basic', title: 'Basic' }],
  accessibility: ['TODO: roles, labels, focus management and screen-reader behaviour.'],
  platformNotes: {},
  related: [],
})
`,
  'index.ts': `export { ${Name}, type ${Name}Props } from './${Name}'\n`,
  'examples/basic.tsx': `import { ${Name}, Text } from '@advui/core'

export default function ${Name}Basic() {
  return (
    <${Name}>
      <Text>Hello from ${title}</Text>
    </${Name}>
  )
}
`,
}

mkdirSync(join(dir, 'examples'), { recursive: true })
for (const [file, content] of Object.entries(files)) writeFileSync(join(dir, file), content)

// Export from the package entry (kept alphabetical).
const indexFile = join(uiSrc, 'index.ts')
const index = readFileSync(indexFile, 'utf8')
const exportLine = `export * from './components/${slug}'`
if (!index.includes(exportLine)) {
  const lines = index.split('\n')
  const componentLines = lines
    .map((line, i) => ({ line, i }))
    .filter(({ line }) => line.startsWith("export * from './components/"))
  const insertAt =
    componentLines.find(({ line }) => line > exportLine)?.i ?? componentLines.at(-1).i + 1
  lines.splice(insertAt, 0, exportLine)
  writeFileSync(indexFile, lines.join('\n'))
}

if (roadmapLine) writeFileSync(roadmapFile, roadmapSource.replace(`${roadmapLine}\n`, ''))

execFileSync(process.execPath, [join(repoRoot, 'scripts', 'generate-catalog.mjs')], {
  stdio: 'inherit',
})
console.log(`
Created packages/ui/src/components/${slug}/
Next steps (see COMPONENT_GUIDELINES.md):
  1. Implement ${Name}.tsx using theme tokens only
  2. Fill in ${slug}.meta.ts (description, props, accessibility, platform notes)
  3. Write meaningful tests, add examples, then run: pnpm test && pnpm registry:build`)
