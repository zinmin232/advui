import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addCommand, diffCommand, initCommand, updateCommand } from './commands.js'
import type { CliConfig } from './config.js'
import { diffLines, merge3, splitLines, unifiedDiff } from './diff.js'
import { detectFramework, detectPackageManager, installCommand } from './project.js'
import { type RegistryIndex, type RegistryItem, hashContent, resolveItems } from './registry.js'
import type { ItemPlan } from './sync.js'

const registry = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../registry')

describe('project detection', () => {
  it('detects frameworks from dependencies', () => {
    expect(detectFramework({ next: '16' })).toBe('next')
    expect(detectFramework({ expo: '57', 'react-native': '0.86' })).toBe('expo')
    expect(detectFramework({ 'react-native': '0.86' })).toBe('react-native')
    expect(detectFramework({})).toBe('unknown')
  })

  it('builds install commands per package manager', () => {
    expect(installCommand('pnpm', ['a', 'b'])).toBe('pnpm add a b')
    expect(installCommand('npm', ['a'], true)).toBe('npm install --save-dev a')
  })
})

describe('resolveItems', () => {
  const fake = (name: string, deps: string[] = []): RegistryItem => ({
    name,
    title: name,
    type: 'registry:component',
    description: '',
    version: '1.0.0',
    dependencies: [],
    peerDependencies: [],
    registryDependencies: deps,
    files: [],
  })

  it('orders dependencies before dependents and de-duplicates', async () => {
    const db: Record<string, RegistryItem> = {
      dialog: fake('dialog', ['icon-button', 'hooks']),
      'icon-button': fake('icon-button', ['button']),
      button: fake('button', ['spinner']),
      spinner: fake('spinner'),
      hooks: fake('hooks'),
    }
    const items = await resolveItems(['dialog', 'button'], async (n) => db[n]!)
    expect(items.map((i) => i.name)).toEqual([
      'spinner',
      'button',
      'icon-button',
      'hooks',
      'dialog',
    ])
  })

  it('detects cycles', async () => {
    const db: Record<string, RegistryItem> = { a: fake('a', ['b']), b: fake('b', ['a']) }
    await expect(resolveItems(['a'], async (n) => db[n]!)).rejects.toThrow(/Circular/)
  })
})

describe('init + add against the local registry', () => {
  let dir: string
  const logs: string[] = []
  const options = () => ({
    cwd: dir,
    registry,
    install: false,
    overwrite: false,
    log: (m: string) => logs.push(m),
  })

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'aui-cli-'))
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { expo: '57.0.0' } }))
    logs.length = 0
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('writes config, tamagui config and component source with dependencies', async () => {
    expect(detectPackageManager(dir)).toBe('npm')
    await initCommand(options())
    const config = JSON.parse(readFileSync(join(dir, 'advui.json'), 'utf8'))
    expect(config.framework).toBe('expo')
    expect(existsSync(join(dir, 'tamagui.config.ts'))).toBe(true)

    const { items } = await addCommand(['icon-button'], options())
    // Dependencies first: the hooks import utils (useBreakpoint reads utils/responsive).
    expect(items.map((i) => i.name)).toEqual(['utils', 'hooks', 'spinner', 'button', 'icon-button'])
    expect(existsSync(join(dir, 'ui/components/button/Button.tsx'))).toBe(true)
    // Button imports ../../utils/isTextContent, which must land next to it.
    expect(existsSync(join(dir, 'ui/utils/isTextContent.ts'))).toBe(true)
    // ...and ../../hooks/useRipple, with its Android file.
    expect(existsSync(join(dir, 'ui/hooks/useRipple.native.tsx'))).toBe(true)
    expect(existsSync(join(dir, 'ui/components/spinner/Spinner.native.tsx'))).toBe(true)
    expect(logs.join('\n')).toMatch(/npm install @advui\/icons/)

    // advui.json records what was installed, for `diff` and `update`.
    const recorded = (JSON.parse(readFileSync(join(dir, 'advui.json'), 'utf8')) as CliConfig).items!
    expect(Object.keys(recorded)).toEqual(['button', 'hooks', 'icon-button', 'spinner', 'utils'])
    const button = JSON.parse(readFileSync(join(registry, 'button.json'), 'utf8')) as RegistryItem
    expect(recorded.button!.version).toBe(button.version)
    expect(recorded.button!.files['components/button/Button.tsx']).toBe(
      hashContent(readFileSync(join(dir, 'ui/components/button/Button.tsx'), 'utf8')),
    )
  })

  it('reads a registry whose items carry file hashes and a snapshot of their version', () => {
    const index = JSON.parse(readFileSync(join(registry, 'index.json'), 'utf8')) as RegistryIndex
    for (const dir of [registry, join(registry, index.version)]) {
      const button = JSON.parse(readFileSync(join(dir, 'button.json'), 'utf8')) as RegistryItem
      expect(button.version).toBe(index.version)
      for (const file of button.files) expect(file.sha256).toBe(hashContent(file.content))
    }
  })

  it('does not overwrite existing files unless asked', async () => {
    await addCommand(['badge'], options())
    const file = join(dir, 'ui/components/badge/Badge.tsx')
    writeFileSync(file, '// customised')
    const { skipped } = await addCommand(['badge'], options())
    expect(skipped.length).toBeGreaterThan(0)
    expect(readFileSync(file, 'utf8')).toBe('// customised')
    await addCommand(['badge'], { ...options(), overwrite: true })
    expect(readFileSync(file, 'utf8')).not.toBe('// customised')
  })
})

