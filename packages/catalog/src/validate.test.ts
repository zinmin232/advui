import type { PartDoc, PropDoc } from '@advui/core/meta'
import { describe, expect, it } from 'vitest'
import { components } from './index'
import { literalUnion, validateMetadata } from './validate'

describe('component metadata', () => {
  it('passes every check', () => {
    expect(validateMetadata(components)).toEqual([])
  })

  it('lists the Stack props one per row, with closed options', () => {
    const stack = components.find((c) => c.slug === 'stack')?.parts.find((p) => p.name === 'Stack')
    const rows = Object.fromEntries((stack?.props ?? []).map((prop) => [prop.name, prop]))
    expect(Object.keys(rows)).toEqual([
      'flexDirection',
      'alignItems',
      'justifyContent',
      'flexWrap',
      'gap',
    ])
    expect(rows.flexDirection?.options).toEqual(['row', 'column', 'row-reverse', 'column-reverse'])
    expect(rows.alignItems?.options).toContain('baseline')
    expect(rows.justifyContent?.options).toContain('space-between')
    expect(rows.flexWrap?.options).toEqual(['nowrap', 'wrap', 'wrap-reverse'])
    expect(rows.gap?.token).toBe('space')
  })
})

describe('literalUnion', () => {
  it('reads quoted and numeric literals', () => {
    expect(literalUnion("'sm' | 'md'")).toEqual(['sm', 'md'])
    expect(literalUnion('1 | 2 | 3')).toEqual(['1', '2', '3'])
  })

  it('returns null for anything else', () => {
    expect(literalUnion('boolean')).toBeNull()
    expect(literalUnion("number | 'auto'")).toBeNull()
    expect(literalUnion("'row' | 'column' | …")).toBeNull()
  })
})

describe('validateMetadata', () => {
  const part = (props: PropDoc[], extra: Partial<PartDoc> = {}): PartDoc => ({
    name: 'Demo',
    props,
    children: { accepts: 'any' },
    ...extra,
  })
  const check = (...parts: PartDoc[]) => validateMetadata([{ slug: 'demo', parts }])
  const size: PropDoc = {
    name: 'size',
    type: "'sm' | 'md'",
    options: ['sm', 'md'],
    default: "'md'",
    description: 'Size.',
  }

  it('accepts a valid part', () => {
    expect(check(part([size]))).toEqual([])
  })

  it('names the meta, part and prop', () => {
    expect(check(part([{ ...size, options: ['sm', 'sm'] }]))).toContain(
      'demo › Demo › size: "options" repeats "sm"',
    )
  })

  it('needs a literal default to be one of the options', () => {
    expect(check(part([{ ...size, default: "'lg'" }]))).toEqual([
      'demo › Demo › size: default \'lg\' is not one of "options" [sm, md]',
    ])
    // A note is not a literal, so it is not checked.
    expect(check(part([{ ...size, default: 'from `trend`' }]))).toEqual([])
  })

  it('needs a literal union and its options to list the same values', () => {
    expect(check(part([{ ...size, options: ['sm', 'lg'] }]))).toHaveLength(2)
    expect(check(part([{ ...size, options: undefined }]))).toEqual([
      'demo › Demo › size: type "\'sm\' | \'md\'" is a closed list but has no "options"',
    ])
  })

  it('rejects combined rows and "…"', () => {
    const problems = check(
      part([
        { name: 'value / defaultValue', type: 'string', description: '' },
        { name: 'size', type: "'sm' | …", description: '' },
      ]),
      { name: 'Demo.Header / Footer', props: [], children: { accepts: 'any' } },
    )
    expect(problems).toHaveLength(3)
  })

  it('checks that child rules name existing parts', () => {
    const problems = check(
      part([], { children: { accepts: ['Demo.Item'] }, parents: ['Other'], within: 'Nowhere' }),
    )
    expect(problems).toEqual([
      'demo › Demo: "children.accepts" names unknown part "Demo.Item"',
      'demo › Demo: "parents" names unknown part "Other"',
      'demo › Demo: "within" names unknown part "Nowhere"',
    ])
  })

  it('checks min and max', () => {
    expect(check(part([], { children: { accepts: 'any', min: 2, max: 1 } }))).toEqual([
      'demo › Demo: "children.min" 2 is greater than "children.max" 1',
    ])
    expect(check(part([], { children: { accepts: 'any', max: 0 } }))).toEqual([
      'demo › Demo: "children.max" 0 is below 1; use accepts \'none\'',
    ])
    expect(
      check(part([{ name: 'columns', type: 'number', min: 4, max: 2, description: '' }])),
    ).toEqual(['demo › Demo › columns: "min" 4 is greater than "max" 2'])
  })

  it('needs child rules on components only', () => {
    expect(check(part([], { children: undefined }))).toEqual([
      'demo › Demo: has no "children" rules',
    ])
    expect(check({ name: 'useDemo', kind: 'hook', props: [] })).toEqual([])
  })
})
