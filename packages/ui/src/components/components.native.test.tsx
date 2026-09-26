import { describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { PlusIcon } from '@advui/icons'
import { zIndex } from '@advui/theme'
import { StyleSheet } from 'react-native'
import { renderNative } from '../../test/native-utils'
import { Accordion } from './accordion/Accordion'
import { Alert } from './alert/Alert'
import { Avatar } from './avatar/Avatar'
import { Badge } from './badge/Badge'
import { Button } from './button/Button'
import { Card } from './card/Card'
import { Checkbox } from './checkbox/Checkbox'
import { DropdownMenu } from './dropdown-menu/DropdownMenu'
import { IconButton } from './icon-button/IconButton'
import { Input } from './input/Input'
import { Popover } from './popover/Popover'
import { Progress } from './progress/Progress'
import { Slider } from './slider/Slider'
import { Switch } from './switch/Switch'
import { Toaster, toast } from './toast/Toaster'
import { Heading } from './typography/Heading'
import { Text } from './typography/Text'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files) — the same code Expo ships to iOS and Android.

describe('native rendering', () => {
  it('Button exposes the button role, fires onPress and blocks presses when disabled', async () => {
    const onPress = jest.fn()
    const onDisabledPress = jest.fn()
    await renderNative(
      <>
        <Button onPress={onPress} icon={<PlusIcon />}>
          Save
        </Button>
        <Button disabled onPress={onDisabledPress}>
          Disabled
        </Button>
      </>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledTimes(1)

    const disabled = screen.getByRole('button', { name: 'Disabled' })
    expect(disabled).toBeDisabled()
    await fireEvent.press(disabled)
    expect(onDisabledPress).not.toHaveBeenCalled()
  })

  it('Button loading state uses the native ActivityIndicator and aria-busy', async () => {
    await renderNative(<Button loading>Saving</Button>)
    expect(screen.getByRole('button', { name: /Saving/ })).toBeBusy()
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeOnTheScreen()
  })

  it('IconButton is named by its aria-label', async () => {
    await renderNative(<IconButton aria-label="Add item" icon={<PlusIcon />} />)
    expect(screen.getByRole('button', { name: 'Add item' })).toBeOnTheScreen()
  })

  it('Switch and Checkbox toggle with checked state', async () => {
    const onSwitch = jest.fn()
    const onCheck = jest.fn()
    await renderNative(
      <>
        <Switch aria-label="Wi-Fi" onCheckedChange={onSwitch} />
        <Checkbox aria-label="Terms" onCheckedChange={onCheck} />
      </>,
    )
    await fireEvent.press(screen.getByRole('switch', { name: 'Wi-Fi' }))
    expect(onSwitch).toHaveBeenCalledWith(true)
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Terms' }))
    expect(onCheck).toHaveBeenCalledWith(true)
  })

  it('Input reports text changes', async () => {
    const onChangeText = jest.fn()
    await renderNative(
      <Input aria-label="Email" placeholder="you@example.com" onChangeText={onChangeText} />,
    )
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'hi@example.com')
    expect(onChangeText).toHaveBeenCalledWith('hi@example.com')
  })

  it('Card, typography, badge, avatar and alert compose in light and dark mode', async () => {
    for (const mode of ['light', 'dark'] as const) {
      const { unmount } = await renderNative(
        <Card>
          <Card.Header>
            <Heading level={2}>Profile</Heading>
            <Text tone="muted">Details</Text>
          </Card.Header>
          <Card.Content>
            <Avatar alt="Ada Lovelace" />
            <Badge variant="success">Active</Badge>
            <Alert variant="error">
              <Alert.Title>Failed</Alert.Title>
            </Alert>
            <Progress value={40} label="Upload" />
          </Card.Content>
        </Card>,
        mode,
      )
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeOnTheScreen()
      expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeOnTheScreen()
      expect(screen.getByRole('alert')).toBeOnTheScreen()
      expect(screen.getByRole('progressbar', { name: 'Upload' })).toBeOnTheScreen()
      await unmount()
    }
  })

  it('Toaster portals toasts with a zIndex Android can represent', async () => {
    // Fake timers let the enter/exit animations finish inside act().
    jest.useFakeTimers()
    await renderNative(<Toaster />)
    await act(async () => {
      toast.success('Saved')
    })
    // Android stores zIndex as a 32-bit int; larger values overflow and the
    // toast renders beneath the screen.
    const zIndices: number[] = []
    for (let node = screen.getByText('Saved').parent; node; node = node.parent) {
      const value = StyleSheet.flatten(node.props.style)?.zIndex
      if (typeof value === 'number') zIndices.push(value)
    }
    expect(zIndices).toContain(zIndex.toast)
    expect(Math.max(...zIndices)).toBeLessThanOrEqual(2 ** 31 - 1)

    await act(async () => {
      toast.dismiss()
      jest.runAllTimers()
    })
    jest.useRealTimers()
  })
  it('Accordion triggers are buttons that expand their section', async () => {
    await renderNative(
      <Accordion type="single" collapsible>
        <Accordion.Item value="one">
          <Accordion.Trigger>Shipping</Accordion.Trigger>
          <Accordion.Content>Three to five days</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    const trigger = screen.getByRole('button', { name: 'Shipping' })
    expect(trigger).toBeCollapsed()
    await fireEvent.press(trigger)
    expect(screen.getByRole('button', { name: 'Shipping' })).toBeExpanded()
    expect(screen.getByText('Three to five days')).toBeOnTheScreen()
  })

  it('Slider thumbs respond to screen-reader increment / decrement actions', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Slider aria-label="Volume" defaultValue={40} step={5} onValueChange={onValueChange} />,
    )
    const thumb = screen.getByRole('slider', { name: 'Volume' })
    await fireEvent(thumb, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onValueChange).toHaveBeenLastCalledWith(45)
    await fireEvent(thumb, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } })
    expect(onValueChange).toHaveBeenLastCalledWith(40)
  })

  it('DropdownMenu opens a sheet of accessible items and closes after a choice', async () => {
    const onSelect = jest.fn()
    const onCheckedChange = jest.fn()
    await renderNative(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <Button>Options</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onSelect}>Rename</DropdownMenu.Item>
          <DropdownMenu.CheckboxItem checked onCheckedChange={onCheckedChange}>
            Pinned
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Options' }))
    expect(screen.getByRole('checkbox', { name: 'Pinned' })).toBeChecked()
    // Screen readers activate rows with the "activate" action (double-tap).
    await fireEvent(screen.getByRole('menuitem', { name: 'Rename' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
  it('Popover opens its content from the trigger (bottom sheet on native)', async () => {
    await renderNative(
      <Popover>
        <Popover.Trigger asChild>
          <Button>Dimensions</Button>
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Layer size</Popover.Title>
          <Text>Width and height</Text>
        </Popover.Content>
      </Popover>,
    )
    expect(screen.queryByText('Layer size')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Dimensions' }))
    expect(await screen.findByText('Layer size')).toBeOnTheScreen()
    expect(screen.getByText('Width and height')).toBeOnTheScreen()
  })
  it('wraps text made of several JSX pieces ("Status ({count})") in Text', async () => {
    const count = 2
    await renderNative(
      <>
        <Button>Status ({count})</Button>
        <Badge>{count} new</Badge>
      </>,
    )
    // Smoke test: devices throw on bare strings outside <Text>, the Jest renderer
    // does not; the logic is covered by utils/isTextContent.test.ts.
    expect(screen.getByText('Status (2)').type).toBe('Text')
    expect(screen.getByText('2 new').type).toBe('Text')
  })
})
