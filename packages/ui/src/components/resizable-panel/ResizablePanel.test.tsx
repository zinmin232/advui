import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen } from '../../../test/utils'
import { Resizable, resizePanels } from './ResizablePanel'

const limits = (min = 0, max = 100, collapsible = false) => ({
  min,
  max,
  collapsible,
  collapsedSize: 0,
})

describe('resizePanels', () => {
  it('moves only the two neighbours and respects their limits', () => {
    expect(resizePanels([30, 70], 0, 40, [limits(), limits()])).toEqual([40, 60])
    expect(resizePanels([30, 70], 0, 5, [limits(20), limits()])).toEqual([20, 80])
    expect(resizePanels([30, 70], 0, 90, [limits(), limits(25)])).toEqual([75, 25])
    expect(resizePanels([20, 50, 30], 1, 70, [limits(), limits(), limits(10)])).toEqual([
      20, 70, 10,
    ])
  })

  it('snaps a collapsible panel shut below half its minimum', () => {
    expect(resizePanels([30, 70], 0, 12, [limits(20, 100, true), limits()])).toEqual([20, 80])
    expect(resizePanels([30, 70], 0, 9, [limits(20, 100, true), limits()])).toEqual([0, 100])
  })
})

function Example(props: { onSizesChange?: (sizes: number[]) => void }) {
  return (
    <Resizable onSizesChange={props.onSizesChange}>
      <Resizable.Panel defaultSize={30} minSize={20} collapsible>
        Filters
      </Resizable.Panel>
      <Resizable.Handle aria-label="Resize filters" />
      <Resizable.Panel>Results</Resizable.Panel>
    </Resizable>
  )
}

describe('Resizable', () => {
  it('is a window splitter with the size of the panel before it', () => {
    renderWithProvider(<Example />)
    const handle = screen.getByRole('separator', { name: 'Resize filters' })
    expect(handle).toHaveAttribute('aria-orientation', 'vertical')
    expect(handle).toHaveAttribute('aria-valuenow', '30')
    expect(handle).toHaveAttribute('aria-valuemin', '0')
    expect(handle).toHaveAttribute('aria-valuemax', '100')
    expect(handle).toHaveAttribute('tabindex', '0')
    const panel = document.getElementById(handle.getAttribute('aria-controls')!)
    expect(panel).toHaveTextContent('Filters')
  })

  it('resizes with the arrow keys, Home and End, and collapses with Enter', async () => {
    const onSizesChange = vi.fn()
    const { user } = renderWithProvider(<Example onSizesChange={onSizesChange} />)
    const handle = screen.getByRole('separator')
    handle.focus()
    await user.keyboard('{ArrowRight}')
    expect(onSizesChange).toHaveBeenLastCalledWith([35, 65])
    expect(handle).toHaveAttribute('aria-valuenow', '35')
    await user.keyboard('{End}')
    expect(onSizesChange).toHaveBeenLastCalledWith([100, 0])
    await user.keyboard('{Home}')
    expect(onSizesChange).toHaveBeenLastCalledWith([0, 100])
    expect(screen.getByText('Filters')).not.toBeVisible()
    await user.keyboard('{Enter}')
    // Reopens at an equal share: it had no open size to go back to.
    expect(onSizesChange).toHaveBeenLastCalledWith([50, 50])
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onSizesChange).toHaveBeenLastCalledWith([0, 100])
    await user.keyboard('{Enter}')
    expect(onSizesChange).toHaveBeenLastCalledWith([55, 45])
  })

  it('stacks vertically and follows controlled sizes', () => {
    renderWithProvider(
      <Resizable direction="vertical" sizes={[60, 40]}>
        <Resizable.Panel>Query</Resizable.Panel>
        <Resizable.Handle />
        <Resizable.Panel>Results</Resizable.Panel>
      </Resizable>,
    )
    const handle = screen.getByRole('separator', { name: 'Resize' })
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal')
    expect(handle).toHaveAttribute('aria-valuenow', '60')
  })

  it('resizes by dragging', () => {
    const onSizesChange = vi.fn()
    renderWithProvider(<Example onSizesChange={onSizesChange} />)
    const handle = screen.getByRole('separator')
    // happy-dom does no layout: give the group a width.
    Object.defineProperty(handle.parentElement!, 'offsetWidth', { value: 400 })
    fireEvent.pointerDown(handle, { clientX: 120, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 })
    expect(onSizesChange).toHaveBeenLastCalledWith([40, 60])
    fireEvent.pointerUp(handle, { clientX: 160, pointerId: 1 })
    // Moves after the release are ignored.
    fireEvent.pointerMove(handle, { clientX: 200, pointerId: 1 })
    expect(onSizesChange).toHaveBeenLastCalledWith([40, 60])
  })
})
