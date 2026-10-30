import { describe, expect, it } from 'vitest'
import { colorsOpacity, transformOpacity } from './transition'

describe('colorsOpacity', () => {
  it('names each color Tamagui writes on native, and opacity, but no layout', () => {
    const { preset, properties } = colorsOpacity('quick')
    const names = properties.split(', ')
    expect(preset).toBe('quick')
    // Native splits borderColor into sides, and a transition expands no shorthand.
    expect(names).toEqual(
      expect.arrayContaining([
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'opacity',
      ]),
    )
    expect(names).not.toContain('height')
    expect(names).not.toContain('all')
  })

  it('adds the extra properties a control moves', () => {
    expect(colorsOpacity('quick', 'transform').properties.split(', ')).toContain('transform')
  })
})

describe('transformOpacity', () => {
  it('keeps a missing preset, so reduced motion animates nothing', () => {
    expect(transformOpacity(null)).toBeNull()
    expect(transformOpacity('quick')).toEqual({ preset: 'quick', properties: 'transform, opacity' })
  })
})
