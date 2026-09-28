import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Timeline } from './Timeline'

describe('Timeline', () => {
  it('is a list of events with title, time and description', () => {
    renderWithProvider(
      <Timeline>
        <Timeline.Item title="Published" time="Sep 24" description="Shared with partners." />
        <Timeline.Item title="Survey closed" time="Sep 10" />
      </Timeline>,
    )
    expect(screen.getByRole('list')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('PublishedSep 24Shared with partners.')
  })

  it('hides the markers and draws no line after the last event', () => {
    renderWithProvider(
      <Timeline>
        <Timeline.Item title="One" icon={<svg data-testid="icon" />} />
        <Timeline.Item title="Two" />
      </Timeline>,
    )
    const [first, second] = screen.getAllByRole('listitem')
    const marker = (item: HTMLElement) => item.firstElementChild as HTMLElement
    expect(marker(first!)).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).toBe(marker(first!))
    // The marker column holds the marker and, except on the last item, the line.
    expect(marker(first!).children).toHaveLength(2)
    expect(marker(second!).children).toHaveLength(1)
  })

  it('renders extra content and passes props to the item', () => {
    renderWithProvider(
      <Timeline>
        <Timeline.Item title="Commented" aria-current="step">
          <span>Looks good</span>
        </Timeline.Item>
      </Timeline>,
    )
    expect(screen.getByText('Looks good')).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveAttribute('aria-current', 'step')
  })
})
