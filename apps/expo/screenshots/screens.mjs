import { join } from 'node:path'
import { loadCatalog, loadTsModule, repoRoot } from '../../../scripts/lib/catalog.mjs'

/**
 * The screens to photograph, each with its route. A component gets one screen
 * per example, as a whole component page is taller than any screenshot.
 */
export function listScreens(components, appExamples) {
  return [
    { name: 'home', path: '/' },
    { name: 'theme', path: '/theme' },
    ...appExamples.map(({ slug }) => ({ name: `example--${slug}`, path: `/examples/${slug}` })),
    ...components
      .filter(({ platforms }) => platforms.includes('android'))
      .flatMap(({ slug, examples }) =>
        examples.map(({ name }) => ({
          name: `${slug}--${name}`,
          path: `/components/${slug}?example=${name}`,
        })),
      ),
  ]
}

export function allScreens() {
  const { appExamples } = loadTsModule(join(repoRoot, 'examples', 'src', 'meta.ts'), (id) => {
    throw new Error(`examples/src/meta.ts may only import types (found "${id}")`)
  })
  return listScreens(
    loadCatalog().map(({ meta }) => meta),
    appExamples,
  )
}

/** The center of the view with this text or accessibility label, from a `uiautomator` dump. */
export function findView(dump, label) {
  for (const [node] of dump.matchAll(/<node [^>]*>/g)) {
    if (!node.includes(`text="${label}"`) && !node.includes(`content-desc="${label}"`)) continue
    const [left, top, right, bottom] = /bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/
      .exec(node)
      .slice(1)
      .map(Number)
    return { x: Math.round((left + right) / 2), y: Math.round((top + bottom) / 2) }
  }
  return null
}
