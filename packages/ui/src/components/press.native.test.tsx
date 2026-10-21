// A finger that lands on a press view and slides off before lifting must not
// press it. Tamagui 2 called onPress on every release; Tamagui 3 hands presses
// to React Native's Pressability, which cancels them outside the view's press
// rectangle (the view plus 20 on the sides and top, 30 below).
import { describe, expect, it, jest } from '@jest/globals'
import { fireEvent, screen } from '@testing-library/react-native'
import { PlusIcon } from '@advui/icons'
import type { ReactElement } from 'react'
import { pressRect, renderNative, touchAt } from '../../test/native-utils'
import { Accordion } from './accordion/Accordion'
import { Button } from './button/Button'
import { Fab } from './fab/Fab'
import { ListItem } from './list-item/ListItem'

const inside = { x: pressRect.width / 2, y: pressRect.height / 2 }
// Below the view and past its 30 point press-rect offset.
const outside = { x: inside.x, y: pressRect.height + 80 }

/** Lands on the view, moves through `path`, and lifts at its last point. */
async function drag(target: ReturnType<typeof screen.getByRole>, path: { x: number; y: number }[]) {
  await fireEvent(target, 'responderGrant', touchAt(inside.x, inside.y))
  for (const point of path) await fireEvent(target, 'responderMove', touchAt(point.x, point.y))
  const end = path.at(-1) ?? inside
  await fireEvent(target, 'responderRelease', touchAt(end.x, end.y, { lifted: true }))
}

const cases: {
  name: string
  render: (onPress: () => void) => ReactElement
  role: string
  label: string
}[] = [
  {
    name: 'Button',
    render: (onPress) => <Button onPress={onPress}>Save</Button>,
    role: 'button',
    label: 'Save',
  },
  {
    name: 'FAB',
    render: (onPress) => <Fab icon={<PlusIcon />} aria-label="Add" onPress={onPress} />,
    role: 'button',
    label: 'Add',
  },
  {
    name: 'List Item row',
    render: (onPress) => <ListItem title="Settings" onPress={onPress} />,
    role: 'button',
    label: 'Settings',
  },
]

describe('a press that slides off', () => {
  for (const { name, render, role, label } of cases) {
    describe(name, () => {
      it('is cancelled when the finger lifts outside the view', async () => {
        const onPress = jest.fn()
        await renderNative(render(onPress))
        await drag(screen.getByRole(role, { name: label }), [outside])
        expect(onPress).not.toHaveBeenCalled()
      })

      it('still presses when the finger moves within reach of the view', async () => {
        const onPress = jest.fn()
        await renderNative(render(onPress))
        await drag(screen.getByRole(role, { name: label }), [{ x: inside.x + 10, y: inside.y + 5 }])
        expect(onPress).toHaveBeenCalledTimes(1)
      })

      it('presses again when the finger comes back before lifting', async () => {
        const onPress = jest.fn()
        await renderNative(render(onPress))
        await drag(screen.getByRole(role, { name: label }), [outside, inside])
        expect(onPress).toHaveBeenCalledTimes(1)
      })
    })
  }

  it('leaves an Accordion section closed when the finger slides off its trigger', async () => {
    await renderNative(
      <Accordion type="single" collapsible>
        <Accordion.Item value="one">
          <Accordion.Trigger>Shipping</Accordion.Trigger>
          <Accordion.Content>Ships in two days.</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    const trigger = () => screen.getByRole('button', { name: 'Shipping' })
    await drag(trigger(), [outside])
    expect(trigger()).toBeCollapsed()
    await drag(trigger(), [])
    expect(trigger()).toBeExpanded()
  })
})
