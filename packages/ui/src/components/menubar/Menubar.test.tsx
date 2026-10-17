import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProvider, screen, waitFor } from '../../../test/utils'
import { Menubar } from './Menubar'

function Example({
  onNew = () => {},
  onUndo = () => {},
  onValueChange,
  value,
}: {
  onNew?: () => void
  onUndo?: () => void
  onValueChange?: (value: string | null) => void
  value?: string | null
}) {
  return (
    <Menubar aria-label="Editor" value={value} onValueChange={onValueChange}>
      <Menubar.Menu value="file">
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item onSelect={onNew} shortcut="⌘N">
            New file
          </Menubar.Item>
          <Menubar.Item>Open…</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu value="share">
        <Menubar.Trigger disabled>Share</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item>Copy link</Menubar.Item>
        </Menubar.Content>
      </Menubar.Menu>
      <Menubar.Menu value="edit">
        <Menubar.Trigger>Edit</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Item onSelect={onUndo}>Undo</Menubar.Item>
          <Menubar.CheckboxItem checked>Word wrap</Menubar.CheckboxItem>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar>
  )
}

const trigger = (name: string) => screen.getByRole('menuitem', { name })

describe('Menubar', () => {
  it('is a named menubar of menu buttons with one Tab stop', () => {
    renderWithProvider(<Example />)
    expect(screen.getByRole('menubar', { name: 'Editor' })).toBeInTheDocument()
    expect(trigger('File')).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
    expect(trigger('File')).toHaveAttribute('tabindex', '0')
    expect(trigger('Edit')).toHaveAttribute('tabindex', '-1')
    expect(trigger('Share')).toHaveAttribute('aria-disabled', 'true')
    expect(trigger('Share')).toHaveAttribute('tabindex', '-1')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('opens a menu on press and calls onSelect', async () => {
    const onNew = vi.fn()
    const { user } = renderWithProvider(<Example onNew={onNew} />)
    await user.click(trigger('File'))
    const menu = await screen.findByRole('menu')
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'true')
    expect(trigger('File')).toHaveAttribute('aria-controls', menu.id)
    await user.click(screen.getByRole('menuitem', { name: /New file/ }))
    expect(onNew).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('closes when its trigger is pressed again', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(trigger('File'))
    await screen.findByRole('menu')
    await user.click(trigger('File'))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens another menu when the pointer moves to its trigger', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(trigger('File'))
    await screen.findByRole('menu')
    await user.hover(trigger('Edit'))
    await waitFor(() => expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true'))
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1))
    expect(screen.getByRole('menuitem', { name: 'Undo' })).toBeInTheDocument()
  })

  it('does not open menus on hover while all are closed', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.hover(trigger('Edit'))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('moves along the bar with the arrow keys, skipping disabled triggers', async () => {
    const { user } = renderWithProvider(<Example />)
    trigger('File').focus()
    await user.keyboard('{ArrowRight}')
    expect(trigger('Edit')).toHaveFocus()
    expect(trigger('Edit')).toHaveAttribute('tabindex', '0')
    await user.keyboard('{ArrowRight}')
    expect(trigger('File')).toHaveFocus()
    await user.keyboard('{End}')
    expect(trigger('Edit')).toHaveFocus()
  })

  // Many steps, each waiting for a menu to open: slow when the whole suite runs.
  it('opens from the keyboard, moves between menus and returns focus on Escape', async () => {
    const onUndo = vi.fn()
    const { user } = renderWithProvider(<Example onUndo={onUndo} />)
    trigger('File').focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /New file/ })).toHaveFocus())
    // Right from an open menu opens the next enabled one (Share is disabled).
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveFocus())
    expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true')
    expect(trigger('File')).toHaveAttribute('aria-expanded', 'false')
    // And wraps at the end.
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /New file/ })).toHaveFocus())
    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveFocus())
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    await waitFor(() => expect(trigger('Edit')).toHaveFocus())
    expect(onUndo).not.toHaveBeenCalled()
  }, 15_000)

  it('closes on Escape while a menu it left is still closing', async () => {
    const { user } = renderWithProvider(<Example />)
    trigger('File').focus()
    await user.keyboard('{Enter}')
    await screen.findByRole('menuitem', { name: /New file/ })
    await user.keyboard('{ArrowRight}')
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1))
    // File opens again above Edit, which is still closing and so opens again
    // below it: Escape reaches the closing File menu first.
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    await waitFor(() => expect(trigger('Edit')).toHaveFocus())
  })

  it('returns focus to the trigger after a choice', async () => {
    const onUndo = vi.fn()
    const { user } = renderWithProvider(<Example onUndo={onUndo} />)
    trigger('Edit').focus()
    await user.keyboard('{Enter}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveFocus())
    await user.keyboard('{Enter}')
    expect(onUndo).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(trigger('Edit')).toHaveFocus())
  })

  it('opens with ArrowDown', async () => {
    const { user } = renderWithProvider(<Example />)
    trigger('Edit').focus()
    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Undo' })).toHaveFocus())
  })

  it('does not open a disabled menu', async () => {
    const { user } = renderWithProvider(<Example />)
    await user.click(trigger('Share'))
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('reports the open menu and follows a controlled value', async () => {
    function Controlled({ onValueChange }: { onValueChange: (value: string | null) => void }) {
      const [value, setValue] = useState<string | null>('edit')
      return (
        <Example
          value={value}
          onValueChange={(next) => {
            onValueChange(next)
            setValue(next)
          }}
        />
      )
    }
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(<Controlled onValueChange={onValueChange} />)
    expect(await screen.findByRole('menuitem', { name: 'Undo' })).toBeInTheDocument()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith('file')
    await screen.findByRole('menuitem', { name: /New file/ })
    await user.keyboard('{Escape}')
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('closes the menu the pointer opened when its trigger is pressed', async () => {
    // As in desktop menu bars: with a menu open, pointing at another trigger
    // opens its menu, and pressing that trigger then closes it.
    const { user } = renderWithProvider(<Example />)
    await user.click(trigger('File'))
    await screen.findByRole('menu')
    await user.click(trigger('Edit'))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})
