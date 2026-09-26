import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Slider } from './Slider'

describe('Slider', () => {
  it('exposes a named slider with its range, value and value text', () => {
    renderWithProvider(
      <Slider aria-label="Volume" defaultValue={40} getValueText={(v) => `${v} percent`} />,
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expect(slider).toHaveAttribute('aria-valuenow', '40')
    expect(slider).toHaveAttribute('aria-valuetext', '40 percent')
  })

  it('steps with the keyboard and reports a number for a single thumb', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Slider aria-label="Volume" defaultValue={40} step={5} onValueChange={onValueChange} />,
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })
    slider.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(45)
    expect(slider).toHaveAttribute('aria-valuenow', '45')
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(100)
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
  })

  it('renders one labelled thumb per value and reports arrays for a range', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Slider aria-label="Price" defaultValue={[20, 80]} onValueChange={onValueChange} />,
    )
    const low = screen.getByRole('slider', { name: 'Price, Minimum' })
    expect(screen.getByRole('slider', { name: 'Price, Maximum' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    )
    low.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith([21, 80])
  })

  it('follows a controlled value', async () => {
    function Controlled() {
      const [zoom, setZoom] = useState(10)
      return (
        <>
          <Slider aria-label="Zoom" value={zoom} />
          <button type="button" onClick={() => setZoom(60)}>
            Zoom in
          </button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuenow', '10')
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveAttribute('aria-valuenow', '60')
  })

  it('is skipped by the keyboard when disabled', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <button type="button">Before</button>
        <Slider aria-label="Locked" defaultValue={50} disabled onValueChange={onValueChange} />
      </>,
    )
    const slider = screen.getByRole('slider', { name: 'Locked' })
    expect(slider).toHaveAttribute('aria-disabled', 'true')
    expect(slider).not.toHaveAttribute('tabindex')
    screen.getByRole('button', { name: 'Before' }).focus()
    await user.tab()
    expect(slider).not.toHaveFocus()
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
