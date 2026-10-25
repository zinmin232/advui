import { BellIcon } from '@advui/icons'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Avatar } from '../avatar/Avatar'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import { Indicator } from './Indicator'

// The mark sits in the box around the children, beside them (icons are
// hidden too, but are not spans).
const markIn = (testId: string) =>
  screen.getByTestId(testId).querySelector<HTMLElement>(':scope > span > span[aria-hidden="true"]')

describe('Indicator', () => {
  it('reads its label after the child and hides the dot from screen readers', () => {
    renderWithProvider(
      <Indicator data-testid="status" label="Online" tone="success">
        <Avatar alt="Ada Lovelace" />
      </Indicator>,
    )
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()
    const label = screen.getByText('Online')
    expect(label.closest('[aria-hidden="true"]')).toBeNull()
    expect(getComputedStyle(label).width).toBe('1px')
    // The dot never takes a press meant for what it is pinned to.
    expect(getComputedStyle(markIn('status')!).pointerEvents).toBe('none')
  })

  it('shows a count, capped at max, that only its label reads out', () => {
    renderWithProvider(
      <>
        <Indicator count={120} label="120 unread messages">
          <BellIcon />
        </Indicator>
        <Indicator count={12} max={9} label="12 new orders">
          <BellIcon />
        </Indicator>
      </>,
    )
    expect(screen.getByText('99+').closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByText('9+').closest('[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByText('120 unread messages')).toBeInTheDocument()
    expect(screen.getByText('12 new orders')).toBeInTheDocument()
  })

  it('hides for a count of 0 unless showZero is set, and when visible is false', () => {
    renderWithProvider(
      <>
        <Indicator count={0} label="No unread messages">
          <Text>Inbox</Text>
        </Indicator>
        <Indicator count={0} showZero label="Cart is empty">
          <Text>Cart</Text>
        </Indicator>
        <Indicator visible={false} label="Online">
          <Text>Ada</Text>
        </Indicator>
      </>,
    )
    expect(screen.getByText('Inbox')).toBeInTheDocument()
    expect(screen.queryByText('No unread messages')).toBeNull()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.queryByText('Online')).toBeNull()
  })

  it('pins to the corner it is given, moved in to the edge of a circle', () => {
    renderWithProvider(
      <>
        <Indicator data-testid="square">
          <BellIcon />
        </Indicator>
        <Indicator data-testid="circle" placement="bottom-start" overlap="circle">
          <Avatar />
        </Indicator>
      </>,
    )
    const square = getComputedStyle(markIn('square')!)
    expect(parseFloat(square.top)).toBe(0)
    expect(parseFloat(square.right)).toBe(0)
    const circle = getComputedStyle(markIn('circle')!)
    expect(circle.bottom).toMatch(/^14\.6\d*%$/)
    expect(circle.left).toMatch(/^14\.6\d*%$/)
  })

  it('fits inside a button, which keeps its own name', () => {
    renderWithProvider(
      <IconButton
        aria-label="Notifications, 3 unread"
        icon={
          <Indicator count={3} size="sm">
            <BellIcon />
          </Indicator>
        }
      />,
    )
    const button = screen.getByRole('button', { name: 'Notifications, 3 unread' })
    // Spans, not divs: a button holds phrasing content only.
    const tags: string[] = []
    for (let el = screen.getByText('3').parentElement; el !== button; el = el!.parentElement)
      tags.push(el!.tagName)
    expect(tags.length).toBeGreaterThan(0)
    expect(new Set(tags)).toEqual(new Set(['SPAN']))
  })
})
