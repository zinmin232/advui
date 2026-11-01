import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, renderWithProvider, screen, within } from '../../../test/utils'
import { Kanban } from './Kanban'
import { type KanbanColumn, findItem, moveItem } from './moves'
import { placeAt } from './place'

const board = (): KanbanColumn[] => [
  {
    id: 'todo',
    title: 'To do',
    items: [
      { id: 'a', title: 'Write the report', description: 'Due Friday.' },
      { id: 'b', title: 'Clean the data' },
    ],
  },
  { id: 'doing', title: 'Doing', items: [{ id: 'c', title: 'Draw the map' }] },
  { id: 'done', title: 'Done', items: [{ id: 'd', title: 'Kickoff', disabled: true }] },
]

const status = () => screen.getByRole('status')
const titles = (name: RegExp) =>
  within(screen.getByRole('list', { name }))
    .queryAllByRole('button')
    .map((card) => card.textContent)

describe('Kanban', () => {
  it('is a named board of lists, each named with its count', () => {
    renderWithProvider(
      <Kanban
        aria-label="Sprint"
        defaultValue={[...board(), { id: 'later', title: 'Later', items: [] }]}
      />,
    )
    expect(screen.getByRole('region', { name: 'Sprint' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'To do, 2 cards' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Doing, 1 card' })).toBeInTheDocument()
    // A list needs items: an empty column is a named group.
    expect(screen.getByRole('group', { name: 'Later, 0 cards' })).toHaveTextContent('No cards')
    // Cards are named by their title, and described by their description
    // and how to move them.
    const card = screen.getByRole('button', { name: 'Write the report' })
    expect(card).toHaveAccessibleDescription(/^Due Friday. Press Space to pick the card up/)
    expect(screen.getByRole('button', { name: 'Kickoff' })).not.toHaveAttribute('aria-describedby')
  })

  it('moves a card with the keyboard, announcing each step, and keeps its focus', async () => {
    const onItemMove = vi.fn()
    const onValueChange = vi.fn()
    const { user } = renderWithProvider(
      <Kanban
        aria-label="Sprint"
        defaultValue={board()}
        onItemMove={onItemMove}
        onValueChange={onValueChange}
      />,
    )
    screen.getByRole('button', { name: /^Clean the data/ }).focus()
    await user.keyboard(' ')
    expect(status()).toHaveTextContent('Picked up Clean the data. To do, position 2 of 2.')
    await user.keyboard('{ArrowRight}')
    expect(status()).toHaveTextContent('Clean the data: Doing, position 2 of 2.')
    expect(titles(/^Doing/)).toEqual(['Draw the map', 'Clean the data'])
    expect(screen.getByRole('button', { name: 'Clean the data' })).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(titles(/^Doing/)).toEqual(['Clean the data', 'Draw the map'])
    // Nothing is saved until it is dropped.
    expect(onItemMove).not.toHaveBeenCalled()
    await user.keyboard(' ')
    expect(status()).toHaveTextContent('Dropped Clean the data in Doing, position 1 of 2.')
    expect(onItemMove).toHaveBeenCalledWith({
      itemId: 'b',
      from: { columnId: 'todo', index: 1 },
      to: { columnId: 'doing', index: 0 },
    })
    expect(onValueChange.mock.calls[0]![0][1].items.map((item: { id: string }) => item.id)).toEqual(
      ['b', 'c'],
    )
    expect(screen.getByRole('list', { name: 'Doing, 2 cards' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clean the data' })).toHaveFocus()
  })

  it('puts a card back on Escape', async () => {
    const onItemMove = vi.fn()
    const onItemDragStart = vi.fn()
    const onItemDragEnd = vi.fn()
    const { user } = renderWithProvider(
      <Kanban
        aria-label="Sprint"
        defaultValue={board()}
        onItemMove={onItemMove}
        onItemDragStart={onItemDragStart}
        onItemDragEnd={onItemDragEnd}
      />,
    )
    screen.getByRole('button', { name: /^Write the report/ }).focus()
    await user.keyboard(' ')
    expect(onItemDragStart).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }))
    expect(onItemDragEnd).not.toHaveBeenCalled()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(titles(/^Done/)).toEqual(['Write the reportDue Friday.', 'Kickoff'])
    await user.keyboard('{Escape}')
    expect(status()).toHaveTextContent('Write the report is back where it was.')
    expect(titles(/^To do/)).toEqual(['Write the reportDue Friday.', 'Clean the data'])
    expect(onItemMove).not.toHaveBeenCalled()
    expect(onItemDragEnd).toHaveBeenCalledTimes(1)
    expect(onItemDragEnd).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }))
    expect(screen.getByRole('button', { name: /^Write the report/ })).toHaveFocus()
  })

  it('opens a card with Enter or a press, and leaves a disabled one in place', async () => {
    const onItemPress = vi.fn()
    const { user } = renderWithProvider(
      <Kanban aria-label="Sprint" defaultValue={board()} onItemPress={onItemPress} />,
    )
    screen.getByRole('button', { name: /^Draw the map/ }).focus()
    await user.keyboard('{Enter}')
    expect(onItemPress).toHaveBeenCalledWith(expect.objectContaining({ id: 'c' }))
    await user.click(screen.getByRole('button', { name: 'Kickoff' }))
    expect(onItemPress).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'd' }))
    screen.getByRole('button', { name: 'Kickoff' }).focus()
    await user.keyboard(' {ArrowLeft}')
    expect(titles(/^Done/)).toEqual(['Kickoff'])
    expect(status()).toBeEmptyDOMElement()
  })

  describe('dragged with a pointer', () => {
    afterEach(() => vi.restoreAllMocks())

    // happy-dom has no layout: columns 300px apart, cards 50px apart in each.
    function fakeLayout() {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const lists = [...document.querySelectorAll('[role=list]')]
        const list = this.getAttribute('role') === 'list' ? this : this.closest('[role=list]')
        const column = lists.indexOf(list as Element)
        if (column === -1) return new DOMRect(0, 0, 0, 0)
        if (this === list) return new DOMRect(column * 300, 0, 280, 400)
        const cards = [...list!.querySelectorAll('[role=button]')]
        return new DOMRect(column * 300, cards.indexOf(this) * 50, 280, 40)
      })
    }

    const pointer = (type: string, x: number, y: number) =>
      act(() => {
        window.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1 }))
      })

    it('drops the card where the pointer lets go, with a placeholder on the way', () => {
      fakeLayout()
      const onItemMove = vi.fn()
      renderWithProvider(
        <Kanban aria-label="Sprint" defaultValue={board()} onItemMove={onItemMove} />,
      )
      const card = screen.getByRole('button', { name: /^Write the report/ })
      fireEvent.pointerDown(card, {
        button: 0,
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 10,
        clientY: 10,
      })
      // Below the slop, nothing happens yet.
      pointer('pointermove', 12, 11)
      expect(titles(/^To do/)).toHaveLength(2)
      // Over Doing, below its first card.
      pointer('pointermove', 320, 40)
      expect(titles(/^Doing/)).toEqual(['Draw the map', 'Write the reportDue Friday.'])
      pointer('pointerup', 320, 40)
      expect(onItemMove).toHaveBeenCalledWith({
        itemId: 'a',
        from: { columnId: 'todo', index: 0 },
        to: { columnId: 'doing', index: 1 },
      })
      expect(status()).toHaveTextContent('Dropped Write the report in Doing, position 2 of 2.')
    })

    it('cancels on Escape, and a press that starts no drag is a press', async () => {
      fakeLayout()
      const onItemPress = vi.fn()
      const onItemMove = vi.fn()
      const { user } = renderWithProvider(
        <Kanban
          aria-label="Sprint"
          defaultValue={board()}
          onItemPress={onItemPress}
          onItemMove={onItemMove}
        />,
      )
      const card = screen.getByRole('button', { name: /^Clean the data/ })
      fireEvent.pointerDown(card, {
        button: 0,
        pointerId: 1,
        pointerType: 'mouse',
        clientX: 10,
        clientY: 60,
      })
      pointer('pointermove', 620, 10)
      expect(titles(/^Done/)).toEqual(['Clean the data', 'Kickoff'])
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      })
      pointer('pointerup', 620, 10)
      expect(titles(/^To do/)).toEqual(['Write the reportDue Friday.', 'Clean the data'])
      expect(onItemMove).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: /^Clean the data/ }))
      expect(onItemPress).toHaveBeenCalledTimes(1)
    })
  })
})

