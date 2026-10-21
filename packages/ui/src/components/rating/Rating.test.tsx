import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Field } from '../field/Field'
import { Rating } from './Rating'

// One element per icon, in order; with `allowHalf` the last child holds the two halves.
const icons = (rating: HTMLElement) =>
  [...rating.children].filter((el): el is HTMLElement => el.tagName === 'DIV')
// Each icon that shows any fill draws a second, filled copy over the outline.
const filledIcons = (rating: HTMLElement) =>
  rating.querySelectorAll('svg').length - icons(rating).length

describe('Rating', () => {
  it('is a named slider from 0 to the icon count, with a readable value', () => {
    renderWithProvider(
      <>
        <Rating aria-label="Recipe" defaultValue={3} />
        <Rating aria-label="Hotel" defaultValue={7} count={10} getValueText={(v) => `${v} stars`} />
      </>,
    )
    const recipe = screen.getByRole('slider', { name: 'Recipe' })
    expect(recipe).toHaveAttribute('aria-valuemin', '0')
    expect(recipe).toHaveAttribute('aria-valuemax', '5')
    expect(recipe).toHaveAttribute('aria-valuenow', '3')
    expect(recipe).toHaveAttribute('aria-valuetext', '3 of 5')
    expect(recipe).toHaveAttribute('tabindex', '0')
    expect(icons(recipe)).toHaveLength(5)
    expect(filledIcons(recipe)).toBe(3)

    const hotel = screen.getByRole('slider', { name: 'Hotel' })
    expect(hotel).toHaveAttribute('aria-valuemax', '10')
    expect(hotel).toHaveAttribute('aria-valuetext', '7 stars')
    expect(icons(hotel)).toHaveLength(10)
  })

  it('steps with the arrow keys, clears with Home and fills with End', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Rating aria-label="Recipe" defaultValue={3} onValueChange={onValueChange} />,
    )
    const rating = screen.getByRole('slider', { name: 'Recipe' })
    rating.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    expect(rating).toHaveAttribute('aria-valuenow', '4')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    await user.keyboard('{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(5)
    // At the top already: no call for the same value.
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledTimes(5)
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0)
    expect(rating).toHaveAttribute('aria-valuetext', '0 of 5')
  })

  it('takes half steps with allowHalf, and swaps left and right in RTL', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      // happy-dom computes `direction` from the style only, not from `dir`.
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Rating aria-label="Recipe" allowHalf defaultValue={3} onValueChange={onValueChange} />
      </div>,
    )
    const rating = screen.getByRole('slider', { name: 'Recipe' })
    rating.focus()
    await user.keyboard('{ArrowLeft}')
    expect(onValueChange).toHaveBeenLastCalledWith(3.5)
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(2.5)
    expect(rating).toHaveAttribute('aria-valuetext', '2.5 of 5')
  })

  it('picks the value of a pressed icon, or of its half with allowHalf', async () => {
    const onValueChange = vi.fn()
    const onHalfChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <Rating aria-label="Whole" onValueChange={onValueChange} />
        <Rating aria-label="Half" allowHalf onValueChange={onHalfChange} />
      </>,
    )
    const whole = screen.getByRole('slider', { name: 'Whole' })
    await user.click(icons(whole)[3]!)
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    expect(whole).toHaveAttribute('aria-valuenow', '4')

    const halves = (index: number) =>
      icons(screen.getByRole('slider', { name: 'Half' }))[index]!.lastElementChild!.children
    await user.click(halves(2)[0]!)
    expect(onHalfChange).toHaveBeenLastCalledWith(2.5)
    await user.click(halves(4)[1]!)
    expect(onHalfChange).toHaveBeenLastCalledWith(5)
  })

  it('previews the hovered value without changing it', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Rating aria-label="Recipe" defaultValue={1} onValueChange={onValueChange} />,
    )
    const rating = screen.getByRole('slider', { name: 'Recipe' })
    await user.hover(icons(rating)[3]!)
    expect(filledIcons(rating)).toBe(4)
    expect(rating).toHaveAttribute('aria-valuenow', '1')
    await user.unhover(rating)
    expect(filledIcons(rating)).toBe(1)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('follows a controlled value and steps from a fraction to the next whole step', async () => {
    function Controlled() {
      const [value, setValue] = useState(3.7)
      return (
        <>
          <Rating aria-label="Recipe" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(3.7)}>
            Reset
          </button>
        </>
      )
    }
    const { user } = renderWithProvider(<Controlled />)
    const rating = screen.getByRole('slider', { name: 'Recipe' })
    expect(rating).toHaveAttribute('aria-valuenow', '3.7')
    rating.focus()
    await user.keyboard('{ArrowRight}')
    expect(rating).toHaveAttribute('aria-valuenow', '4')
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    rating.focus()
    await user.keyboard('{ArrowLeft}')
    expect(rating).toHaveAttribute('aria-valuenow', '3')
  })

  it('shows a read-only score as a named image that nothing changes', async () => {
    const { user } = renderWithProvider(
      <>
        <Rating aria-label="Average rating" readOnly value={4.3} />
        <Rating readOnly defaultValue={2} />
      </>,
    )
    const score = screen.getByRole('img', { name: 'Average rating: 4.3 of 5' })
    expect(screen.getByRole('img', { name: '2 of 5' })).toBeInTheDocument()
    expect(screen.queryByRole('slider')).toBeNull()
    expect(score).not.toHaveAttribute('tabindex')
    // 4.3 fills four icons and part of the fifth.
    expect(filledIcons(score)).toBe(5)
    await user.click(icons(score)[0]!)
    expect(screen.getByRole('img', { name: 'Average rating: 4.3 of 5' })).toBeInTheDocument()
  })

  it('is skipped by the keyboard and ignores presses when disabled', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <button type="button">Before</button>
        <Rating aria-label="Locked" defaultValue={2} disabled onValueChange={onValueChange} />
      </>,
    )
    const rating = screen.getByRole('slider', { name: 'Locked' })
    expect(rating).toHaveAttribute('aria-disabled', 'true')
    expect(rating).not.toHaveAttribute('tabindex')
    screen.getByRole('button', { name: 'Before' }).focus()
    await user.tab()
    expect(rating).not.toHaveFocus()
    await user.click(icons(rating)[4]!)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('takes its name, help text and state from a Field', () => {
    const { container } = renderWithProvider(
      <Field id="stay" label="Your stay" error="Pick a rating." required>
        <Rating />
      </Field>,
    )
    const rating = screen.getByRole('slider', { name: 'Your stay' })
    expect(rating).toHaveAttribute('id', 'stay')
    expect(rating).toHaveAccessibleDescription('Pick a rating.')
    expect(rating).toHaveAttribute('aria-invalid', 'true')
    expect(rating).not.toHaveAttribute('aria-required')
    expect(container.querySelectorAll('#stay')).toHaveLength(1)
  })

  it('submits its value under its name', () => {
    const { container } = renderWithProvider(
      <form>
        <Rating aria-label="Stay" name="stay" defaultValue={4} />
        <Rating aria-label="Off" name="off" defaultValue={2} disabled />
      </form>,
    )
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('stay')).toBe('4')
    expect(data.has('off')).toBe(false)
  })
})
