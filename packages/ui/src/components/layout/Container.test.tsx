import { breakpoints } from '@advui/theme'
import type { ReactElement } from 'react'
import { View, styled } from 'tamagui'
import { describe, expect, it } from 'vitest'
import { renderWithProvider } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Container } from './Container'

// The 0.8.0 Container: output without the new props must not change.
const LegacyContainer = styled(View, {
  name: 'Container',
  width: '100%',
  marginHorizontal: 'auto',
  paddingHorizontal: '$4',
  $md: { paddingHorizontal: '$6' },
  $lg: { paddingHorizontal: '$8' },
  variants: {
    size: {
      sm: { maxWidth: breakpoints.sm },
      md: { maxWidth: breakpoints.md },
      lg: { maxWidth: breakpoints.lg },
      xl: { maxWidth: breakpoints.xl },
      full: { maxWidth: '100%' },
    },
  } as const,
  defaultVariants: { size: 'xl' },
})

/** CSS declarations that apply to an element, keyed by media query (`''` without one). */
function css(element: ReactElement) {
  const view = renderWithProvider(element)
  const node = view.getByTestId('container')
  const classes = [...node.classList].map((c) => `.${c}`)
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
  view.unmount()
  return result
}

const md = '(min-width: 768px)'
const lg = '(min-width: 1024px)'
const padding = (style: Record<string, string> | undefined) => ({
  left: style?.['padding-left'],
  right: style?.['padding-right'],
})
const space = (token: number) => ({
  left: `var(--t-space-${token})`,
  right: `var(--t-space-${token})`,
})

describe('Container', () => {
  it('renders the same CSS as before by default', () => {
    for (const size of [undefined, 'sm', 'lg', 'full'] as const) {
      expect(css(<Container testID="container" size={size} />)).toEqual(
        css(<LegacyContainer testID="container" size={size} />),
      )
    }
    expect(css(<Container testID="container" gutter={undefined} />)).toEqual(
      css(<LegacyContainer testID="container" />),
    )
  })

  it('takes a gutter token or map, replacing the default at every breakpoint', () => {
    const none = css(<Container testID="container" gutter="$0" />)
    expect(padding(none[''])).toEqual(space(0))
    expect(none[md]).toBeUndefined()
    expect(none[lg]).toBeUndefined()

    const custom = css(<Container testID="container" gutter={{ base: '$2', md: '$12' }} />)
    expect(padding(custom[''])).toEqual(space(2))
    expect(padding(custom[md])).toEqual(space(12))
    expect(custom[lg]).toBeUndefined()
  })

  it('centers its content and has an xxl size', () => {
    expect(css(<Container testID="container" centerContent />)['']).toMatchObject({
      'align-items': 'center',
    })
    expect(css(<Container testID="container" size="xxl" />)['']).toMatchObject({
      'max-width': `${breakpoints.xxl}px`,
    })
  })

  it('still renders its children', () => {
    const view = renderWithProvider(
      <Container>
        <Text>Page</Text>
      </Container>,
    )
    expect(view.getByText('Page')).toBeInTheDocument()
  })
})
