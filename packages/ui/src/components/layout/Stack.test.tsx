import type { ReactElement } from 'react'
import { View, styled } from 'tamagui'
import { describe, expect, it } from 'vitest'
import { renderWithProvider } from '../../../test/utils'
import { Text } from '../typography/Text'
import { HStack, Stack, VStack, Wrap } from './Stack'

// The 0.8.0 stacks, before the responsive props: output must not change.
const LegacyStack = styled(View, { name: 'Stack', flexDirection: 'column' })
const LegacyHStack = styled(LegacyStack, {
  name: 'HStack',
  flexDirection: 'row',
  alignItems: 'center',
})
const LegacyVStack = styled(LegacyStack, { name: 'VStack', flexDirection: 'column' })

function html(element: ReactElement) {
  const view = renderWithProvider(element)
  const out = view.container.innerHTML
  view.unmount()
  return out
}

/** CSS declarations that apply to an element, keyed by media query (`''` without one). */
function cssFor(element: Element) {
  const classes = [...element.classList].map((c) => `.${c}`)
  const result: Record<string, Record<string, string>> = {}
  const visit = (rules: CSSRuleList, media: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) visit(rule.cssRules, rule.media.mediaText)
      else if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText.split(' ').pop() ?? ''
        if (!classes.includes(selector)) continue
        for (let i = 0; i < rule.style.length; i++) {
          const name = rule.style.item(i)
          ;(result[media] ??= {})[name] = rule.style.getPropertyValue(name)
        }
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules, '')
  return result
}

function css(element: ReactElement) {
  const view = renderWithProvider(element)
  const out = cssFor(view.getByTestId('stack'))
  view.unmount()
  return out
}

const md = '(min-width: 768px)'
const lg = '(min-width: 1024px)'

describe('Stack responsive props', () => {
  it('renders exactly as before when they are not used', () => {
    const child = <Text>Item</Text>
    expect(html(<Stack gap="$2">{child}</Stack>)).toBe(
      html(<LegacyStack gap="$2">{child}</LegacyStack>),
    )
    expect(html(<HStack gap="$2">{child}</HStack>)).toBe(
      html(<LegacyHStack gap="$2">{child}</LegacyHStack>),
    )
    expect(html(<VStack padding="$4">{child}</VStack>)).toBe(
      html(<LegacyVStack padding="$4">{child}</LegacyVStack>),
    )
    expect(
      html(
        <Stack flexDirection="row" $md={{ flexDirection: 'column' }} items="center">
          {child}
        </Stack>,
      ),
    ).toBe(
      html(
        <LegacyStack flexDirection="row" $md={{ flexDirection: 'column' }} items="center">
          {child}
        </LegacyStack>,
      ),
    )
  })

  it('direction map renders the same as flexDirection with a media prop', () => {
    expect(css(<Stack testID="stack" direction={{ base: 'column', md: 'row' }} />)).toEqual(
      css(<Stack testID="stack" flexDirection="column" $md={{ flexDirection: 'row' }} />),
    )
  })

  it('maps align and distribute to flex values', () => {
    const style = css(
      <Stack
        testID="stack"
        direction="row"
        wrap="wrap"
        align={{ base: 'start', md: 'baseline' }}
        distribute={{ base: 'between', lg: 'evenly' }}
      />,
    )
    expect(style['']).toMatchObject({
      'flex-direction': 'row',
      'flex-wrap': 'wrap',
      'align-items': 'flex-start',
      'justify-content': 'space-between',
    })
    expect(style[md]).toMatchObject({ 'align-items': 'baseline' })
    expect(style[lg]).toMatchObject({ 'justify-content': 'space-evenly' })
  })

  it('emits only the breakpoints given', () => {
    const style = css(<Stack testID="stack" direction={{ md: 'row' }} />)
    // No base value: the Stack's own column applies below md.
    expect(style['']?.['flex-direction']).toBe('column')
    expect(style[md]).toEqual({ 'flex-direction': 'row' })
  })

  it('lets raw style props win, in either order', () => {
    for (const element of [
      <Stack testID="stack" direction="row" flexDirection="column-reverse" />,
      <Stack testID="stack" flexDirection="column-reverse" direction="row" />,
    ]) {
      expect(css(element)['']?.['flex-direction']).toBe('column-reverse')
    }
    // A shorthand counts as the raw prop.
    expect(css(<Stack testID="stack" items="flex-end" align="center" />)['']?.['align-items']).toBe(
      'flex-end',
    )
    // A media prop wins at its breakpoint; the responsive value keeps the others.
    const style = css(
      <Stack
        testID="stack"
        $md={{ flexDirection: 'column-reverse' }}
        direction={{ base: 'column', md: 'row', lg: 'row-reverse' }}
      />,
    )
    expect(style[md]).toEqual({ 'flex-direction': 'column-reverse' })
    expect(style[lg]).toEqual({ 'flex-direction': 'row-reverse' })
  })

  it("overrides a stack's own default", () => {
    expect(css(<HStack testID="stack" direction="column" align="end" />)['']).toMatchObject({
      'flex-direction': 'column',
      'align-items': 'flex-end',
    })
    expect(css(<VStack testID="stack" direction="row" />)['']?.['flex-direction']).toBe('row')
  })

  it('still passes the old text-direction values to the direction style', () => {
    // @ts-expect-error: no longer typed, kept for apps written before 0.9.0
    const style = css(<Stack testID="stack" direction="rtl" />)['']
    expect(style).toMatchObject({ direction: 'rtl', 'flex-direction': 'column' })
  })

  it('works through styled()', () => {
    const Toolbar = styled(Stack, { name: 'Toolbar', direction: 'row', distribute: 'between' })
    expect(css(<Toolbar testID="stack" />)['']).toMatchObject({
      'flex-direction': 'row',
      'justify-content': 'space-between',
    })
  })
})

describe('Wrap', () => {
  it('is a centered row that wraps, with a $2 gap', () => {
    const style = css(<Wrap testID="stack" />)['']
    expect(style).toMatchObject({
      'flex-direction': 'row',
      'flex-wrap': 'wrap',
      'align-items': 'center',
    })
    expect(style?.gap ?? style?.['row-gap']).toBeTruthy()
  })

  it('takes align, distribute and its own gap', () => {
    const style = css(<Wrap testID="stack" align="start" distribute="center" gap="$4" />)['']
    expect(style).toMatchObject({ 'align-items': 'flex-start', 'justify-content': 'center' })
  })
})
