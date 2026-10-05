import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderWithProvider } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Sticky } from './Sticky'

/** CSS declarations that apply to the element (no media queries here). */
function css(element: ReactElement) {
  const view = renderWithProvider(element)
  const node = view.getByTestId('sticky')
  const classes = [...node.classList].map((c) => `.${c}`)
  const result: Record<string, string> = {}
  for (const sheet of Array.from(document.styleSheets))
    for (const rule of Array.from(sheet.cssRules))
      if (
        rule instanceof CSSStyleRule &&
        classes.includes(rule.selectorText.split(' ').pop() ?? '')
      )
        for (let i = 0; i < rule.style.length; i++) {
          const name = rule.style.item(i)
          result[name] = rule.style.getPropertyValue(name)
        }
  view.unmount()
  return result
}

describe('Sticky on web', () => {
  it('sticks to the top at the sticky level by default', () => {
    expect(
      css(
        <Sticky testID="sticky">
          <Text>Header</Text>
        </Sticky>,
      ),
    ).toMatchObject({ position: 'sticky', top: '0px', 'z-index': 'var(--t-zIndex-sticky)' })
  })

  it('takes an edge and an offset', () => {
    expect(css(<Sticky testID="sticky" edge="bottom" offset="$4" />)).toMatchObject({
      position: 'sticky',
      bottom: 'var(--t-space-4)',
    })
  })
})
