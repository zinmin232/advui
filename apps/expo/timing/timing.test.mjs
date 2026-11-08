import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { findOverBudget, parseReport, summarize } from './report.mjs'

const row = (screen, step, springs, timings = 0) => ({
  screen,
  step,
  frame: 120,
  settled: 480,
  springs,
  timings,
})

describe('parseReport', () => {
  it('reads the rows out of logcat lines', () => {
    const rows = [row('theme', 'mount', 0), row('theme', 'dark', 80)]
    const log = [
      '11-07 10:00:00.000  4242  4300 I ReactNativeJS: something else',
      ...rows.map(
        (entry) =>
          `11-07 10:00:01.000  4242  4300 I ReactNativeJS: advui-timing ${JSON.stringify(entry)}`,
      ),
      '11-07 10:00:02.000  4242  4300 I ReactNativeJS: advui-timing done',
    ].join('\r\n')
    assert.deepEqual(parseReport(log), rows)
  })

  it('stops at a run that failed', () => {
    const line = 'I ReactNativeJS: advui-timing failed: TypeError: undefined is not a function'
    assert.throws(() => parseReport(line), /\/timing failed: TypeError/)
  })

  it('waits for the end of the run', () => {
    const line = `I ReactNativeJS: advui-timing ${JSON.stringify(row('theme', 'dark', 80))}`
    assert.equal(parseReport(line), null)
    assert.equal(parseReport(''), null)
  })
})

describe('findOverBudget', () => {
  it('counts springs and timings together', () => {
    const budget = { theme: 100 }
    assert.deepEqual(findOverBudget([row('theme', 'dark', 100)], budget), [])
    const over = row('theme', 'dark', 90, 11)
    assert.deepEqual(findOverBudget([over], budget), [over])
  })

  it('finds no fault with a screen that has no budget yet', () => {
    assert.deepEqual(findOverBudget([row('new', 'dark', 9999)], {}), [])
  })
})

describe('summarize', () => {
  it('shows every step, with the budget of its screen', () => {
    const summary = summarize([row('theme', 'dark', 80), row('new', 'dark', 5)], { theme: 100 })
    assert.match(summary, /All 2 steps stayed within/)
    assert.match(summary, /\| theme \| dark \| 120 \| 480 \| 80 \| 0 \| 100 \|/)
    assert.match(summary, /\| new \| dark \| 120 \| 480 \| 5 \| 0 \| - \|/)
  })

  it('says how many steps went over', () => {
    const summary = summarize([row('theme', 'dark', 462), row('theme', 'light', 80)], { theme: 100 })
    assert.match(summary, /1 of 2 steps went over/)
  })
})
