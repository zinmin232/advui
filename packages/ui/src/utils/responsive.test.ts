import { describe, expect, it } from 'vitest'
import {
  flatValue,
  mergeResponsiveStyles,
  resolveResponsive,
  responsiveStyle,
  when,
} from './responsive'

describe('responsiveStyle', () => {
  it('turns a plain value into the base style', () => {
    expect(responsiveStyle('flexDirection', 'row')).toEqual({ flexDirection: 'row' })
  })

  it('emits only the breakpoints given, mobile-first', () => {
    expect(responsiveStyle('flexDirection', { base: 'column', md: 'row' })).toEqual({
      flexDirection: { default: 'column', md: 'row' },
    })
    expect(responsiveStyle('gap', { sm: '2', xl: '6' })).toEqual({
      gap: { sm: '2', xl: '6' },
    })
  })

  it('leaves out the base without one', () => {
    expect(responsiveStyle('flexWrap', { lg: 'wrap' })).toEqual({ flexWrap: { lg: 'wrap' } })
  })

  it('maps values with a record or a function', () => {
    const align = { start: 'flex-start', end: 'flex-end' }
    expect(responsiveStyle('alignItems', { base: 'start', md: 'center' }, align)).toEqual({
      alignItems: { default: 'flex-start', md: 'center' },
    })
    expect(responsiveStyle('width', { base: 1, md: 2 }, (n: number) => `${n * 50}%`)).toEqual({
      width: { default: '50%', md: '100%' },
    })
  })

  it('returns nothing for undefined', () => {
    expect(responsiveStyle('flexDirection', undefined)).toEqual({})
  })
})

describe('mergeResponsiveStyles', () => {
  it('joins conditional values per property, keeping a plain one as the default', () => {
    expect(
      mergeResponsiveStyles(
        { width: '100%', opacity: 1 },
        { width: { md: '50%' } },
        when('hover', { opacity: 0.8 }),
      ),
    ).toEqual({ width: { default: '100%', md: '50%' }, opacity: { default: 1, hover: 0.8 } })
  })

  it('lets a later plain value replace the property', () => {
    expect(mergeResponsiveStyles({ width: { default: '100%', md: '50%' } }, { width: 10 })).toEqual({
      width: 10,
    })
  })

  it('treats a shadow offset as a value, not as conditions', () => {
    const shadowOffset = { width: 0, height: 2 }
    expect(mergeResponsiveStyles({ shadowOffset }, { shadowRadius: 4 })).toEqual({
      shadowOffset,
      shadowRadius: 4,
    })
  })
})

describe('flatValue', () => {
  it('joins the parts that are set', () => {
    expect(flatValue('transparent', false && 'hover:accent', 'press:accentHover')).toBe(
      'transparent press:accentHover',
    )
    expect(flatValue(undefined, false)).toBeUndefined()
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
