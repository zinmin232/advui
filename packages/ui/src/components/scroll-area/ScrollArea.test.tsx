import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { ScrollArea } from './ScrollArea'

describe('ScrollArea', () => {
  it('is a named, focusable region that scrolls vertically', async () => {
    const { user } = renderWithProvider(
      <ScrollArea aria-label="Release tags" height="$72">
        <p>v1.0.0</p>
      </ScrollArea>,
    )
    const region = screen.getByRole('region', { name: 'Release tags' })
    expect(region).toHaveClass('aui-scroll-area')
    expect(getComputedStyle(region).overflowY).toBe('auto')
    await user.tab()
    expect(region).toHaveFocus()
  })

  it('scrolls horizontally, and has no landmark role without a name', () => {
    renderWithProvider(
      <ScrollArea orientation="horizontal" testID="row">
        <p>Albums</p>
      </ScrollArea>,
    )
    const row = screen.getByTestId('row')
    expect(row).not.toHaveAttribute('role')
    expect(getComputedStyle(row).overflowX).toBe('auto')
    expect(getComputedStyle(row).overflowY).toBe('hidden')
  })
})