const text = (...lines: string[]) => lines.map((line) => `${line}\n`).join('')
const ten = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
/** `ten` with one line replaced. */
const edit = (at: number, value: string) => text(...ten.map((line, i) => (i === at ? value : line)))

describe('diffLines', () => {
  // Length of the longest common subsequence, by dynamic programming.
  const lcs = (a: string[], b: string[]) => {
    const row = new Array<number>(b.length + 1).fill(0)
    for (const line of a) {
      let diagonal = 0
      for (let j = 1; j <= b.length; j++) {
        const above = row[j]!
        row[j] = line === b[j - 1] ? diagonal + 1 : Math.max(above, row[j - 1]!)
        diagonal = above
      }
    }
    return row[b.length]!
  }

  it('finds a shortest edit script', () => {
    let seed = 1
    const random = () => (seed = (seed * 48271) % 2147483647) / 2147483647
    const lines = () =>
      Array.from({ length: Math.floor(random() * 12) }, () => 'abc'[Math.floor(random() * 3)]!)
    for (let run = 0; run < 500; run++) {
      const a = lines()
      const b = lines()
      const edits = diffLines(a, b)
      expect(edits.flatMap((e) => (e.type === 'insert' ? [] : [a[e.a]]))).toEqual(a)
      expect(edits.flatMap((e) => (e.type === 'delete' ? [] : [b[e.b]]))).toEqual(b)
      const equal = edits.flatMap((e) => (e.type === 'equal' ? [e] : []))
      for (const e of equal) expect(a[e.a]).toBe(b[e.b])
      expect(equal.length).toBe(lcs(a, b))
    }
  })

  it('keeps line endings, so joining the lines gives the text back', () => {
    expect(splitLines('a\r\nb\n\nc')).toEqual(['a\r\n', 'b\n', '\n', 'c'])
    expect(splitLines('')).toEqual([])
  })
})

