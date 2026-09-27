import { describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { HomeIcon, PlusIcon, SearchIcon } from '@advui/icons'
import { zIndex } from '@advui/theme'
import { StyleSheet } from 'react-native'
import { renderNative } from '../../test/native-utils'
import { Accordion } from './accordion/Accordion'
import { AlertDialog } from './alert-dialog/AlertDialog'
import { Alert } from './alert/Alert'
import { Avatar } from './avatar/Avatar'
import { Badge } from './badge/Badge'
import { Breadcrumb } from './breadcrumb/Breadcrumb'
import { Button } from './button/Button'
import { Card } from './card/Card'
import { Checkbox } from './checkbox/Checkbox'
import { Chip } from './chip/Chip'
import { DropdownMenu } from './dropdown-menu/DropdownMenu'
import { Fab } from './fab/Fab'
import { IconButton } from './icon-button/IconButton'
import { Input } from './input/Input'
import { NavigationBar } from './navigation-bar/NavigationBar'
import { Popover } from './popover/Popover'
import { Progress } from './progress/Progress'
import { Sheet } from './sheet/Sheet'
import { Slider } from './slider/Slider'
import { Snackbar } from './snackbar/Snackbar'
import { Switch } from './switch/Switch'
import { Toaster, toast } from './toast/Toaster'
import { Toggle } from './toggle/Toggle'
import { ToggleGroup } from './toggle-group/ToggleGroup'
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
    // The sheet stays mounted while closed; its rows must be hidden from screen readers.
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull()
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
  it('AlertDialog opens an alertdialog and runs the action', async () => {
    const onDelete = jest.fn()
    await renderNative(
      <AlertDialog>
        <AlertDialog.Trigger asChild>
          <Button>Delete project</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Title>Delete Atlas?</AlertDialog.Title>
          <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
          <AlertDialog.Cancel asChild>
            <Button>Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button onPress={onDelete}>Delete</Button>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog>,
    )
    expect(screen.queryByText('Delete Atlas?')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Delete project' }))
    // Dialog containers are not accessibility elements, so query their content.
    let node: { props: { role?: string }; parent: unknown } | null =
      await screen.findByText('Delete Atlas?')
    while (node && node.props.role !== 'alertdialog') node = node.parent as typeof node
    expect(node?.props.role).toBe('alertdialog')
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('Sheet content is hidden from screen readers until it opens', async () => {
    const onOpenChange = jest.fn()
    await renderNative(
      <Sheet onOpenChange={onOpenChange}>
        <Sheet.Trigger>
          <Button>Edit profile</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Title>Profile</Sheet.Title>
          <Sheet.Close>
            <Button>Cancel</Button>
          </Sheet.Close>
        </Sheet.Content>
      </Sheet>,
    )
    expect(screen.queryByRole('heading', { name: 'Profile' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Edit profile' }))
    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('Toggle and ToggleGroup report their checked state', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <>
        <Toggle aria-label="Bold" />
        <ToggleGroup type="single" defaultValue="left" onValueChange={onValueChange}>
          <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
          <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
        </ToggleGroup>
      </>,
    )
    const bold = screen.getByRole('togglebutton', { name: 'Bold' })
    expect(bold.props.accessibilityState).toMatchObject({ checked: false })
    await fireEvent.press(bold)
    expect(
      screen.getByRole('togglebutton', { name: 'Bold' }).props.accessibilityState,
    ).toMatchObject({ checked: true })

    expect(screen.getByRole('radio', { name: 'Left' })).toBeChecked()
    await fireEvent.press(screen.getByRole('radio', { name: 'Right' }))
    expect(onValueChange).toHaveBeenLastCalledWith('right')
    expect(screen.getByRole('radio', { name: 'Right' })).toBeChecked()
    // Screen-reader double-tap.
    await fireEvent(screen.getByRole('radio', { name: 'Left' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(onValueChange).toHaveBeenLastCalledWith('left')
  })

  it('Breadcrumb items are links only with onPress; the current page says so', async () => {
    const onPress = jest.fn()
    await renderNative(
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item onPress={onPress}>Projects</Breadcrumb.Item>
        <Breadcrumb.Item>Atlas</Breadcrumb.Item>
      </Breadcrumb>,
    )
    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull()
    await fireEvent.press(screen.getByRole('link', { name: 'Projects' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    await fireEvent(screen.getByRole('link', { name: 'Projects' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(onPress).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText('Atlas, current page')).toBeOnTheScreen()
  })

  it('Fab is a button named by its label', async () => {
    const onPress = jest.fn()
    await renderNative(<Fab icon={<PlusIcon />} aria-label="New project" onPress={onPress} />)
    await fireEvent.press(screen.getByRole('button', { name: 'New project' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Chip: filter chips report checked; input chips have a remove button', async () => {
    const onRemove = jest.fn()
    await renderNative(
      <>
        <Chip defaultSelected={false}>Vegan</Chip>
        <Chip onRemove={onRemove}>Ada Lovelace</Chip>
      </>,
    )
    const vegan = screen.getByRole('togglebutton', { name: 'Vegan' })
    expect(vegan.props.accessibilityState).toMatchObject({ checked: false })
    await fireEvent.press(vegan)
    expect(
      screen.getByRole('togglebutton', { name: 'Vegan' }).props.accessibilityState,
    ).toMatchObject({ checked: true })
    await fireEvent.press(screen.getByRole('button', { name: 'Remove Ada Lovelace' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('Snackbar shows its message and runs the action', async () => {
    const onUndo = jest.fn()
    const onOpenChange = jest.fn()
    await renderNative(
      <Snackbar open onOpenChange={onOpenChange} action={{ label: 'Undo', onPress: onUndo }}>
        Conversation archived
      </Snackbar>,
    )
    expect(await screen.findByText('Conversation archived')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('NavigationBar items are tabs with a selected state', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <NavigationBar defaultValue="home" onValueChange={onValueChange}>
        <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBar.Item value="search" icon={<SearchIcon />} label="Search" badge={2} />
      </NavigationBar>,
    )
    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected()
    const search = screen.getByRole('tab', { name: 'Search, 2 new' })
    expect(search).not.toBeSelected()
    await fireEvent.press(search)
    expect(onValueChange).toHaveBeenLastCalledWith('search')
    expect(screen.getByRole('tab', { name: 'Search, 2 new' })).toBeSelected()
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
