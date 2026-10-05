import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, testConfig } from '../../../test/utils'
import { UniversalProvider } from '../../provider/UniversalProvider'
import { Text } from '../typography/Text'
import { AutoGrid, autoGridTemplate } from './AutoGrid'
import { autoGridColumns } from './autoGridColumns'

describe('autoGridColumns', () => {
  it('fits as many minimum-width cells as the width and gaps allow', () => {
    // 240px cells with 16px gaps: n cells need 256n - 16px.
    expect(autoGridColumns(1000, 240, 16)).toBe(3)
    expect(autoGridColumns(1008, 240, 16)).toBe(4)
    expect(autoGridColumns(1007, 240, 16)).toBe(3)
    expect(autoGridColumns(480, 240, 0)).toBe(2)
  })

  it('caps at maxColumns and never goes below one column', () => {
    expect(autoGridColumns(2000, 240, 16, 4)).toBe(4)
    expect(autoGridColumns(600, 240, 16, 4)).toBe(2)
    expect(autoGridColumns(200, 240, 16)).toBe(1)
    expect(autoGridColumns(0, 240, 16)).toBe(1)
    expect(autoGridColumns(Number.NaN, 240, 16)).toBe(1)
  })
})

describe('AutoGrid on web', () => {
  it('builds an auto-fill template, raising the narrowest cell to cap the columns', () => {
    expect(autoGridTemplate(240, 16)).toBe('repeat(auto-fill, minmax(min(240px, 100%), 1fr))')
    expect(autoGridTemplate(240, 16, 4)).toBe(
      'repeat(auto-fill, minmax(min(max(240px, calc((100% - 48px) / 4)), 100%), 1fr))',
    )
    expect(autoGridTemplate(240, 16, 1)).toBe(
      'repeat(auto-fill, minmax(min(max(240px, calc((100% - 0px) / 1)), 100%), 1fr))',
    )
  })

  it('is a CSS grid in the server markup, with the gap token in the template', () => {
    const html = renderToString(
      <UniversalProvider config={testConfig}>
        <AutoGrid testID="grid" minChildWidth={200} gap="$2" maxColumns={3}>
          <Text>One</Text>
        </AutoGrid>
      </UniversalProvider>,
    )
    expect(html).toContain('_dsp-grid')
    expect(html).toContain(
      'grid-template-columns:repeat(auto-fill, minmax(min(max(200px, calc((100% - 16px) / 3)), 100%), 1fr))',
    )
  })

  it('keeps children as the grid cells, without wrappers', () => {
    const view = renderWithProvider(
      <AutoGrid testID="grid">
        <Text>One</Text>
        <Text>Two</Text>
      </AutoGrid>,
    )
    expect(view.getByText('One').parentElement).toBe(view.getByTestId('grid'))
  })
})
