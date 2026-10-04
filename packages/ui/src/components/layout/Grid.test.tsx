import { Children, type ReactNode, isValidElement } from 'react'
import { type SpaceTokens, type Token, View, type ViewProps, getTokenValue } from 'tamagui'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Grid, GridItem, type ResponsiveColumns, gridCellLayout } from './Grid'

const third = `${100 / 3}%`
const twoThirds = `${200 / 3}%`

describe('gridCellLayout', () => {
  it('gives a cell span / columns of the row', () => {
    expect(gridCellLayout(12)).toEqual({ width: `${100 / 12}%` })
    expect(gridCellLayout(12, 8)).toEqual({ width: twoThirds })
    expect(gridCellLayout(12, 4)).toEqual({ width: third })
    expect(gridCellLayout(3, 1)).toEqual({ width: third })
  })

  it('cascades mobile-first and emits only the breakpoints that change', () => {
    expect(gridCellLayout(12, { base: 12, md: 8 })).toEqual({
      width: '100%',
      $md: { width: twoThirds },
    })
    // A map without base is the full row below its first breakpoint, like Bootstrap's col-md-6.
    expect(gridCellLayout(12, { md: 6 })).toEqual({ width: '100%', $md: { width: '50%' } })
    expect(gridCellLayout(12, { sm: 6, lg: 4 })).toEqual({
      width: '100%',
      $sm: { width: '50%' },
      $lg: { width: third },
    })
    // A number, or no span at all, is the same at every breakpoint.
    expect(gridCellLayout(12, 6)).toEqual({ width: '50%' })
    expect(gridCellLayout(12)).toEqual({ width: `${100 / 12}%` })
    // sm repeats base and xl repeats lg, so neither is emitted.
    expect(gridCellLayout(12, { base: 12, sm: 12, lg: 3, xl: 3 })).toEqual({
      width: '100%',
      $lg: { width: '25%' },
    })
  })

  it("covers every column with 'full', at each breakpoint's column count", () => {
    expect(gridCellLayout(12, 'full')).toEqual({ width: '100%' })
    expect(gridCellLayout({ base: 4, md: 12 }, 'full')).toEqual({ width: '100%' })
    expect(gridCellLayout({ base: 4, md: 12 }, { base: 'full', md: 4 })).toEqual({
      width: '100%',
      $md: { width: third },
    })
  })

  it("sizes 'auto' cells to their content, capped at the row", () => {
    expect(gridCellLayout(12, 'auto')).toEqual({ width: 'auto', maxWidth: '100%' })
    expect(gridCellLayout(12, { base: 12, md: 'auto', lg: 6, xl: 'auto' })).toEqual({
      width: '100%',
      $md: { width: 'auto', maxWidth: '100%' },
      $lg: { width: '50%' },
      // The cap from md still applies.
      $xl: { width: 'auto' },
    })
  })

  it('recomputes the width where only the column count changes', () => {
    expect(gridCellLayout({ base: 4, md: 12 }, 2)).toEqual({
      width: '50%',
      $md: { width: `${200 / 12}%` },
    })
    // Same share at both counts: nothing to emit at md.
    expect(gridCellLayout({ base: 2, md: 4 }, { base: 1, md: 2 })).toEqual({ width: '50%' })
  })

  it('clamps span and offset to the column count', () => {
    expect(gridCellLayout(4, 8)).toEqual({ width: '100%' })
    expect(gridCellLayout({ base: 4, md: 12 }, 8)).toEqual({
      width: '100%',
      $md: { width: twoThirds },
    })
    expect(gridCellLayout(12, 0)).toEqual({ width: `${100 / 12}%` })
    expect(gridCellLayout(12, -3)).toEqual({ width: `${100 / 12}%` })
    expect(gridCellLayout(12, Number.NaN)).toEqual({ width: `${100 / 12}%` })
    // The offset leaves room for the span in the same row.
    expect(gridCellLayout(12, 8, 6)).toEqual({ width: twoThirds, marginInlineStart: third })
    expect(gridCellLayout(12, 4, -2)).toEqual({ width: third })
    expect(gridCellLayout(12, 'full', 3)).toEqual({ width: '100%' })
    expect(gridCellLayout(12, 'auto', 20)).toEqual({
      width: 'auto',
      maxWidth: '100%',
      marginInlineStart: `${1100 / 12}%`,
    })
  })

  it('never returns widths over 100% or negative margins', () => {
    const values = [-5, 0, 1, 3, 7, 12, 40, 'full', 'auto'] as const
    for (const columns of [1, 2, 5, 12, 0, -1]) {
      for (const span of values) {
        for (const offset of [-4, 0, 2, 11, 30]) {
          const layout = gridCellLayout(columns, span, offset)
          const width = layout.width === 'auto' ? 0 : Number.parseFloat(layout.width ?? '')
          const margin = Number.parseFloat(String(layout.marginInlineStart ?? 0))
          expect(width).toBeGreaterThanOrEqual(0)
          expect(width).toBeLessThanOrEqual(100)
          expect(margin).toBeGreaterThanOrEqual(0)
          expect(width + margin).toBeLessThanOrEqual(100 + 1e-9)
        }
      }
    }
  })

  it('offsets with marginInlineStart, per breakpoint, back to zero', () => {
    expect(gridCellLayout(12, 6, 3)).toEqual({ width: '50%', marginInlineStart: '25%' })
    expect(gridCellLayout(12, { base: 12, md: 6 }, { md: 3, lg: 0 })).toEqual({
      width: '100%',
      $md: { width: '50%', marginInlineStart: '25%' },
      $lg: { marginInlineStart: 0 },
    })
    // Clamped at base (no room), applied from md where the span shrinks.
    expect(gridCellLayout(12, { base: 'full', md: 8 }, 2)).toEqual({
      width: '100%',
      $md: { width: twoThirds, marginInlineStart: `${200 / 12}%` },
    })
  })

  it('keeps the old equal-column widths for plain cells', () => {
    expect(gridCellLayout({ base: 1, sm: 2, lg: 4 })).toEqual({
      width: '100%',
      $sm: { width: '50%' },
      $lg: { width: '25%' },
    })
    expect(gridCellLayout({ md: 3 })).toEqual({ width: '100%', $md: { width: third } })
  })
})