describe('moveItem', () => {
  it('moves a card within and between columns, keeping untouched columns', () => {
    const columns = board()
    const across = moveItem(columns, 'a', 'doing', 1)
    expect(across.map((column) => column.items.map((item) => item.id))).toEqual([
      ['b'],
      ['c', 'a'],
      ['d'],
    ])
    expect(across[2]).toBe(columns[2])
    expect(moveItem(columns, 'a', 'todo', 5)[0]!.items.map((item) => item.id)).toEqual(['b', 'a'])
    expect(moveItem(columns, 'missing', 'todo', 0)).toEqual(columns)
    expect(findItem(columns, 'c')).toMatchObject({ index: 0, column: { id: 'doing' } })
    expect(findItem(columns, 'missing')).toBeNull()
  })
})

describe('placeAt', () => {
  it('finds the nearest column, and the index among its other cards', () => {
    const rects: Record<string, { x: number; y: number; width: number; height: number }> = {
      todo: { x: 0, y: 0, width: 100, height: 300 },
      doing: { x: 120, y: 0, width: 100, height: 300 },
      done: { x: 240, y: 0, width: 100, height: 300 },
      a: { x: 0, y: 0, width: 100, height: 40 },
      b: { x: 0, y: 50, width: 100, height: 40 },
      c: { x: 120, y: 0, width: 100, height: 40 },
      d: { x: 240, y: 0, width: 100, height: 40 },
    }
    const rectOf = (_kind: 'column' | 'card', id: string) => rects[id] ?? null
    // In the gap, nearer Doing; below the middle of its card.
    expect(placeAt(115, 30, board(), 'a', rectOf)).toEqual({ columnId: 'doing', index: 1 })
    // Far right of the board: the last column.
    expect(placeAt(900, 0, board(), 'a', rectOf)).toEqual({ columnId: 'done', index: 0 })
    // The dragged card itself does not count.
    expect(placeAt(10, 80, board(), 'a', rectOf)).toEqual({ columnId: 'todo', index: 1 })
  })
})
