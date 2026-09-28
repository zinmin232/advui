import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Stat } from './Stat'

describe('Stat', () => {
  it('renders the label, value and help text in reading order', () => {
    const { container } = renderWithProvider(
      <Stat>
        <Stat.Label>Revenue</Stat.Label>
        <Stat.Value>$48,210</Stat.Value>
        <Stat.HelpText>vs. last month</Stat.HelpText>
      </Stat>,
    )
    expect(container.textContent).toBe('Revenue$48,210vs. last month')
  })

  it('names the direction of a change for screen readers', () => {
    renderWithProvider(
      <>
        <Stat.Delta trend="up">12.5%</Stat.Delta>
        <Stat.Delta trend="down">3.1%</Stat.Delta>
        <Stat.Delta trend="neutral">0%</Stat.Delta>
      </>,
    )
    expect(screen.getByText('Increased by')).toBeInTheDocument()
    expect(screen.getByText('Decreased by')).toBeInTheDocument()
    expect(screen.getByText('No change:')).toBeInTheDocument()
  })

  it('takes a custom trend label', () => {
    renderWithProvider(
      <Stat.Delta trend="up" trendLabel="Up">
        4
      </Stat.Delta>,
    )
    expect(screen.getByText('Up')).toBeInTheDocument()
  })

  it('colors the change by tone, which defaults from the trend', () => {
    renderWithProvider(
      <>
        <Stat.Delta trend="up">up</Stat.Delta>
        <Stat.Delta trend="down" tone="positive">
          down but good
        </Stat.Delta>
        <Stat.Delta trend="down">down</Stat.Delta>
      </>,
    )
    const color = (text: string) => getComputedStyle(screen.getByText(text)).color
    expect(color('down but good')).toBe(color('up'))
    expect(color('down')).not.toBe(color('up'))
  })
})
