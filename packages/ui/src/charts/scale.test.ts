import { describe, expect, it } from 'vitest'
import { arcPath, bandScale, barPath, linearScale, niceTicks } from './scale'

describe('niceTicks', () => {
  it('covers the range with round steps', () => {
    expect(niceTicks(0, 311000)).toEqual([0, 100000, 200000, 300000, 400000])
    expect(niceTicks(0, 1.86)).toEqual([0, 0.5, 1, 1.5, 2])
    expect(niceTicks(-12, 38)).toEqual([-20, 0, 20, 40])
  })

  it('handles a flat or empty range', () => {
    expect(niceTicks(0, 0)).toEqual([0, 1])
    expect(niceTicks(5, 5)[0]).toBe(0)
    expect(niceTicks(Number.NaN, 3)).toEqual([0])
  })
})

describe('scales', () => {
  it('maps linearly and into bands', () => {
    const y = linearScale([0, 100], [200, 0])
    expect(y(0)).toBe(200)
    expect(y(50)).toBe(100)
    const band = bandScale(4, [0, 400])
    expect(band.bandwidth).toBe(100)
    expect(band.band(2)).toBe(200)
  })
})

describe('paths', () => {
  it('rounds only the data end of a bar', () => {
    expect(barPath(0, 0, 20, 100, 4, 'up')).toBe('M0,100V4Q0,0 4,0H16Q20,0 20,4V100Z')
    expect(barPath(0, 0, 0, 100, 4, 'up')).toBe('')
  })

  it('draws slices and full circles', () => {
    expect(arcPath(50, 50, 40, 0, 0, Math.PI / 2)).toMatch(/^M50,50L50,10A40,40 0 0 1 90,50Z$/)
    // A full ring is two half arcs, so it does not collapse to nothing.
    expect(arcPath(50, 50, 40, 20, 0, Math.PI * 2).match(/A/g)).toHaveLength(4)
  })
})