// The 0.6.0 Grid, kept to prove plain children still render the same markup.
function LegacyGrid({
  children,
  columns = 1,
  gap = '$4',
  ...props
}: Omit<ViewProps, 'gap'> & {
  columns?: ResponsiveColumns
  gap?: SpaceTokens
  children?: ReactNode
}) {
  const half = (getTokenValue(gap as Token, 'space') as number) / 2
  const map: Record<string, number | undefined> =
    typeof columns === 'number' ? { base: columns } : columns
  const cellWidth: Record<string, unknown> = { width: `${100 / Math.max(1, map.base ?? 1)}%` }
  for (const bp of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
    const count = map[bp]
    if (count !== undefined) cellWidth[`$${bp}`] = { width: `${100 / Math.max(1, count)}%` }
  }
  return (
    <View flexDirection="row" flexWrap="wrap" marginHorizontal={-half} rowGap={gap} {...props}>
      {Children.toArray(children).map((child, index) => (
        <View
          key={isValidElement(child) && child.key != null ? child.key : index}
          paddingHorizontal={half}
          {...(cellWidth as ViewProps)}
        >
          {child}
        </View>
      ))}
    </View>
  )
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
        const style = rule.style
        for (let i = 0; i < style.length; i++) {
          const name = style.item(i)
          ;(result[media] ??= {})[name] = style.getPropertyValue(name)
        }
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules, '')
  return result
}

const md = '(min-width: 768px)'

