import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { ToggleGroup } from './ToggleGroup'

function Alignment({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <ToggleGroup
      type="single"
      defaultValue="center"
      aria-label="Text alignment"
      onValueChange={onValueChange}
    >
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup>
  )
}

describe('ToggleGroup', () => {
  it('single: a named radiogroup whose choice stays chosen', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Alignment onValueChange={onValueChange} />)
    expect(screen.getByRole('radiogroup', { name: 'Text alignment' })).toBeInTheDocument()
    const center = screen.getByRole('radio', { name: 'Center' })
    expect(center).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'Right' }))
    expect(onValueChange).toHaveBeenLastCalledWith('right')
    expect(screen.getByRole('radio', { name: 'Right' })).toHaveAttribute('aria-checked', 'true')
    expect(center).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByRole('radio', { name: 'Right' }))
    expect(screen.getByRole('radio', { name: 'Right' })).toHaveAttribute('aria-checked', 'true')
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it('single: one Tab stop, and arrow keys move and choose', async () => {
    const { user } = renderWithProvider(<Alignment />)
    const [left, center, right] = screen.getAllByRole('radio')
    await waitFor(() => expect(center).toHaveAttribute('tabindex', '0'))
    expect(left).toHaveAttribute('tabindex', '-1')

    await user.tab()
    expect(center).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(right).toHaveFocus()
    expect(right).toHaveAttribute('aria-checked', 'true')
    await user.keyboard('{ArrowRight}')
    expect(left).toHaveFocus()
    await user.keyboard('{End}')
    expect(right).toHaveFocus()
    await user.keyboard('{Home}')
    expect(left).toHaveFocus()
    expect(left).toHaveAttribute('aria-checked', 'true')
  })

  it('multiple: a group of pressed buttons', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ToggleGroup
        type="multiple"
        defaultValue={['bold']}
        aria-label="Text style"
        onValueChange={onValueChange}
      >
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      </ToggleGroup>,
    )
    expect(screen.getByRole('group', { name: 'Text style' })).toBeInTheDocument()
    const bold = screen.getByRole('button', { name: 'Bold' })
    const italic = screen.getByRole('button', { name: 'Italic' })
    expect(bold).toHaveAttribute('aria-pressed', 'true')

    await user.click(italic)
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic'])
    await user.click(bold)
    expect(onValueChange).toHaveBeenLastCalledWith(['italic'])
    expect(bold).toHaveAttribute('aria-pressed', 'false')

    // Arrow keys only move focus in a multiple group.
    italic.focus()
    await user.keyboard('{ArrowLeft}')
    expect(bold).toHaveFocus()
    expect(bold).toHaveAttribute('aria-pressed', 'false')
  })

  it('skips disabled items', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ToggleGroup type="single" aria-label="Size" onValueChange={onValueChange}>
        <ToggleGroup.Item value="s">S</ToggleGroup.Item>
        <ToggleGroup.Item value="m" disabled>
          M
        </ToggleGroup.Item>
        <ToggleGroup.Item value="l">L</ToggleGroup.Item>
      </ToggleGroup>,
    )
    await user.click(screen.getByRole('radio', { name: 'M' }))
    expect(onValueChange).not.toHaveBeenCalled()
    screen.getByRole('radio', { name: 'S' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'L' })).toHaveFocus()
  })
})
