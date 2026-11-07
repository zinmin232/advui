import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/** Lists the shots of a run that never held still. */
export const movingFile = 'moving.json'

/** Screenshots in a folder, as paths relative to it (`dark/button--basic.png`). */
function listShots(folder) {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
    .map((entry) => relative(folder, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .sort()
}

function listMoving(folder) {
  const file = join(folder, movingFile)
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
}

/** Counts the pixels that differ, and marks them in an image of their own. */
export function comparePngs(approved, current) {
  const before = PNG.sync.read(approved)
  const after = PNG.sync.read(current)
  const { width, height } = before
  if (width !== after.width || height !== after.height) return { pixels: width * height }
  const marks = new PNG({ width, height })
  const pixels = pixelmatch(before.data, after.data, marks.data, width, height)
  return { pixels, marks: PNG.sync.write(marks) }
}

/**
 * Compares a run with the approved screenshots. A new or a removed screen is
 * not a change: it comes with a new example, and the next approved set has it.
 * A screen that moved in either run has no one frame to compare, such as a ring
 * that spins by design, so it is listed instead.
 */
export function findChanges(approved, current) {
  const before = listShots(approved)
  const after = listShots(current)
  const moving = [...new Set([...listMoving(approved), ...listMoving(current)])].sort()
  const compared = after.filter((shot) => before.includes(shot) && !moving.includes(shot))
  const changed = []

  for (const shot of compared) {
    const a = readFileSync(join(approved, shot))
    const b = readFileSync(join(current, shot))
    if (a.equals(b)) continue
    const { pixels, marks } = comparePngs(a, b)
    if (pixels) changed.push({ shot, pixels, marks })
  }

  return {
    changed,
    moving,
    added: after.filter((shot) => !before.includes(shot)),
    removed: before.filter((shot) => !after.includes(shot)),
    compared: compared.length,
  }
}

/** Writes each changed screen as it was, as it is, and with the difference marked. */
export function writeReport(
  { changed, moving, added, removed, compared },
  approved,
  current,
  report,
) {
  for (const { shot, marks } of changed) {
    const base = join(report, shot.replace(/\.png$/, ''))
    mkdirSync(dirname(base), { recursive: true })
    copyFileSync(join(approved, shot), `${base}.approved.png`)
    copyFileSync(join(current, shot), `${base}.current.png`)
    if (marks) writeFileSync(`${base}.difference.png`, marks)
  }

  const list = (title, shots) =>
    shots.length ? [`### ${title}`, '', ...shots.map((shot) => `- ${shot}`), ''] : []
  const summary = [
    '## Native screenshots',
    '',
    `Compared ${compared} screenshots: ${changed.length} changed, ${added.length} new, ${removed.length} removed, ${moving.length} not compared.`,
    '',
    ...list(
      'Changed',
      changed.map(({ shot, pixels }) => `${shot}: ${pixels.toLocaleString('en')} pixels`),
    ),
    ...list('Not compared, as they never held still', moving),
    ...list('New', added),
    ...list('Removed', removed),
  ].join('\n')

  mkdirSync(report, { recursive: true })
  writeFileSync(join(report, 'summary.md'), summary)
  return summary
}

export const hasShots = (folder) => existsSync(folder) && listShots(folder).length > 0
