import { CheckIcon, MinusIcon } from '@advui/icons'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen } from '../../../test/utils'
import { Label } from '../label/Label'
import { Checkbox, type CheckedState } from './Checkbox'

describe('Checkbox', () => {
  it('toggles with click, label click and Space', async () => {
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <Checkbox id="terms" onCheckedChange={onCheckedChange} />
        <Label htmlFor="terms">Accept terms</Label>
      </>,
    )
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(box).toHaveAttribute('aria-checked', 'false')

    await user.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByText('Accept terms'))
    expect(box).toHaveAttribute('aria-checked', 'false')

    box.focus()
    await user.keyboard(' ')
    expect(box).toHaveAttribute('aria-checked', 'true')
    expect(onCheckedChange).toHaveBeenCalledTimes(3)
  })

  it('supports the controlled indeterminate state', () => {
    function Controlled() {
      const [checked, setChecked] = useState<CheckedState>('indeterminate')
      return <Checkbox aria-label="Select all" checked={checked} onCheckedChange={setChecked} />
    }
    renderWithProvider(<Controlled />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('shows a dash while an uncontrolled box is mixed, then a check', async () => {
    const shape = (element: Element | null) =>
      [...(element?.querySelectorAll('path, line, polyline') ?? [])].map((part) =>
        part.outerHTML.replace(/ (stroke|fill)[a-z-]*="[^"]*"/g, ''),
      )
    const { user } = renderWithProvider(
      <>
        <Checkbox aria-label="All" defaultChecked="indeterminate" />
        <div data-testid="minus">
          <MinusIcon />
        </div>
        <div data-testid="check">
          <CheckIcon />
        </div>
      </>,
    )
    const box = screen.getByRole('checkbox', { name: 'All' })
    expect(box).toHaveAttribute('aria-checked', 'mixed')
    expect(shape(box)).toEqual(shape(screen.getByTestId('minus')))
    await user.click(box)
    expect(box).toHaveAttribute('aria-checked', 'true')
    expect(shape(box)).toEqual(shape(screen.getByTestId('check')))
  })

  it('ignores interaction when disabled and exposes aria-invalid', async () => {
    const onCheckedChange = vi.fn()
    const { user } = renderWithProvider(
      <Checkbox aria-label="Terms" disabled invalid onCheckedChange={onCheckedChange} />,
    )
    const box = screen.getByRole('checkbox')
    await user.click(box)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(box).toHaveAttribute('aria-invalid', 'true')
  })
})
