import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Meter, meterTone } from './Meter'

describe('Meter', () => {
  it('exposes meter values and its name', () => {
    renderWithProvider(<Meter value={7.2} max={10} label="Storage used" valueText="7.2 of 10 GB" />)
    const meter = screen.getByRole('meter', { name: 'Storage used' })
    expect(meter).toHaveAttribute('aria-valuenow', '7.2')
    expect(meter).toHaveAttribute('aria-valuemin', '0')
    expect(meter).toHaveAttribute('aria-valuemax', '10')
    expect(meter).toHaveAttribute('aria-valuetext', '7.2 of 10 GB')
  })

  it('clamps the value and leaves the reading to the number without valueText', () => {
    renderWithProvider(
      <>
        <Meter value={140} label="Over" />
        <Meter value={-5} min={0} max={0} label="Empty range" />
      </>,
    )
    const over = screen.getByRole('meter', { name: 'Over' })
    expect(over).toHaveAttribute('aria-valuenow', '100')
    expect(over).not.toHaveAttribute('aria-valuetext')
    expect(over.firstElementChild).toHaveStyle({ width: '100%' })
    // A range with nothing in it draws an empty bar, not NaN%.
    expect(screen.getByRole('meter', { name: 'Empty range' }).firstElementChild).toHaveStyle({
      width: '0%',
    })
  })

  it('takes min and max for the fill', () => {
    renderWithProvider(<Meter value={30} min={20} max={60} label="Temperature" />)
    expect(screen.getByRole('meter').firstElementChild).toHaveStyle({ width: '25%' })
  })
})

describe('meterTone', () => {
  it('is primary without ranges', () => {
    expect(meterTone({ value: 90 })).toBe('primary')
  })

  it('colors by range when the optimum is high, as battery left', () => {
    const battery = { low: 20, high: 50, optimum: 100 }
    expect(meterTone({ value: 80, ...battery })).toBe('success')
    expect(meterTone({ value: 50, ...battery })).toBe('warning')
    expect(meterTone({ value: 10, ...battery })).toBe('error')
  })

  it('colors by range when the optimum is low, as disk used', () => {
    const disk = { low: 60, high: 90, optimum: 0 }
    expect(meterTone({ value: 30, ...disk })).toBe('success')
    expect(meterTone({ value: 75, ...disk })).toBe('warning')
    expect(meterTone({ value: 95, ...disk })).toBe('error')
  })

  it('marks both ends fair when the optimum is in the middle', () => {
    const humidity = { low: 30, high: 60, optimum: 45 }
    expect(meterTone({ value: 45, ...humidity })).toBe('success')
    expect(meterTone({ value: 20, ...humidity })).toBe('warning')
    expect(meterTone({ value: 80, ...humidity })).toBe('warning')
  })

  it('places the optimum in the middle when only low and high are given', () => {
    expect(meterTone({ value: 50, low: 25, high: 75 })).toBe('success')
    expect(meterTone({ value: 90, low: 25, high: 75 })).toBe('warning')
  })
})