describe('Grid', () => {
  it('renders plain children exactly like 0.6.0', () => {
    const cases: { columns: ResponsiveColumns; gap?: SpaceTokens }[] = [
      { columns: 3 },
      { columns: { base: 1, sm: 2, lg: 4 }, gap: '$2' },
      { columns: { md: 3 }, gap: '$6' },
    ]
    for (const props of cases) {
      const cells = ['One', 'Two', 'Three', 'Four'].map((label) => <Text key={label}>{label}</Text>)
      const legacy = renderWithProvider(
        <LegacyGrid columns={props.columns} gap={props.gap}>
          {cells}
        </LegacyGrid>,
      )
      const html = legacy.container.innerHTML
      legacy.unmount()
      const current = renderWithProvider(
        <Grid columns={props.columns} gap={props.gap}>
          {cells}
        </Grid>,
      )
      expect(current.container.innerHTML).toBe(html)
      current.unmount()
    }
  })

  it('gives each <Grid columns={3}> cell a third of the row', () => {
    renderWithProvider(
      <Grid columns={3} testID="grid">
        <Text>One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
      </Grid>,
    )
    const cells = Array.from(screen.getByTestId('grid').children)
    expect(cells).toHaveLength(3)
    for (const cell of cells) expect(cssFor(cell)['']).toMatchObject({ width: third })
  })

  it('stacks Bootstrap-style spans without base below their breakpoint', () => {
    renderWithProvider(
      <Grid columns={12}>
        <Grid.Item span={{ md: 8 }} testID="main">
          <Text>Main</Text>
        </Grid.Item>
        <Grid.Item span={{ md: 4 }} offset={{ md: 0 }} testID="side">
          <Text>Side</Text>
        </Grid.Item>
      </Grid>,
    )
    const main = cssFor(screen.getByTestId('main'))
    const side = cssFor(screen.getByTestId('side'))
    expect(main['']).toMatchObject({ width: '100%' })
    expect(side['']).toMatchObject({ width: '100%' })
    expect(main[md]).toEqual({ width: '66.66666666666667%' })
    expect(side[md]).toEqual({ width: '33.333333333333336%' })
  })

  it('splits 8 / 4 from md and stacks below md', () => {
    renderWithProvider(
      <Grid columns={12} testID="grid">
        <Grid.Item span={{ base: 12, md: 8 }} testID="main">
          <Text>Main</Text>
        </Grid.Item>
        <Grid.Item span={{ base: 12, md: 4 }} testID="side">
          <Text>Side</Text>
        </Grid.Item>
      </Grid>,
    )
    // Grid.Item is the cell: no extra wrapper.
    expect(screen.getByTestId('grid').children).toHaveLength(2)
    expect(screen.getByTestId('main').parentElement).toBe(screen.getByTestId('grid'))

    const main = cssFor(screen.getByTestId('main'))
    const side = cssFor(screen.getByTestId('side'))
    expect(main['']).toMatchObject({ width: '100%' })
    expect(side['']).toMatchObject({ width: '100%' })
    expect(main[md]).toEqual({ width: '66.66666666666667%' })
    expect(side[md]).toEqual({ width: '33.333333333333336%' })
  })

  it('offsets an item with margin-inline-start, so RTL mirrors it', () => {
    renderWithProvider(
      <Grid columns={12}>
        <Grid.Item span={6} offset={3} testID="centered">
          <Text>Centered</Text>
        </Grid.Item>
        <Grid.Item span={{ base: 12, md: 8 }} offset={{ md: 2 }} testID="later">
          <Text>Later</Text>
        </Grid.Item>
      </Grid>,
    )
    expect(cssFor(screen.getByTestId('centered'))['']).toMatchObject({
      width: '50%',
      'margin-inline-start': '25%',
    })
    const later = cssFor(screen.getByTestId('later'))
    expect(later['']).not.toHaveProperty('margin-inline-start')
    expect(later[md]).toMatchObject({ 'margin-inline-start': `${200 / 12}%` })
  })

  it('pads cells by half the column gap and keeps rowGap separate', () => {
    renderWithProvider(
      <Grid columns={2} gap="$2" columnGap="$6" rowGap="$8" testID="grid">
        <Grid.Item testID="cell">
          <Text>One</Text>
        </Grid.Item>
      </Grid>,
    )
    const half = (getTokenValue('$6' as Token, 'space') as number) / 2
    const grid = cssFor(screen.getByTestId('grid'))['']
    expect(grid).toMatchObject({ 'margin-left': `-${half}px`, 'margin-right': `-${half}px` })
    expect(grid?.['row-gap']).toContain('space-8')
    expect(grid).not.toHaveProperty('column-gap')
    expect(cssFor(screen.getByTestId('cell'))['']).toMatchObject({
      width: '50%',
      'padding-left': `${half}px`,
      'padding-right': `${half}px`,
    })
  })

  it('aligns cells on the cross axis', () => {
    renderWithProvider(
      <Grid columns={2} alignItems="center" testID="grid">
        <Text>One</Text>
      </Grid>,
    )
    expect(cssFor(screen.getByTestId('grid'))['']).toMatchObject({ 'align-items': 'center' })
  })

  it("keeps an item's own media styles next to its width", () => {
    renderWithProvider(
      <Grid columns={12}>
        <GridItem span={{ base: 12, md: 6 }} $md={{ opacity: 0.5 }} testID="cell">
          <Text>Styled</Text>
        </GridItem>
      </Grid>,
    )
    expect(cssFor(screen.getByTestId('cell'))[md]).toEqual({ width: '50%', opacity: '0.5' })
  })
})
