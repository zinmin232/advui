// Line diffs and three-way merges for `diff` and `update`. Written here rather
// than taken from npm so the CLI keeps no runtime dependencies.

export type Edit =
  | { type: 'equal'; a: number; b: number }
  | { type: 'delete'; a: number }
  | { type: 'insert'; b: number }

/** Splits text into lines that keep their `\n`, so joining them gives the text back. */
export function splitLines(text: string): string[] {
  return text.match(/[^\n]*\n|[^\n]+$/g) ?? []
}

/** The shortest edit script from `a` to `b` (Myers' O(ND) diff), in order. */
export function diffLines(a: readonly string[], b: readonly string[]): Edit[] {
  // Most edits touch a few lines in the middle: strip the common ends first.
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--
    endB--
  }

  const edits: Edit[] = []
  for (let i = 0; i < start; i++) edits.push({ type: 'equal', a: i, b: i })
  const n = endA - start
  const m = endB - start
  const max = n + m
  const offset = max + 1
  const v = new Int32Array(2 * max + 3)
  // trace[d] is `v` before step d, for diagonals -d…d (index k + d).
  const trace: Int32Array[] = []
  search: for (let d = 0; d <= max; d++) {
    trace.push(v.slice(offset - d, offset + d + 1))
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!)
      let x = down ? v[offset + k + 1]! : v[offset + k - 1]! + 1
      let y = x - k
      while (x < n && y < m && a[start + x] === b[start + y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m) break search
    }
  }

  // Walk back from the end, one step of the trace at a time.
  const middle: Edit[] = []
  let x = n
  let y = m
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d]!
    const k = x - y
    const down = k === -d || (k !== d && vd[k - 1 + d]! < vd[k + 1 + d]!)
    const prevK = down ? k + 1 : k - 1
    const prevX = d === 0 ? 0 : vd[prevK + d]!
    const prevY = d === 0 ? 0 : prevX - prevK
    while (x > prevX && y > prevY) {
      x--
      y--
      middle.push({ type: 'equal', a: start + x, b: start + y })
    }
    if (d > 0)
      middle.push(
        down ? { type: 'insert', b: start + y - 1 } : { type: 'delete', a: start + x - 1 },
      )
    x = prevX
    y = prevY
  }
  edits.push(...middle.reverse())
  for (let i = 0; endA + i < a.length; i++) edits.push({ type: 'equal', a: endA + i, b: endB + i })
  return edits
}

const range = (start: number, count: number) => (count === 1 ? `${start}` : `${start},${count}`)

/**
 * A unified diff from `a` to `b` (`diff -u`, three lines of context), or '' when
 * they are the same. `labels` name the two sides in the `---`/`+++` header.
 */
export function unifiedDiff(
  a: string,
  b: string,
  labels: { a: string; b: string },
  context = 3,
): string {
  const linesA = splitLines(a)
  const linesB = splitLines(b)
  const edits = diffLines(linesA, linesB)
  if (edits.every((edit) => edit.type === 'equal')) return ''

  // Lines of a and b before each edit, for the hunk headers.
  const before: Array<[number, number]> = []
  let lineA = 0
  let lineB = 0
  for (const edit of edits) {
    before.push([lineA, lineB])
    if (edit.type !== 'insert') lineA++
    if (edit.type !== 'delete') lineB++
  }

  const out = [`--- ${labels.a}`, `+++ ${labels.b}`]
  let i = 0
  while (i < edits.length) {
    if (edits[i]!.type === 'equal') {
      i++
      continue
    }
    const start = Math.max(0, i - context)
    let end = i
    // Changes closer than twice the context share a hunk.
    while (end < edits.length) {
      if (edits[end]!.type !== 'equal') {
        end++
        continue
      }
      let run = end
      while (run < edits.length && edits[run]!.type === 'equal') run++
      if (run === edits.length || run - end > 2 * context) {
        end = Math.min(run, end + context)
        break
      }
      end = run
    }
    const hunk = edits.slice(start, end)
    const countA = hunk.filter((edit) => edit.type !== 'insert').length
    const countB = hunk.filter((edit) => edit.type !== 'delete').length
    const [startA, startB] = before[start]!
    out.push(
      `@@ -${range(countA ? startA + 1 : startA, countA)} +${range(countB ? startB + 1 : startB, countB)} @@`,
    )
    for (const edit of hunk) {
      const line = edit.type === 'insert' ? linesB[edit.b]! : linesA[edit.a]!
      const mark = edit.type === 'equal' ? ' ' : edit.type === 'delete' ? '-' : '+'
      out.push(`${mark}${line.replace(/\n$/, '')}`)
      if (!line.endsWith('\n')) out.push('\\ No newline at end of file')
    }
    i = end
  }
  return `${out.join('\n')}\n`
}

export interface MergeResult {
  /** The merged text, or null when the two sides changed the same lines differently. */
  text: string | null
  /** How many regions conflict. */
  conflicts: number
}

const sameLines = (x: readonly string[], y: readonly string[]) =>
  x.length === y.length && x.every((line, i) => line === y[i])

/**
 * Three-way merge of `ours` and `theirs` against their common `base` (diff3):
 * a change that only one side made is taken, the same change on both sides is
 * taken once, and different changes to the same or adjacent lines conflict.
 */
export function merge3(base: string, ours: string, theirs: string): MergeResult {
  const o = splitLines(base)
  const a = splitLines(ours)
  const b = splitLines(theirs)
  // For each base line, the line of each side it matched, or -1.
  const matched = (side: string[]) => {
    const map = new Array<number>(o.length).fill(-1)
    for (const edit of diffLines(o, side)) if (edit.type === 'equal') map[edit.a] = edit.b
    return map
  }
  const inA = matched(a)
  const inB = matched(b)

  const out: string[] = []
  let conflicts = 0
  let io = 0
  let ia = 0
  let ib = 0
  for (;;) {
    // Base lines that both sides kept in place go through as they are.
    while (io < o.length && inA[io] === ia && inB[io] === ib) {
      out.push(o[io]!)
      io++
      ia++
      ib++
    }
    // The changed region ends at the next base line that both sides kept.
    let next = io
    while (next < o.length && (inA[next]! < 0 || inB[next]! < 0)) next++
    const endA = next < o.length ? inA[next]! : a.length
    const endB = next < o.length ? inB[next]! : b.length
    const chunkO = o.slice(io, next)
    const chunkA = a.slice(ia, endA)
    const chunkB = b.slice(ib, endB)
    if (sameLines(chunkA, chunkO)) out.push(...chunkB)
    else if (sameLines(chunkB, chunkO) || sameLines(chunkA, chunkB)) out.push(...chunkA)
    else conflicts++
    if (next >= o.length) break
    io = next
    ia = endA
    ib = endB
  }
  return { text: conflicts ? null : out.join(''), conflicts }
}
