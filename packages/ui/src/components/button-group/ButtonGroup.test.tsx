import { PlusIcon } from '@advui/icons'
import { describe, expect, it } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Button } from '../button/Button'
import { IconButton } from '../icon-button/IconButton'
import { ButtonGroup } from './ButtonGroup'

const radii = (element: HTMLElement) => {
  const style = getComputedStyle(element)
  return [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ].map((value) => value === '0px' || value === '0')
}

describe('ButtonGroup', () => {
  it('is a named group whose buttons stay separate tab stops', async () => {
    const { user } = renderWithProvider(
      <ButtonGroup aria-label="Message actions">
        <Button>Archive</Button>
        <Button>Report</Button>
      </ButtonGroup>,
    )
    expect(screen.getByRole('group', { name: 'Message actions' })).toBeInTheDocument()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Archive' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Report' })).toHaveFocus()
  })

  it('joins attached buttons: square inner corners only', () => {
    renderWithProvider(
      <ButtonGroup aria-label="Actions" variant="outline">
        <Button>First</Button>
        <Button>Middle</Button>
        <IconButton aria-label="Last" icon={<PlusIcon />} />
      </ButtonGroup>,
    )
    // [top-left, top-right, bottom-right, bottom-left] is square?
    expect(radii(screen.getByRole('button', { name: 'First' }))).toEqual([false, true, true, false])
    expect(radii(screen.getByRole('button', { name: 'Middle' }))).toEqual([true, true, true, true])
    expect(radii(screen.getByRole('button', { name: 'Last' }))).toEqual([true, false, false, true])
  })

  it('joins vertical groups top to bottom and leaves spaced groups alone', () => {
    const { unmount } = renderWithProvider(
      <ButtonGroup aria-label="Zoom" orientation="vertical">
        <Button>In</Button>
        <Button>Out</Button>
      </ButtonGroup>,
    )
    expect(radii(screen.getByRole('button', { name: 'In' }))).toEqual([false, false, true, true])
    expect(radii(screen.getByRole('button', { name: 'Out' }))).toEqual([true, true, false, false])
    unmount()

    renderWithProvider(
      <ButtonGroup aria-label="Form" attached={false}>
        <Button>Cancel</Button>
        <Button>Save</Button>
      </ButtonGroup>,
    )
    expect(radii(screen.getByRole('button', { name: 'Cancel' }))).toEqual([
      false,
      false,
      false,
      false,
    ])
  })

  it('gives buttons its variant and size unless they set their own', () => {
    renderWithProvider(
      <ButtonGroup aria-label="Actions" variant="outline" size="sm">
        <Button>Group style</Button>
        <Button variant="destructive" size="lg">
          Own style
        </Button>
      </ButtonGroup>,
    )
    const grouped = screen.getByRole('button', { name: 'Group style' })
    const own = screen.getByRole('button', { name: 'Own style' })
    expect(getComputedStyle(grouped).height).not.toBe(getComputedStyle(own).height)
    expect(getComputedStyle(grouped).backgroundColor).not.toBe(
      getComputedStyle(own).backgroundColor,
    )
  })
})
