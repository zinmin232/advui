import { useState } from 'react'
import { createPortal } from 'react-dom'
import { View } from 'tamagui'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Button } from '../button/Button'
import { DropdownMenu } from '../dropdown-menu/DropdownMenu'
import { IconButton } from '../icon-button/IconButton'
import { Input } from '../input/Input'
import { ToggleGroup } from '../toggle-group/ToggleGroup'
import { Text } from '../typography/Text'
import { Toolbar } from './Toolbar'

const style = (el: Element) => getComputedStyle(el)
const icon = <View width="$4" height="$4" />

function Formatting({ disabledItalic = false }: { disabledItalic?: boolean }) {
  return (
    <Toolbar role="toolbar" aria-label="Formatting">
      <Toolbar.Group aria-label="History">
        <Button>Undo</Button>
        <Button>Redo</Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <IconButton icon={icon} aria-label="Bold" />
      <IconButton icon={icon} aria-label="Italic" disabled={disabledItalic} />
      <IconButton icon={icon} aria-label="Underline" />
    </Toolbar>
  )
}

describe('Toolbar', () => {
  it('is a group with its children inside, unwrapped', () => {
    renderWithProvider(
      <Toolbar aria-label="Actions">
        <Button>New</Button>
        <Button>Edit</Button>
        <Text>3 selected</Text>
      </Toolbar>,
    )
    const bar = screen.getByRole('group', { name: 'Actions' })
    expect(bar).not.toHaveAttribute('aria-orientation')
    expect(bar.children).toHaveLength(3)
    expect(bar.children[0]).toBe(screen.getByRole('button', { name: 'New' }))
    expect(style(bar).flexDirection).toBe('row')
    expect(style(bar).alignItems).toBe('center')
  })

  it('wraps a text child in Text', () => {
    renderWithProvider(<Toolbar aria-label="Status">Saved</Toolbar>)
    expect(screen.getByText('Saved').tagName).toBe('SPAN')
  })

  it('renders leading, center and trailing in order, with no box for a missing one', () => {
    renderWithProvider(
      <>
        <Toolbar
          testID="full"
          leading="Users"
          center={<Input aria-label="Search users" />}
          trailing={<Button>Add user</Button>}
        />
        <Toolbar testID="ends" leading="Users" trailing={<Button>Export</Button>}>
          <Button>Filter</Button>
        </Toolbar>
      </>,
    )
    const full = screen.getByTestId('full')
    expect(full.children).toHaveLength(3)
    expect(full.children[0]).toHaveTextContent('Users')
    expect(full.children[1]).toContainElement(screen.getByRole('textbox', { name: 'Search users' }))
    expect(full.children[2]).toContainElement(screen.getByRole('button', { name: 'Add user' }))
    // The center takes the free space; trailing keeps its size at the end.
    expect(style(full.children[1]!).flexGrow).toBe('1')
    expect(style(full.children[1]!).justifyContent).toBe('center')
    expect(style(full.children[2]!).flexGrow).toBe('0')
    expect(style(full.children[2]!).flexShrink).toBe('0')

    // Children sit between leading and trailing; without a center, trailing
    // takes the free space and keeps its content at the end edge.
    const ends = screen.getByTestId('ends')
    expect(ends.children).toHaveLength(3)
    expect(ends.children[1]).toBe(screen.getByRole('button', { name: 'Filter' }))
    expect(style(ends.children[2]!).flexGrow).toBe('1')
    expect(style(ends.children[2]!).justifyContent).toBe('flex-end')
  })

  it('treats null and false regions as absent', () => {
    renderWithProvider(
      <Toolbar testID="bar" leading={null} center={false} trailing={<Button>Save</Button>} />,
    )
    expect(screen.getByTestId('bar').children).toHaveLength(1)
  })

  it('lays out a column with vertical orientation, hugging its controls', () => {
    renderWithProvider(
      <Toolbar testID="bar" orientation="vertical" aria-label="Tools">
        <Button>Move</Button>
        <Toolbar.Separator testID="separator" />
        <Button>Rotate</Button>
      </Toolbar>,
    )
    const bar = screen.getByTestId('bar')
    expect(style(bar).flexDirection).toBe('column')
    expect(style(bar).alignItems).toBe('stretch')
    expect(style(bar).alignSelf).toBe('flex-start')
    // Across the column: a horizontal line, hidden from assistive technology.
    const separator = screen.getByTestId('separator')
    expect(style(separator).height).toBe('1px')
    expect(separator).toHaveAttribute('aria-hidden', 'true')
  })

  it('draws a vertical separator in a row, and can make it semantic', () => {
    renderWithProvider(
      <Toolbar aria-label="Edit">
        <Button>Cut</Button>
        <Toolbar.Separator testID="decorative" />
        <Toolbar.Separator decorative={false} />
        <Button>Paste</Button>
      </Toolbar>,
    )
    expect(style(screen.getByTestId('decorative')).width).toBe('1px')
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('groups take the toolbar orientation unless they set their own', () => {
    renderWithProvider(
      <Toolbar aria-label="Edit">
        <Toolbar.Group aria-label="Clipboard">
          <Button>Copy</Button>
        </Toolbar.Group>
        <Toolbar.Group aria-label="Zoom" orientation="vertical">
          <Button>In</Button>
          <Toolbar.Separator testID="inner" />
          <Button>Out</Button>
        </Toolbar.Group>
      </Toolbar>,
    )
    expect(style(screen.getByRole('group', { name: 'Clipboard' })).flexDirection).toBe('row')
    expect(style(screen.getByRole('group', { name: 'Zoom' })).flexDirection).toBe('column')
    expect(style(screen.getByTestId('inner')).height).toBe('1px')
  })

  it('throws when a part is used outside a Toolbar', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderWithProvider(<Toolbar.Separator />)).toThrow(
      'Toolbar.Separator must be rendered inside <Toolbar>.',
    )
    error.mockRestore()
  })

  it('sets gap, padding and a minimum height per size', () => {
    renderWithProvider(
      <>
        <Toolbar testID="sm" size="sm" />
        <Toolbar testID="md" />
        <Toolbar testID="lg" size="lg" />
        <Toolbar testID="ghost" variant="ghost" />
      </>,
    )
    const sm = style(screen.getByTestId('sm'))
    expect([sm.gap, sm.paddingTop, sm.minHeight]).toEqual(['4px', '4px', '40px'])
    const md = style(screen.getByTestId('md'))
    expect([md.gap, md.paddingTop, md.minHeight]).toEqual(['8px', '8px', '56px'])
    const lg = style(screen.getByTestId('lg'))
    expect([lg.gap, lg.paddingTop, lg.minHeight]).toEqual(['12px', '16px', '80px'])
    // Ghost sits flush inside its surface: no padding, so a control's height.
    const ghost = style(screen.getByTestId('ghost'))
    expect([ghost.paddingTop, ghost.minHeight]).toEqual(['0px', '40px'])
  })

  it('styles the container per variant', () => {
    renderWithProvider(
      <>
        <View testID="background" backgroundColor="$background" />
        <View testID="muted" backgroundColor="$muted" />
        <View testID="border" borderWidth={1} borderColor="$border" />
        <Toolbar testID="default" />
        <Toolbar testID="outline" variant="outline" />
        <Toolbar testID="filled" variant="filled" />
        <Toolbar testID="ghost" variant="ghost" />
      </>,
    )
    const color = (id: string) => style(screen.getByTestId(id)).backgroundColor
    expect(color('default')).toBe(color('background'))
    expect(color('outline')).toBe(color('background'))
    expect(color('filled')).toBe(color('muted'))
    expect(['', 'transparent', 'rgba(0, 0, 0, 0)']).toContain(color('ghost'))
    expect(style(screen.getByTestId('outline')).borderTopWidth).toBe('1px')
    expect(style(screen.getByTestId('outline')).borderTopColor).toBe(
      style(screen.getByTestId('border')).borderTopColor,
    )
    expect(['', '0px']).toContain(style(screen.getByTestId('filled')).borderTopWidth)
  })

  it('lets style props override the variant and size, in any order', () => {
    renderWithProvider(
      <>
        <View testID="accent" backgroundColor="$accent" borderColor="$ring" />
        <Toolbar
          testID="custom"
          padding="$5"
          gap="$4"
          backgroundColor="$accent"
          borderColor="$ring"
          borderRadius="$0"
          variant="outline"
          size="sm"
          leading={<Text>Title</Text>}
          trailing={<Button>Save</Button>}
        >
          <Button>Cancel</Button>
        </Toolbar>
      </>,
    )
    const custom = screen.getByTestId('custom')
    const accent = style(screen.getByTestId('accent'))
    expect(style(custom).paddingTop).toBe('20px')
    expect(style(custom).gap).toBe('16px')
    expect(style(custom).backgroundColor).toBe(accent.backgroundColor)
    expect(style(custom).borderTopColor).toBe(accent.borderTopColor)
    expect(style(custom).borderTopLeftRadius).toBe('0px')
    // Regions use the same gap; the controls keep their own look.
    expect(style(custom.children[0]!).gap).toBe('16px')
    const save = screen.getByRole('button', { name: 'Save' })
    expect(style(save).backgroundColor).not.toBe(accent.backgroundColor)
  })

  it('maps align, distribute and wrap to flexbox', () => {
    renderWithProvider(
      <>
        <Toolbar testID="end" align="end" distribute="between" wrap>
          <Button>One</Button>
          <Button>Two</Button>
        </Toolbar>
        <Toolbar testID="default" />
        <Toolbar testID="trailing" wrap trailing={<Button>Go</Button>} />
      </>,
    )
    const end = style(screen.getByTestId('end'))
    expect([end.alignItems, end.justifyContent, end.flexWrap]).toEqual([
      'flex-end',
      'space-between',
      'wrap',
    ])
    expect(style(screen.getByTestId('default')).flexWrap).toBe('nowrap')
    // Regions wrap their own content too, and trailing may shrink to do it,
    // so nothing spills past the edge.
    const trailing = style(screen.getByTestId('trailing').children[0]!)
    expect([trailing.flexWrap, trailing.flexShrink]).toEqual(['wrap', '1'])
  })

  it('keeps child controls working', async () => {
    const onPress = vi.fn()
    const { user } = renderWithProvider(
      <Toolbar aria-label="Search" leading={<Input aria-label="Query" />}>
        <Button onPress={onPress}>Search</Button>
      </Toolbar>,
    )
    await user.type(screen.getByRole('textbox', { name: 'Query' }), 'maps')
    expect(screen.getByRole('textbox', { name: 'Query' })).toHaveValue('maps')
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('as a group, leaves every control in the Tab order and the arrow keys alone', async () => {
    const { user } = renderWithProvider(
      <Toolbar aria-label="Actions">
        <Button>New</Button>
        <Button>Edit</Button>
      </Toolbar>,
    )
    const [first, second] = screen.getAllByRole('button')
    expect(first).not.toHaveAttribute('tabindex', '-1')
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(first).toHaveFocus()
    await user.tab()
    expect(second).toHaveFocus()
  })

  describe('role="toolbar"', () => {
    it('is a named toolbar with its orientation', () => {
      renderWithProvider(<Formatting />)
      expect(screen.getByRole('toolbar', { name: 'Formatting' })).toHaveAttribute(
        'aria-orientation',
        'horizontal',
      )
      expect(screen.getByRole('group', { name: 'History' })).toBeInTheDocument()
    })

    it('is one Tab stop, and the arrow keys, Home and End move along it', async () => {
      const { user } = renderWithProvider(
        <>
          <Formatting />
          <Button>After</Button>
        </>,
      )
      const undo = screen.getByRole('button', { name: 'Undo' })
      const redo = screen.getByRole('button', { name: 'Redo' })
      const underline = screen.getByRole('button', { name: 'Underline' })
      await waitFor(() => expect(undo).toHaveAttribute('tabindex', '0'))
      expect(redo).toHaveAttribute('tabindex', '-1')

      await user.tab()
      expect(undo).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      expect(redo).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus()
      await user.keyboard('{End}')
      expect(underline).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      expect(undo).toHaveFocus()
      await user.keyboard('{ArrowLeft}')
      expect(underline).toHaveFocus()
      await user.keyboard('{Home}')
      expect(undo).toHaveFocus()
      // Up and Down belong to the controls in a horizontal toolbar.
      await user.keyboard('{ArrowDown}')
      expect(undo).toHaveFocus()

      // Tab leaves the toolbar, and coming back returns to the last control.
      await user.keyboard('{End}')
      await user.tab()
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus()
      await user.tab({ shift: true })
      expect(underline).toHaveFocus()
    })

    it('skips disabled controls', async () => {
      const { user } = renderWithProvider(<Formatting disabledItalic />)
      await user.click(screen.getByRole('button', { name: 'Bold' }))
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'Underline' })).toHaveFocus()
    })

    it('makes a clicked control the Tab stop', async () => {
      const { user } = renderWithProvider(<Formatting />)
      const bold = screen.getByRole('button', { name: 'Bold' })
      await user.click(bold)
      expect(bold).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute('tabindex', '-1')
    })

    it('uses Up and Down when vertical', async () => {
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" orientation="vertical" aria-label="Tools">
          <Button>Move</Button>
          <Button>Rotate</Button>
        </Toolbar>,
      )
      expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical')
      await user.tab()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'Move' })).toHaveFocus()
      await user.keyboard('{ArrowDown}')
      expect(screen.getByRole('button', { name: 'Rotate' })).toHaveFocus()
      await user.keyboard('{ArrowUp}')
      expect(screen.getByRole('button', { name: 'Move' })).toHaveFocus()
    })

    it('leaves fields their Tab stop and arrow keys', async () => {
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" aria-label="Table">
          <Button>Export</Button>
          <Input aria-label="Filter" />
          <Button>Add</Button>
        </Toolbar>,
      )
      const filter = screen.getByRole('textbox', { name: 'Filter' })
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Add' })).toHaveAttribute('tabindex', '-1'),
      )
      expect(filter).not.toHaveAttribute('tabindex', '-1')

      await user.tab()
      await user.keyboard('{ArrowRight}')
      // The arrow keys pass over the field…
      expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus()
      // …which Tab reaches, and where they move the caret.
      await user.tab({ shift: true })
      expect(filter).toHaveFocus()
      await user.keyboard('abc{ArrowLeft}{Home}')
      expect(filter).toHaveFocus()
      expect(filter).toHaveValue('abc')
    })

    it('moves through a Toggle Group inside it, and out of it', async () => {
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" aria-label="Formatting">
          <Button>Undo</Button>
          <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
            <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
            <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
          </ToggleGroup>
          <Button>Redo</Button>
        </Toolbar>,
      )
      const [left, right] = screen.getAllByRole('radio')
      await waitFor(() => expect(left).toHaveAttribute('tabindex', '-1'))
      await user.tab()
      await user.keyboard('{ArrowRight}')
      expect(left).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      expect(right).toHaveFocus()
      // Focus moves without choosing; Space chooses.
      expect(right).toHaveAttribute('aria-checked', 'false')
      await user.keyboard(' ')
      expect(right).toHaveAttribute('aria-checked', 'true')
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'Redo' })).toHaveFocus()
      // Choosing re-renders the group; the toolbar keeps the only Tab stop.
      const stops = [...screen.getAllByRole('button'), ...screen.getAllByRole('radio')].filter(
        (el) => el.tabIndex === 0,
      )
      expect(stops).toEqual([screen.getByRole('button', { name: 'Redo' })])
    })

    it('ignores keys from content portalled out of it', async () => {
      function Portalled() {
        return createPortal(<Button>Outside</Button>, document.body)
      }
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" aria-label="Actions">
          <Button>One</Button>
          <Button>Two</Button>
          <Portalled />
        </Toolbar>,
      )
      const outside = screen.getByRole('button', { name: 'Outside' })
      expect(outside).not.toHaveAttribute('tabindex', '-1')
      outside.focus()
      await user.keyboard('{ArrowRight}')
      expect(outside).toHaveFocus()
    })

    it('leaves an open menu its arrow keys', async () => {
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" aria-label="Actions">
          <Button>Refresh</Button>
          <DropdownMenu>
            <DropdownMenu.Trigger>
              <Button>More</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => {}}>Rename</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => {}}>Delete</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </Toolbar>,
      )
      await user.click(screen.getByRole('button', { name: 'More' }))
      await screen.findByRole('menu')
      const [rename] = screen.getAllByRole('menuitem')
      rename!.focus()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'Refresh' })).not.toHaveFocus()
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('a handler that prevents the default keeps the key', async () => {
      const onKeyDown = vi.fn((event: { key: string; preventDefault: () => void }) => {
        if (event.key === 'ArrowRight') event.preventDefault()
      })
      const { user } = renderWithProvider(
        <Toolbar role="toolbar" aria-label="Actions" onKeyDown={onKeyDown as never}>
          <Button>One</Button>
          <Button>Two</Button>
        </Toolbar>,
      )
      await user.tab()
      await user.keyboard('{ArrowRight}')
      expect(onKeyDown).toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus()
    })

    it('picks up controls added later, and gives tabindex back when it stops', async () => {
      function Switching() {
        const [arrows, setArrows] = useState(true)
        const [extra, setExtra] = useState(false)
        return (
          <>
            <Toolbar role={arrows ? 'toolbar' : 'group'} aria-label="Actions">
              <Button>One</Button>
              {extra ? <Button>Two</Button> : null}
            </Toolbar>
            <Button onPress={() => setExtra(true)}>Add</Button>
            <Button onPress={() => setArrows(false)}>Plain</Button>
          </>
        )
      }
      const { user } = renderWithProvider(<Switching />)
      await user.click(screen.getByRole('button', { name: 'Add' }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('tabindex', '-1'),
      )
      await user.click(screen.getByRole('button', { name: 'Plain' }))
      expect(screen.queryByRole('toolbar')).toBeNull()
      expect(screen.getByRole('button', { name: 'Two' }).tabIndex).toBe(0)
      expect(screen.getByRole('button', { name: 'One' }).tabIndex).toBe(0)
    })

    it('re-picks the Tab stop when the focused control is disabled', async () => {
      function Undoable() {
        const [done, setDone] = useState(false)
        return (
          <Toolbar role="toolbar" aria-label="History">
            <Button disabled={done} onPress={() => setDone(true)}>
              Undo
            </Button>
            <Button>Redo</Button>
          </Toolbar>
        )
      }
      renderWithProvider(<Undoable />)
      const undo = screen.getByRole('button', { name: 'Undo' })
      fireEvent.click(undo)
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Redo' })).toHaveAttribute('tabindex', '0'),
      )
    })
  })
})
