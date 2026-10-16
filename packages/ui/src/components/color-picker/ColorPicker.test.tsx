import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Field } from '../field/Field'
import { ColorPicker } from './ColorPicker'

const area = () => screen.getByRole('slider', { name: 'Color' })
const hue = () => screen.getByRole('slider', { name: 'Hue' })
const hexField = () => screen.getByRole('textbox', { name: 'Hex color' })

describe('ColorPicker', () => {
  afterEach(() => {
    delete (window as { EyeDropper?: unknown }).EyeDropper
  })

  it('inline: a group named by its Field, with a 2D area, a hue slider and a hex field', () => {
    renderWithProvider(
      <Field label="Brand color">
        <ColorPicker inline defaultValue="#3b82f6" />
      </Field>,
    )
    expect(screen.getByRole('group', { name: 'Brand color' })).toBeInTheDocument()
    expect(area()).toHaveAttribute('aria-roledescription', '2D slider')
    expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 76%, brightness 96%')
    expect(area()).toHaveAttribute('tabindex', '0')
    expect(hue()).toHaveAttribute('aria-valuemax', '360')
    expect(hue()).toHaveAttribute('aria-valuetext', '217°')
    expect(hexField()).toHaveValue('#3b82f6')
    // The field's id names the group, not the text field inside.
    expect(hexField()).not.toHaveAttribute('id', screen.getByRole('group').id)
    // No opacity slider without `alpha`.
    expect(screen.queryByRole('slider', { name: 'Opacity' })).toBeNull()
  })

  it('moves saturation with left and right and brightness with up and down', async () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker
        inline
        aria-label="Tint"
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    area().focus()
    await user.keyboard('{ArrowDown}')
    expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 99%')
    expect(onValueChange).toHaveBeenLastCalledWith('#fc0000')
    expect(onValueCommit).toHaveBeenLastCalledWith('#fc0000')
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 90%, brightness 99%')
    await user.keyboard('{PageDown}')
    expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 90%, brightness 89%')
    await user.keyboard('{Home}')
    expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 0%, brightness 89%')
    expect(hexField()).toHaveValue('#e3e3e3')
  })

  it('keeps the hue of a gray, so saturating it brings the color back', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker inline aria-label="Tint" defaultValue="#00ff00" onValueChange={onValueChange} />,
    )
    area().focus()
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('#ffffff')
    expect(hue()).toHaveAttribute('aria-valuenow', '120')
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00')
  })

  it('steps the hue, by ten with Page Up', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker inline aria-label="Tint" defaultValue="#ff0000" onValueChange={onValueChange} />,
    )
    hue().focus()
    await user.keyboard('{PageUp}'.repeat(12))
    expect(hue()).toHaveAttribute('aria-valuetext', '120°')
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00')
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('#ff0000')
  })

  it('picks from where the area is pressed and dragged, and commits when the drag ends', () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    renderWithProvider(
      <ColorPicker
        inline
        aria-label="Tint"
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    const surface = area()
    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
    } as DOMRect)
    // The top-left corner is white.
    fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
    expect(onValueChange).toHaveBeenLastCalledWith('#ffffff')
    expect(surface).toHaveFocus()
    // Past the bottom edge it stays at the edge: black.
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 150, clientY: 300 })
    expect(onValueChange).toHaveBeenLastCalledWith('#000000')
    expect(onValueCommit).not.toHaveBeenCalled()
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 200, clientY: 50 })
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 200, clientY: 50 })
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect(onValueCommit).toHaveBeenLastCalledWith('#800000')
  })

  it('takes a typed hex, rgb() or hsl() color on Enter or blur, and undoes anything else', async () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker
        inline
        aria-label="Tint"
        defaultValue="#ff0000"
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
      />,
    )
    await user.clear(hexField())
    await user.type(hexField(), '00f{Enter}')
    expect(onValueChange).toHaveBeenLastCalledWith('#0000ff')
    expect(onValueCommit).toHaveBeenLastCalledWith('#0000ff')
    expect(hue()).toHaveAttribute('aria-valuenow', '240')

    await user.clear(hexField())
    await user.type(hexField(), 'rgb(0, 128, 0)')
    await user.tab()
    expect(onValueChange).toHaveBeenLastCalledWith('#008000')
    expect(hexField()).toHaveValue('#008000')

    await user.clear(hexField())
    await user.type(hexField(), 'not a color')
    await user.tab()
    expect(hexField()).toHaveValue('#008000')
    expect(onValueCommit).toHaveBeenCalledTimes(2)
  })

  it('shows a whole hex while it is typed, before Enter', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker inline aria-label="Tint" defaultValue="#ff0000" onValueChange={onValueChange} />,
    )
    await user.clear(hexField())
    await user.type(hexField(), '#00ff0')
    expect(onValueChange).not.toHaveBeenCalled()
    await user.type(hexField(), '0')
    expect(onValueChange).toHaveBeenLastCalledWith('#00ff00')
  })

  it('with alpha: an opacity slider, and a translucent value as #rrggbbaa', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <>
        <ColorPicker
          inline
          alpha
          aria-label="Overlay"
          defaultValue="#ff000080"
          onValueChange={onValueChange}
        />
        <ColorPicker inline aria-label="Solid" defaultValue="#ff000080" />
      </>,
    )
    const opacity = screen.getByRole('slider', { name: 'Opacity' })
    expect(opacity).toHaveAttribute('aria-valuetext', '50%')
    opacity.focus()
    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('#ff000000')
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('#ff0000')
    // Without `alpha`, the color is opaque.
    expect(screen.getAllByRole('textbox', { name: 'Hex color' })[1]).toHaveValue('#ff0000')
  })

  it('picks a swatch, and marks the one that matches the color', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker
        inline
        aria-label="Label color"
        defaultValue="#22C55E"
        swatches={[{ value: '#ef4444', label: 'Red' }, { value: '#22c55e', label: 'Green' }, '#3b82f6', 'nope']}
        onValueChange={onValueChange}
      />,
    )
    const group = screen.getByRole('group', { name: 'Swatches' })
    expect(group.querySelectorAll('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Green' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: '#3b82f6' }))
    expect(onValueChange).toHaveBeenLastCalledWith('#3b82f6')
    expect(screen.getByRole('button', { name: '#3b82f6' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('opens from a field-shaped button described by the color', async () => {
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Field label="Brand color">
        <ColorPicker defaultValue="#3b82f6" onValueChange={onValueChange} />
      </Field>,
    )
    const trigger = screen.getByRole('button', { name: 'Brand color' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAccessibleDescription('#3b82f6')
    await user.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Choose a color' })).toBeInTheDocument()
    hue().focus()
    await user.keyboard('{Home}')
    // Hue 0 at the same saturation and brightness.
    expect(onValueChange).toHaveBeenLastCalledWith('#f63b3b')
    expect(trigger).toHaveAccessibleDescription('#f63b3b')
  })

  it('offers the eyedropper where the browser has one', async () => {
    const open = vi.fn().mockResolvedValue({ sRGBHex: '#123456' })
    ;(window as { EyeDropper?: unknown }).EyeDropper = class {
      open = open
    }
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <ColorPicker inline aria-label="Tint" onValueChange={onValueChange} />,
    )
    await user.click(await screen.findByRole('button', { name: 'Pick a color from the screen' }))
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith('#123456'))
  })

  it('has no eyedropper where the browser has none, or with eyeDropper={false}', async () => {
    const { unmount } = renderWithProvider(<ColorPicker inline aria-label="Tint" />)
    expect(screen.queryByRole('button', { name: 'Pick a color from the screen' })).toBeNull()
    unmount()
    ;(window as { EyeDropper?: unknown }).EyeDropper = class {}
    renderWithProvider(<ColorPicker inline aria-label="Tint" eyeDropper={false} />)
    await waitFor(() => expect(hexField()).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Pick a color from the screen' })).toBeNull()
  })

  it('ignores keys while disabled and submits the color under its name', async () => {
    const onValueChange = vi.fn()
    const { user, container } = renderWithProvider(
      <form>
        <ColorPicker inline disabled aria-label="Tint" name="tint" defaultValue="#ff0000" onValueChange={onValueChange} />
        <ColorPicker aria-label="Accent" name="accent" defaultValue="#00ff00" />
      </form>,
    )
    expect(area()).toHaveAttribute('aria-disabled', 'true')
    expect(area()).not.toHaveAttribute('tabindex')
    area().focus()
    await user.keyboard('{ArrowLeft}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(hexField()).toBeDisabled()
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('tint')).toBeNull()
    expect(data.get('accent')).toBe('#00ff00')
  })

  it('follows a controlled value', () => {
    renderWithProvider(
      <>
        <ColorPicker inline aria-label="First" value="rgb(255, 0, 0)" />
        <ColorPicker aria-label="Second" value="#0000FF" />
      </>,
    )
    expect(screen.getAllByRole('slider', { name: 'Hue' })[0]).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByRole('button', { name: 'Second' })).toHaveAccessibleDescription('#0000ff')
  })
})
