import { describe, expect, it } from 'vitest'
import { resolveResponsive, responsiveStyle } from './responsive'

describe('responsiveStyle', () => {
  it('turns a plain value into the base style', () => {
    expect(responsiveStyle('flexDirection', 'row')).toEqual({ flexDirection: 'row' })
  })

  it('emits only the breakpoints given, mobile-first', () => {
    expect(responsiveStyle('flexDirection', { base: 'column', md: 'row' })).toEqual({
      flexDirection: 'column',
      $md: { flexDirection: 'row' },
    })
    expect(responsiveStyle('gap', { sm: '$2', xl: '$6' })).toEqual({
      $sm: { gap: '$2' },
      $xl: { gap: '$6' },
    })
  })

  it('leaves out the base without one', () => {
    expect(responsiveStyle('flexWrap', { lg: 'wrap' })).not.toHaveProperty('flexWrap')
  })

  it('maps values with a record or a function', () => {
    const align = { start: 'flex-start', end: 'flex-end' }
    expect(responsiveStyle('alignItems', { base: 'start', md: 'center' }, align)).toEqual({
      alignItems: 'flex-start',
      $md: { alignItems: 'center' },
    })
    expect(responsiveStyle('width', { base: 1, md: 2 }, (n: number) => `${n * 50}%`)).toEqual({
      width: '50%',
      $md: { width: '100%' },
    })
  })

  it('returns nothing for undefined', () => {
    expect(responsiveStyle('flexDirection', undefined)).toEqual({})
  })
})

describe('resolveResponsive', () => {
  it('cascades from the nearest smaller breakpoint', () => {
    const value = { base: 1, sm: 2, lg: 4 }
    expect(resolveResponsive(value, 'base')).toBe(1)
    expect(resolveResponsive(value, 'xs')).toBe(1)
    expect(resolveResponsive(value, 'md')).toBe(2)
    expect(resolveResponsive(value, 'xxl')).toBe(4)
  })

  it('is undefined below the first breakpoint of a map without base', () => {
    expect(resolveResponsive({ md: 'row' }, 'sm')).toBeUndefined()
    expect(resolveResponsive({ md: 'row' }, 'lg')).toBe('row')
  })

  it('applies a plain value everywhere', () => {
    expect(resolveResponsive('row', 'xl')).toBe('row')
  })
})