describe('unifiedDiff', () => {
  const labels = { a: 'a/x', b: 'b/x' }

  it('prints hunks with three lines of context', () => {
    expect(unifiedDiff('same\n', 'same\n', labels)).toBe('')
    const twenty = Array.from({ length: 20 }, (_, i) => `${i + 1}`)
    const changed = twenty.map((line) => (line === '2' ? 'two' : line === '18' ? 'eighteen' : line))
    expect(unifiedDiff(text(...twenty), text(...changed), labels)).toBe(
      text(
        '--- a/x',
        '+++ b/x',
        '@@ -1,5 +1,5 @@',
        ' 1',
        '-2',
        '+two',
        ' 3',
        ' 4',
        ' 5',
        '@@ -15,6 +15,6 @@',
        ' 15',
        ' 16',
        ' 17',
        '-18',
        '+eighteen',
        ' 19',
        ' 20',
      ),
    )
  })

  it('marks a missing final newline and an empty side', () => {
    expect(unifiedDiff('a\n', 'a\nb', labels)).toBe(
      text('--- a/x', '+++ b/x', '@@ -1 +1,2 @@', ' a', '+b', '\\ No newline at end of file'),
    )
    expect(unifiedDiff('', 'new\n', { a: '/dev/null', b: 'b/x' })).toBe(
      text('--- /dev/null', '+++ b/x', '@@ -0,0 +1 @@', '+new'),
    )
  })
})

describe('merge3', () => {
  const base = text(...ten)

  it('takes changes that only one side made', () => {
    expect(merge3(base, edit(1, 'two'), edit(8, 'nine'))).toEqual({
      text: text('1', 'two', '3', '4', '5', '6', '7', '8', 'nine', '10'),
      conflicts: 0,
    })
    expect(merge3(base, base, edit(8, 'nine')).text).toBe(edit(8, 'nine'))
    // An insertion on one side and a deletion on the other.
    expect(merge3(base, text('0', ...ten), text(...ten.slice(0, 9))).text).toBe(
      text('0', ...ten.slice(0, 9)),
    )
  })

  it('takes the same change on both sides once', () => {
    expect(merge3(base, edit(4, 'five'), edit(4, 'five')).text).toBe(edit(4, 'five'))
  })

  it('conflicts on different changes to the same or adjacent lines', () => {
    expect(merge3(base, edit(4, 'mine'), edit(4, 'theirs'))).toEqual({ text: null, conflicts: 1 })
    expect(merge3(base, edit(3, 'four'), edit(4, 'five')).conflicts).toBe(1)
    expect(merge3(base, text('a', ...ten), text('b', ...ten)).conflicts).toBe(1)
    expect(merge3(base, text('a', ...ten.slice(1)), edit(9, 'b')).text).toBe(
      text('a', ...ten.slice(1, 9), 'b'),
    )
  })
})

