import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Text } from '../typography/Text'
import { Separator } from './Separator'

describe('Separator', () => {
  afterEach(() => vi.restoreAllMocks())

  it('is hidden from assistive technology by default', () => {
    renderWithProvider(<Separator testID="sep" />)
    expect(screen.queryByRole('separator')).toBeNull()
    expect(screen.getByTestId('sep')).toHaveAttribute('aria-hidden', 'true')
  })

  it('exposes separator semantics and orientation when not decorative', () => {
    renderWithProvider(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('shows a decorative label as plain text between hidden lines', () => {
    renderWithProvider(<Separator label="or" testID="sep" />)
    expect(screen.queryByRole('separator')).toBeNull()
    const frame = screen.getByTestId('sep')
    expect(frame).not.toHaveAttribute('aria-hidden')
    expect(screen.getByText('or')).toBeVisible()
    const lines = [...frame.children].filter(
      (child) => child.getAttribute('aria-hidden') === 'true',
    )
    expect(lines).toHaveLength(2)
  })

  it('names a semantic separator with its label', () => {
    renderWithProvider(<Separator label="Continue with" decorative={false} />)
    expect(screen.getByRole('separator', { name: 'Continue with' })).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    )
  })

  it('puts the short line on the side of labelPosition', () => {
    const widths = (position: 'start' | 'center' | 'end') => {
      const view = renderWithProvider(
        <Separator label="or" labelPosition={position} testID="sep" />,
      )
      const [first, , last] = [...view.getByTestId('sep').children]
      const short = [first, last].map((line) => getComputedStyle(line as Element).flexGrow !== '1')
      view.unmount()
      return short
    }
    expect(widths('center')).toEqual([false, false])
    expect(widths('start')).toEqual([true, false])
    expect(widths('end')).toEqual([false, true])
  })

  it('takes children in place of the label', () => {
    renderWithProvider(
      <Separator testID="sep">
        <Text weight="bold">Today</Text>
      </Separator>,
    )
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('ignores a label on a vertical separator, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithProvider(<Separator label="or" orientation="vertical" testID="sep" />)
    expect(screen.queryByText('or')).toBeNull()
    expect(screen.getByTestId('sep')).toHaveAttribute('aria-hidden', 'true')
    expect(warn).toHaveBeenCalledOnce()
  })
})
