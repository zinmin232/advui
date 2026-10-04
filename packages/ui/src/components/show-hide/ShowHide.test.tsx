import { breakpoints } from '@advui/theme'
import type { ReactElement } from 'react'
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, testConfig } from '../../../test/utils'
import { UniversalProvider } from '../../provider/UniversalProvider'
import { useBreakpoint, useBreakpointValue } from '../../hooks/useBreakpoint'
import { Text } from '../typography/Text'
import { Hide, Show } from './ShowHide'
import { rangeSteps } from './range'

/** `display` of the element around the text, keyed by media query (`''` without one). */
function display(element: ReactElement) {
  const view = renderWithProvider(element)
  const wrapper = view.getByText('content').parentElement as Element
  const classes = [...wrapper.classList].map((c) => `.${c}`)
  const result: Record<string, string> = {}
  const visit = (rules: CSSRuleList, media: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) visit(rule.cssRules, rule.media.mediaText)
      else if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText.split(' ').pop() ?? ''
        const value = rule.style.getPropertyValue('display')
        if (classes.includes(selector) && value) result[media] = value
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules, '')
  view.unmount()
  return result
}

const content = <Text>content</Text>
const at = (key: keyof typeof breakpoints) => `(min-width: ${breakpoints[key]}px)`

describe('rangeSteps', () => {
  it('turns a range into in / out of range per breakpoint', () => {
    expect(rangeSteps({ above: 'md' })).toEqual({ base: false, md: true })
    expect(rangeSteps({ below: 'md' })).toEqual({ base: true, md: false })
    expect(rangeSteps({ above: 'sm', below: 'lg' })).toEqual({ base: false, sm: true, lg: false })
  })
})

describe('Show and Hide on web', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows content from a breakpoint up with CSS, keeping it mounted', () => {
    expect(display(<Show above="md">{content}</Show>)).toEqual({
      '': 'none',
      [at('md')]: 'contents',
    })
    renderWithProvider(<Show above="xxl">{content}</Show>)
    // Hidden by CSS, but in the document: state survives a resize.
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows content below a breakpoint and inside a range', () => {
    expect(display(<Show below="md">{content}</Show>)).toEqual({
      '': 'contents',
      [at('md')]: 'none',
    })
    expect(
      display(
        <Show above="sm" below="lg">
          {content}
        </Show>,
      ),
    ).toEqual({
      '': 'none',
      [at('sm')]: 'contents',
      [at('lg')]: 'none',
    })
  })

  it('hides content in the range', () => {
    expect(display(<Hide below="sm">{content}</Hide>)).toEqual({
      '': 'none',
      [at('sm')]: 'contents',
    })
    expect(
      display(
        <Hide above="sm" below="lg">
          {content}
        </Hide>,
      ),
    ).toEqual({
      '': 'contents',
      [at('sm')]: 'none',
      [at('lg')]: 'contents',
    })
  })

  it('warns once about an empty range and never shows it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(
      display(
        <Show above="lg" below="sm">
          {content}
        </Show>,
      ),
    ).toEqual({ '': 'none' })
    expect(
      display(
        <Hide above="lg" below="sm">
          {content}
        </Hide>,
      ),
    ).toEqual({ '': 'contents' })
    expect(warn).toHaveBeenCalledOnce()
  })
})

describe('useBreakpoint and useBreakpointValue', () => {
  function Probe() {
    const breakpoint = useBreakpoint()
    const columns = useBreakpointValue({ base: 1, sm: 2, lg: 4 })
    return <Text>{`${breakpoint} ${columns}`}</Text>
  }

  it('report the largest matching breakpoint and its value', () => {
    const width = window.innerWidth
    const expected =
      (Object.entries(breakpoints) as [keyof typeof breakpoints, number][])
        .filter(([, min]) => width >= min)
        .pop()?.[0] ?? 'base'
    const columns = { base: 1, xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }[expected]
    renderWithProvider(<Probe />)
    expect(screen.getByText(`${expected} ${columns}`)).toBeInTheDocument()
  })

  it('hydrate without a mismatch: a phone first, then the real breakpoint', async () => {
    const app = (
      <UniversalProvider config={testConfig}>
        <Probe />
      </UniversalProvider>
    )
    const html = renderToString(app)
    // The server assumes a phone (mediaQueryDefaultActive: xs).
    expect(html).toContain('xs 1')
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const recoverable = vi.fn()
    await act(async () => {
      hydrateRoot(container, app, { onRecoverableError: recoverable })
    })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i)
    expect(container.textContent).not.toBe('xs 1')
    container.remove()
  })
})
