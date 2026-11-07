import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { PNG } from 'pngjs'
import { comparePngs, findChanges, hasShots, writeReport } from './changes.mjs'
import { findView, listScreens } from './screens.mjs'

/** A small solid image, with one pixel in another color if `marked`. */
function png({ width = 4, height = 4, marked = false } = {}) {
  const image = new PNG({ width, height })
  image.data.fill(255)
  if (marked) image.data.set([255, 0, 0, 255], 0)
  return PNG.sync.write(image)
}

function folderWith(shots) {
  const folder = mkdtempSync(join(tmpdir(), 'advui-screenshots-'))
  for (const [name, data] of Object.entries(shots)) {
    mkdirSync(dirname(join(folder, name)), { recursive: true })
    writeFileSync(join(folder, name), data)
  }
  return folder
}

describe('listScreens', () => {
  const components = [
    { slug: 'button', platforms: ['web', 'ios', 'android'], examples: [{ name: 'basic' }] },
    { slug: 'tooltip', platforms: ['web'], examples: [{ name: 'basic' }] },
  ]
  const screens = listScreens(components, [{ slug: 'login' }])

  it('opens each example of a component by itself', () => {
    assert.ok(
      screens.some(
        ({ name, path }) => name === 'button--basic' && path === '/components/button?example=basic',
      ),
    )
  })

  it('opens the app examples, Home and Theme', () => {
    const paths = screens.map(({ path }) => path)
    for (const path of ['/', '/theme', '/examples/login']) assert.ok(paths.includes(path), path)
  })

  it('leaves out a component that renders nothing on phones', () => {
    assert.ok(!screens.some(({ name }) => name.startsWith('tooltip')))
  })
})

describe('findView', () => {
  const dump = `<?xml version='1.0'?><hierarchy>
    <node text="Continue" content-desc="" bounds="[100,200][300,240]" />
    <node text="" content-desc="Close" bounds="[600,1200][680,1280]" />
  </hierarchy>`

  it('finds a view by its text or its accessibility label', () => {
    assert.deepEqual(findView(dump, 'Continue'), { x: 200, y: 220 })
    assert.deepEqual(findView(dump, 'Close'), { x: 640, y: 1240 })
  })

  it('finds nothing for a label that is not on screen', () => {
    assert.equal(findView(dump, 'Reload'), null)
  })
})

describe('comparePngs', () => {
  it('counts no pixels between equal images', () => {
    assert.equal(comparePngs(png(), png()).pixels, 0)
  })

  it('counts a changed pixel and marks it', () => {
    const { pixels, marks } = comparePngs(png(), png({ marked: true }))
    assert.equal(pixels, 1)
    assert.ok(PNG.sync.read(marks))
  })

  it('takes a new size as a change of the whole image', () => {
    assert.equal(comparePngs(png(), png({ width: 8 })).pixels, 16)
  })
})

describe('findChanges', () => {
  const same = 'light/button--basic.png'
  const other = 'dark/button--basic.png'

  it('reports a changed screen', () => {
    const approved = folderWith({ [same]: png(), [other]: png() })
    const current = folderWith({ [same]: png(), [other]: png({ marked: true }) })
    const { changed, compared } = findChanges(approved, current)
    assert.deepEqual(
      changed.map(({ shot }) => shot),
      [other],
    )
    assert.equal(compared, 2)
  })

  it('does not take a new or removed screen for a change', () => {
    const approved = folderWith({ [same]: png(), 'light/gone.png': png() })
    const current = folderWith({ [same]: png(), 'light/new.png': png() })
    const { changed, added, removed } = findChanges(approved, current)
    assert.deepEqual(changed, [])
    assert.deepEqual(added, ['light/new.png'])
    assert.deepEqual(removed, ['light/gone.png'])
  })
})

describe('findChanges with a moving screen', () => {
  const moving = 'light/circular-progress--sizes.png'
  const still = 'light/button--basic.png'

  for (const run of ['approved', 'current']) {
    it(`does not compare a screen that moved in the ${run} run`, () => {
      const note = { 'moving.json': JSON.stringify([moving]) }
      const approved = folderWith({
        [moving]: png(),
        [still]: png(),
        ...(run === 'approved' ? note : {}),
      })
      const current = folderWith({
        [moving]: png({ marked: true }),
        [still]: png(),
        ...(run === 'current' ? note : {}),
      })
      const changes = findChanges(approved, current)
      assert.deepEqual(changes.changed, [])
      assert.deepEqual(changes.moving, [moving])
      assert.equal(changes.compared, 1)
    })
  }

  it('lists it in the summary', () => {
    const approved = folderWith({ [moving]: png(), 'moving.json': JSON.stringify([moving]) })
    const current = folderWith({ [moving]: png() })
    const report = mkdtempSync(join(tmpdir(), 'advui-report-'))

    const summary = writeReport(findChanges(approved, current), approved, current, report)

    assert.match(summary, /0 changed, 0 new, 0 removed, 1 not compared/)
    assert.match(summary, /never held still\n\n- light\/circular-progress--sizes\.png/)
    for (const folder of [approved, current, report]) rmSync(folder, { recursive: true })
  })
})

describe('writeReport', () => {
  it('keeps each change as it was, as it is, and marked', () => {
    const shot = 'dark/button--basic.png'
    const approved = folderWith({ [shot]: png() })
    const current = folderWith({ [shot]: png({ marked: true }) })
    const report = mkdtempSync(join(tmpdir(), 'advui-report-'))

    const summary = writeReport(findChanges(approved, current), approved, current, report)

    assert.match(summary, /Compared 1 screenshots: 1 changed/)
    assert.match(summary, /dark\/button--basic\.png: 1 pixels/)
    for (const kind of ['approved', 'current', 'difference'])
      assert.ok(readFileSync(join(report, 'dark', `button--basic.${kind}.png`)).length)
    assert.equal(readFileSync(join(report, 'summary.md'), 'utf8'), summary)
    for (const folder of [approved, current, report]) rmSync(folder, { recursive: true })
  })
})

describe('hasShots', () => {
  it('needs a folder with at least one screenshot', () => {
    assert.equal(hasShots(join(tmpdir(), 'advui-no-such-folder')), false)
    assert.equal(hasShots(folderWith({ 'light/home.png': png() })), true)
  })
})