describe('diff and update against a local registry', () => {
  let root: string
  let app: string
  let source: string
  const logs: string[] = []
  const options = (extra: { overwrite?: boolean } = {}) => ({
    cwd: app,
    registry: source,
    install: false,
    overwrite: false,
    log: (m: string) => logs.push(m),
    ...extra,
  })

  /** Publishes a release as build-registry.mjs does: the latest files and a snapshot. */
  const publish = (
    version: string,
    items: Record<string, Record<string, string>>,
    registryDependencies: Record<string, string[]> = {},
  ) => {
    for (const dir of [source, join(source, version)]) {
      mkdirSync(dir, { recursive: true })
      for (const [name, files] of Object.entries(items)) {
        const item: RegistryItem = {
          name,
          title: name,
          type: 'registry:component',
          description: '',
          version,
          dependencies: [],
          peerDependencies: [],
          registryDependencies: registryDependencies[name] ?? [],
          files: Object.entries(files).map(([path, content]) => ({
            path,
            type: 'registry:ui',
            sha256: hashContent(content),
            content,
          })),
        }
        writeFileSync(join(dir, `${name}.json`), JSON.stringify(item))
      }
    }
  }
  const local = (file: string) => join(app, 'ui/components', file)
  const read = (file: string) => readFileSync(local(file), 'utf8')
  const write = (file: string, content: string) => writeFileSync(local(file), content)
  const recorded = () =>
    (JSON.parse(readFileSync(join(app, 'advui.json'), 'utf8')) as CliConfig).items ?? {}
  const statuses = (plans: ItemPlan[]) =>
    Object.fromEntries(
      plans.flatMap((plan) =>
        plan.files.map((file) => [file.path.replace('components/', ''), file.status]),
      ),
    )

  const v1 = {
    'components/widget/Same.tsx': text('same'),
    'components/widget/Upstream.tsx': text(...ten),
    'components/widget/Local.tsx': text(...ten),
    'components/widget/Merge.tsx': text(...ten),
  }
  const v2 = {
    ...v1,
    'components/widget/Upstream.tsx': edit(4, 'five'),
    'components/widget/Merge.tsx': edit(8, 'nine'),
  }
  const merged = text('1', 'two', '3', '4', '5', '6', '7', '8', 'nine', '10')

  beforeEach(async () => {
    root = mkdtempSync(join(tmpdir(), 'aui-sync-'))
    app = join(root, 'app')
    source = join(root, 'registry')
    mkdirSync(app)
    writeFileSync(join(app, 'package.json'), JSON.stringify({ dependencies: { expo: '57.0.0' } }))
    publish('1.0.0', { widget: v1 })
    await addCommand(['widget'], options())
    write('widget/Local.tsx', edit(0, 'one'))
    write('widget/Merge.tsx', edit(1, 'two'))
    logs.length = 0
  })
  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('diff reports which side changed each file and prints upstream against local', async () => {
    publish('2.0.0', { widget: v2 })
    const plans = await diffCommand([], options())
    expect(statuses(plans)).toEqual({
      'widget/Same.tsx': 'unchanged',
      'widget/Upstream.tsx': 'upstream',
      'widget/Local.tsx': 'local',
      'widget/Merge.tsx': 'both',
    })
    const output = logs.join('\n')
    expect(output).toContain('widget 1.0.0 → 2.0.0')
    expect(output).toMatch(/changed in both +ui\/components\/widget\/Merge\.tsx \(merges cleanly\)/)
    expect(output).toContain(
      text(
        '--- a/ui/components/widget/Upstream.tsx',
        '+++ b/ui/components/widget/Upstream.tsx',
        '@@ -2,7 +2,7 @@',
        ' 2',
        ' 3',
        ' 4',
        '-5',
        '+five',
      ),
    )
    expect(read('widget/Upstream.tsx')).toBe(text(...ten))
  })

  it('update takes upstream changes, keeps local ones and merges changes on both sides', async () => {
    publish('2.0.0', { widget: v2 })
    // A CRLF checkout of an untouched file is still untouched, and stays CRLF.
    write('widget/Upstream.tsx', text(...ten).replace(/\n/g, '\r\n'))
    const { conflicts } = await updateCommand([], options())
    expect(conflicts).toEqual([])
    expect(read('widget/Upstream.tsx')).toBe(edit(4, 'five').replace(/\n/g, '\r\n'))
    expect(read('widget/Local.tsx')).toBe(edit(0, 'one'))
    expect(read('widget/Merge.tsx')).toBe(merged)
    expect(recorded().widget).toEqual({
      version: '2.0.0',
      files: Object.fromEntries(Object.entries(v2).map(([path, c]) => [path, hashContent(c)])),
    })
    expect(logs).toContain('  ~ ui/components/widget/Merge.tsx (merged with your changes)')

    // Only the local changes are left.
    expect(statuses(await diffCommand(['widget'], options()))).toEqual({
      'widget/Same.tsx': 'unchanged',
      'widget/Upstream.tsx': 'unchanged',
      'widget/Local.tsx': 'local',
      'widget/Merge.tsx': 'local',
    })
  })

  it('update leaves an item with conflicts as it is, unless --overwrite', async () => {
    publish('1.0.0', { widget: v1, gadget: { 'components/gadget/Gadget.tsx': text(...ten) } })
    await addCommand(['gadget'], options())
    write('gadget/Gadget.tsx', edit(4, 'mine'))
    publish('2.0.0', { widget: v2, gadget: { 'components/gadget/Gadget.tsx': edit(4, 'theirs') } })
    logs.length = 0

    const { conflicts } = await updateCommand([], options())
    expect(conflicts).toEqual(['ui/components/gadget/Gadget.tsx'])
    expect(logs).toContain('  ! ui/components/gadget/Gadget.tsx (1 overlapping change)')
    expect(read('gadget/Gadget.tsx')).toBe(edit(4, 'mine'))
    expect(recorded().gadget!.version).toBe('1.0.0')
    // Items without conflicts are updated all the same.
    expect(read('widget/Merge.tsx')).toBe(merged)
    expect(recorded().widget!.version).toBe('2.0.0')

    const overwritten = await updateCommand(['gadget'], options({ overwrite: true }))
    expect(overwritten.conflicts).toEqual([])
    expect(read('gadget/Gadget.tsx')).toBe(edit(4, 'theirs'))
    expect(recorded().gadget!.version).toBe('2.0.0')
  })

  it('update adds new files and dependencies, and removes files upstream dropped', async () => {
    const { 'components/widget/Same.tsx': _dropped, ...kept } = v2
    publish(
      '2.0.0',
      {
        widget: { ...kept, 'components/widget/New.tsx': text('new') },
        helper: { 'components/helper/Helper.tsx': text('help') },
      },
      { widget: ['helper'] },
    )
    expect(statuses(await diffCommand(['widget'], options()))).toMatchObject({
      'widget/Same.tsx': 'upstream',
      'widget/New.tsx': 'upstream',
    })
    expect(logs).toContain('helper 2.0.0: not installed (`advui update` adds it)')

    await updateCommand(['widget'], options())
    expect(existsSync(local('widget/Same.tsx'))).toBe(false)
    expect(read('widget/New.tsx')).toBe(text('new'))
    expect(read('helper/Helper.tsx')).toBe(text('help'))
    expect(Object.keys(recorded())).toEqual(['helper', 'widget'])
    expect(logs).toContain('Added helper 2.0.0')
  })

  it('merges only against the installed copy itself', async () => {
    const mergeConflict = async () => {
      const [plan] = await diffCommand([], options())
      return plan!.files.find((file) => file.path.endsWith('Merge.tsx'))!.conflict
    }
    // A snapshot rebuilt since the install no longer holds the installed copy…
    publish('1.0.0', { widget: { 'components/widget/Merge.tsx': text('rebuilt') } })
    publish('2.0.0', { widget: v2 })
    expect(await mergeConflict()).toBe('the registry has no copy of 1.0.0 to merge with')
    // …and an older registry has no snapshot at all.
    rmSync(join(source, '1.0.0'), { recursive: true })
    expect(await mergeConflict()).toBe('the registry has no copy of 1.0.0 to merge with')
    expect((await updateCommand([], options())).conflicts).toEqual([
      'ui/components/widget/Merge.tsx',
    ])
  })

  it('add keeps the record of files it skips, so update can still merge them', async () => {
    publish('2.0.0', { widget: v2 })
    await addCommand(['widget'], options())
    expect(recorded().widget!.version).toBe('1.0.0')
    await updateCommand([], options())
    expect(read('widget/Merge.tsx')).toBe(merged)
  })

  it('compares components added before advui.json recorded them', async () => {
    const config = JSON.parse(readFileSync(join(app, 'advui.json'), 'utf8')) as CliConfig
    delete config.items
    writeFileSync(join(app, 'advui.json'), JSON.stringify(config))
    await diffCommand([], options())
    expect(logs.join('\n')).toMatch(/records no items yet/)

    // Named, they are compared, but without a record a difference cannot be merged.
    const [plan] = await diffCommand(['widget'], options())
    expect(statuses([plan!])).toEqual({
      'widget/Same.tsx': 'unchanged',
      'widget/Upstream.tsx': 'unchanged',
      'widget/Local.tsx': 'both',
      'widget/Merge.tsx': 'both',
    })
    expect((await updateCommand(['widget'], options())).conflicts).toHaveLength(2)
    // Once they match upstream, update records them.
    write('widget/Local.tsx', text(...ten))
    write('widget/Merge.tsx', text(...ten))
    expect((await updateCommand(['widget'], options())).conflicts).toEqual([])
    expect(recorded().widget!.version).toBe('1.0.0')
  })
})
