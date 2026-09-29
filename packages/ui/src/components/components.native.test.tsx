import { describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { HomeIcon, PlusIcon, SearchIcon } from '@advui/icons'
import { zIndex } from '@advui/theme'
import type { ReactElement } from 'react'
import { BackHandler, StyleSheet } from 'react-native'
import { renderNative } from '../../test/native-utils'
import { Accordion } from './accordion/Accordion'
import { AlertDialog } from './alert-dialog/AlertDialog'
import { AspectRatio } from './aspect-ratio/AspectRatio'
import { Alert } from './alert/Alert'
import { Avatar } from './avatar/Avatar'
import { AudioPlayer } from './audio-player/AudioPlayer'
import { setAudioEngine } from './audio-player/engine'
import { Badge } from './badge/Badge'
import { Breadcrumb } from './breadcrumb/Breadcrumb'
import { Button } from './button/Button'
import { Calendar } from './calendar/Calendar'
import { ButtonGroup } from './button-group/ButtonGroup'
import { Card } from './card/Card'
import { Checkbox } from './checkbox/Checkbox'
import { Chip } from './chip/Chip'
import { CircularProgress } from './circular-progress/CircularProgress'
import { Collapsible } from './collapsible/Collapsible'
import { Combobox } from './combobox/Combobox'
import { CommandPalette } from './command-palette/CommandPalette'
import { DatePicker } from './date-picker/DatePicker'
import { ContextMenu } from './context-menu/ContextMenu'
import { Dialog } from './dialog/Dialog'
import { Drawer } from './drawer/Drawer'
import { EmptyState } from './empty-state/EmptyState'
import { ErrorState } from './error-state/ErrorState'
import { DropdownMenu } from './dropdown-menu/DropdownMenu'
import { Fab } from './fab/Fab'
import { FileDropzone } from './file-dropzone/FileDropzone'
import { FileUpload } from './file-upload/FileUpload'
import { setFilePicker } from './file-upload/files'
import { Form } from './form/Form'
import { FormField } from './form-field/FormField'
import { HoverCard } from './hover-card/HoverCard'
import { IconButton } from './icon-button/IconButton'
import { Image } from './image/Image'
import { ImageGallery } from './image-gallery/ImageGallery'
import { Input } from './input/Input'
import { List } from './list/List'
import { LoadingButton } from './loading-button/LoadingButton'
import { Menu } from './menu/Menu'
import { MultiSelect } from './multi-select/MultiSelect'
import { NavigationBar } from './navigation-bar/NavigationBar'
import { NavigationMenu } from './navigation-menu/NavigationMenu'
import { NumberInput } from './number-input/NumberInput'
import { OtpInput } from './otp-input/OtpInput'
import { Pagination } from './pagination/Pagination'
import { PasswordInput } from './password-input/PasswordInput'
import { Popover } from './popover/Popover'
import { Progress } from './progress/Progress'
import { ScrollArea } from './scroll-area/ScrollArea'
import { Resizable } from './resizable-panel/ResizablePanel'
import { Search } from './search/Search'
import { Select } from './select/Select'
import { Sheet } from './sheet/Sheet'
import { Sidebar } from './sidebar/Sidebar'
import { Slider } from './slider/Slider'
import { Snackbar } from './snackbar/Snackbar'
import { Stepper } from './stepper/Stepper'
import { Switch } from './switch/Switch'
import { Toaster, toast } from './toast/Toaster'
import { Toggle } from './toggle/Toggle'
import { ToggleGroup } from './toggle-group/ToggleGroup'
import { Heading } from './typography/Heading'
import { Video } from './video/Video'
import { setVideoView } from './video/shared'
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

  it('Menu items are accessible rows that select, including via the activate action', async () => {
    const onValueChange = jest.fn()
    const onArchive = jest.fn()
    await renderNative(
      <Menu aria-label="Mailboxes" defaultValue="inbox" onValueChange={onValueChange}>
        <Menu.Group label="Mail">
          <Menu.Item value="inbox">Inbox</Menu.Item>
          <Menu.Item value="sent">Sent</Menu.Item>
          <Menu.Item value="spam" disabled>
            Spam
          </Menu.Item>
        </Menu.Group>
        <Menu.Item onSelect={onArchive}>Archive all</Menu.Item>
      </Menu>,
    )
    expect(screen.getByRole('heading', { name: 'Mail' })).toBeOnTheScreen()
    expect(screen.getByRole('menuitem', { name: 'Inbox' })).toBeSelected()
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Sent' }))
    expect(onValueChange).toHaveBeenLastCalledWith('sent')
    expect(screen.getByRole('menuitem', { name: 'Sent' })).toBeSelected()
    expect(screen.getByRole('menuitem', { name: 'Inbox' })).not.toBeSelected()
    await fireEvent(screen.getByRole('menuitem', { name: 'Archive all' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(onArchive).toHaveBeenCalledTimes(1)
    const spam = screen.getByRole('menuitem', { name: 'Spam' })
    expect(spam).toBeDisabled()
    await fireEvent.press(spam)
    expect(onValueChange).not.toHaveBeenCalledWith('spam')
  })

  it('ContextMenu opens its sheet on long-press and from the accessibility action', async () => {
    const onRename = jest.fn()
    await renderNative(
      <ContextMenu>
        <ContextMenu.Trigger testID="row">
          <Text>Report.pdf</Text>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={onRename}>Rename</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    )
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull()
    const row = screen.getByTestId('row')
    expect(row.props.accessibilityHint).toBe('Long press for options')
    await fireEvent(row, 'longPress')
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Rename' }))
    expect(onRename).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull()

    // VoiceOver / TalkBack users reach it through the "long press" action.
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } })
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeOnTheScreen()
  })

  it('Drawer opens a dialog from the trigger and closes from the × button', async () => {
    const onOpenChange = jest.fn()
    await renderNative(
      <Drawer onOpenChange={onOpenChange}>
        <Drawer.Trigger asChild>
          <Button>Filters</Button>
        </Drawer.Trigger>
        <Drawer.Content side="left">
          <Drawer.Title>Filter results</Drawer.Title>
          <Drawer.Body>
            <Text>Category</Text>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>,
    )
    expect(screen.queryByText('Filter results')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Filters' }))
    let node: { props: { role?: string }; parent: unknown } | null =
      await screen.findByText('Filter results')
    while (node && node.props.role !== 'dialog') node = node.parent as typeof node
    expect(node?.props.role).toBe('dialog')
    expect(screen.getByText('Category')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('HoverCard renders only its trigger (touch has no hover)', async () => {
    await renderNative(
      <HoverCard defaultOpen>
        <HoverCard.Trigger>
          <Text>@ada</Text>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <Text>Ada Lovelace</Text>
        </HoverCard.Content>
      </HoverCard>,
    )
    expect(screen.getByText('@ada')).toBeOnTheScreen()
    expect(screen.queryByText('Ada Lovelace')).toBeNull()
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

  it('CircularProgress exposes its value, and spins busy without one', async () => {
    await renderNative(
      <>
        <CircularProgress value={40} label="Storage used" showValue />
        <CircularProgress label="Syncing" />
      </>,
    )
    expect(screen.getByRole('progressbar', { name: 'Storage used' })).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 40,
    })
    // The percentage is visible but hidden from screen readers, which get the value.
    expect(screen.queryByText('40%')).toBeNull()
    expect(screen.getByText('40%', { includeHiddenElements: true })).toBeOnTheScreen()
    expect(screen.getByRole('progressbar', { name: 'Syncing' })).toBeBusy()
  })

  it('Collapsible hides its content until the trigger expands it', async () => {
    await renderNative(
      <Collapsible>
        <Collapsible.Trigger>
          <Button>Advanced options</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Text>URL slug</Text>
        </Collapsible.Content>
      </Collapsible>,
    )
    const trigger = screen.getByRole('button', { name: 'Advanced options' })
    expect(trigger).not.toBeExpanded()
    expect(screen.queryByText('URL slug')).toBeNull()
    expect(screen.getByText('URL slug', { includeHiddenElements: true })).not.toBeVisible()
    await fireEvent.press(trigger)
    expect(trigger).toBeExpanded()
    expect(screen.getByText('URL slug')).toBeVisible()
  })

  it('ButtonGroup joins its buttons and passes its variant down', async () => {
    const onPress = jest.fn()
    await renderNative(
      <ButtonGroup aria-label="Actions" variant="outline">
        <Button onPress={onPress}>Archive</Button>
        <IconButton aria-label="More" icon={<PlusIcon />} />
      </ButtonGroup>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Archive' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    const first = StyleSheet.flatten(screen.getByRole('button', { name: 'Archive' }).props.style)
    const last = StyleSheet.flatten(screen.getByRole('button', { name: 'More' }).props.style)
    expect(first.borderTopRightRadius).toBe(0)
    expect(last.borderTopLeftRadius).toBe(0)
    // Outline buttons share their 1px border.
    expect(last.marginLeft).toBe(-1)
  })

  it('AspectRatio and ScrollArea use the native aspectRatio and ScrollView', async () => {
    await renderNative(
      <>
        <AspectRatio ratio={2} testID="ratio" />
        <ScrollArea orientation="horizontal" aria-label="Albums" testID="scroll">
          <Text>Nightfall</Text>
        </ScrollArea>
      </>,
    )
    expect(StyleSheet.flatten(screen.getByTestId('ratio').props.style).aspectRatio).toBe(2)
    const scroll = screen.getByTestId('scroll')
    expect(scroll.props.horizontal).toBe(true)
    expect(screen.getByText('Nightfall')).toBeOnTheScreen()
  })

  it('OtpInput is one text field that keeps digits and reports completion', async () => {
    const onComplete = jest.fn()
    await renderNative(
      <OtpInput aria-label="Code" placeholder="code" length={4} onComplete={onComplete} />,
    )
    await fireEvent.changeText(screen.getByPlaceholderText('code'), '12a34')
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('Calendar days are labelled buttons that report the picked day', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Calendar
        locale="en-US"
        defaultMonth={new Date(2026, 2, 1)}
        today={new Date(2026, 2, 1)}
        onValueChange={onValueChange}
      />,
    )
    const day = screen.getByRole('button', { name: /March 12, 2026/ })
    await fireEvent.press(day)
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 12))
    expect(screen.getByRole('button', { name: /March 12, 2026/ })).toBeSelected()
  })

  it('DatePicker opens its calendar in a sheet and closes after a pick', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <DatePicker
        aria-label="Due date"
        locale="en-US"
        defaultValue={new Date(2026, 9, 14)}
        onValueChange={onValueChange}
      />,
    )
    // The picked date is the field's value, read after its name.
    expect(screen.getByRole('button', { name: 'Due date' })).toHaveAccessibilityValue({
      text: 'Oct 14, 2026',
    })
    await fireEvent.press(screen.getByRole('button', { name: 'Due date' }))
    await fireEvent.press(await screen.findByRole('button', { name: /October 20, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20))
  })

  it('FormField names its control and reads help and error text as the hint', async () => {
    await renderNative(
      <FormField label="Email" description="Work email." error="Enter an email.">
        <Input placeholder="you@example.com" />
      </FormField>,
    )
    const input = screen.getByPlaceholderText('you@example.com')
    // A Label's htmlFor only moves focus on native, so the field names the control.
    expect(screen.getByLabelText('Email')).toBe(input)
    expect(input.props.accessibilityHint).toBe('Enter an email. Work email.')
    expect(input.props['aria-invalid'] ?? input.props.accessibilityState?.invalid).toBeTruthy()
  })

  it('Form submits from Form.Submit and blocks it while loading or disabled', async () => {
    const onSubmit = jest.fn<() => void>()
    const form = (state: { loading?: boolean; disabled?: boolean }) => (
      <Form
        title="Create account"
        onSubmit={onSubmit}
        loadingText="Saving…"
        footer={<Form.Submit>Save</Form.Submit>}
        {...state}
      >
        <FormField label="Email">
          <Input placeholder="you@example.com" />
        </FormField>
      </Form>
    )
    const { unmount } = await renderNative(form({}))
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeOnTheScreen()
    // No form element on native: the press calls onSubmit itself.
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await unmount()

    const { unmount: unmountLoading } = await renderNative(form({ loading: true }))
    const busy = screen.getByRole('button', { name: 'Saving…' })
    expect(busy).toBeBusy()
    expect(busy).toBeDisabled()
    await fireEvent.press(busy)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await unmountLoading()

    await renderNative(form({ disabled: true }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByPlaceholderText('you@example.com')).toBeDisabled()
  })

  it('PasswordInput toggles secure text entry from its toggle button', async () => {
    await renderNative(<PasswordInput aria-label="Password" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input.props.secureTextEntry).toBe(true)
    await fireEvent.press(screen.getByRole('button', { name: 'Show password' }))
    expect(screen.getByPlaceholderText('Password').props.secureTextEntry).toBe(false)
  })

  it('NumberInput steps from the buttons and the adjustable actions', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <NumberInput
        aria-label="Guests"
        placeholder="0"
        defaultValue={1}
        onValueChange={onValueChange}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Increase' }))
    expect(onValueChange).toHaveBeenLastCalledWith(2)
    await fireEvent(screen.getByPlaceholderText('0'), 'accessibilityAction', {
      nativeEvent: { actionName: 'decrement' },
    })
    expect(onValueChange).toHaveBeenLastCalledWith(1)
  })

  it('EmptyState and ErrorState render a heading and their actions', async () => {
    const onRetry = jest.fn()
    await renderNative(
      <>
        <EmptyState title="No projects" description="Create one." />
        <ErrorState onRetry={onRetry} />
      </>,
    )
    expect(screen.getByRole('heading', { name: 'No projects' })).toBeTruthy()
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('Combobox opens a searchable sheet and picks a labelled row', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Combobox
        aria-label="Country"
        placeholder="Search"
        options={[
          { value: 'mm', label: 'Myanmar' },
          { value: 'th', label: 'Thailand' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Country' }))
    await fireEvent.changeText(screen.getByPlaceholderText('Search'), 'thai')
    expect(screen.queryByRole('button', { name: 'Myanmar' })).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Thailand' }))
    expect(onValueChange).toHaveBeenCalledWith('th')
  })

  it('MultiSelect rows are checkboxes and the sheet stays open between picks', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <MultiSelect
        aria-label="Labels"
        options={[
          { value: 'bug', label: 'Bug' },
          { value: 'docs', label: 'Docs' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Labels' }))
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bug' }))
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Docs' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['bug', 'docs'])
    expect(screen.getByRole('checkbox', { name: 'Bug' })).toBeChecked()
  })

  it('FileUpload and FileDropzone use the picker from setFilePicker', async () => {
    const pickFiles = jest.fn(async () => [
      { name: 'scan.pdf', size: 2048, type: 'application/pdf', uri: 'file:///scan.pdf' },
    ])
    setFilePicker(pickFiles)
    const onUpload = jest.fn()
    await renderNative(
      <>
        <FileUpload accept=".pdf" onValueChange={onUpload} />
        <FileDropzone />
      </>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Choose file' }))
    expect(pickFiles).toHaveBeenCalledWith({ multiple: false, accept: '.pdf' })
    expect(onUpload).toHaveBeenCalledWith([expect.objectContaining({ uri: 'file:///scan.pdf' })])
    expect(await screen.findByRole('button', { name: 'Remove scan.pdf' })).toBeTruthy()
    // The dropzone is one labelled button on native (no drag and drop).
    await fireEvent.press(screen.getByRole('button', { name: /Tap to choose files/ }))
    expect(pickFiles).toHaveBeenCalledTimes(2)
    setFilePicker(undefined)
  })

  it('List: a pressable row is one button, and a disabled one says so', async () => {
    const onPress = jest.fn()
    await renderNative(
      <List divided>
        <List.Item title="Account" description="Name and email" onPress={onPress} />
        <List.Item title="Security keys" disabled onPress={onPress} />
        <List.Item title="Version" trailing="2.4.0" />
      </List>,
    )
    await fireEvent.press(screen.getByRole('button', { name: /Account/ }))
    expect(onPress).toHaveBeenCalledTimes(1)
    const disabled = screen.getByRole('button', { name: 'Security keys' })
    expect(disabled).toBeDisabled()
    await fireEvent.press(disabled)
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByText('2.4.0')).toBeOnTheScreen()
  })

  it('Pagination pages with named buttons and marks the current page selected', async () => {
    const onPageChange = jest.fn()
    await renderNative(<Pagination count={10} defaultPage={6} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeSelected()
    await fireEvent.press(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(7)
    await fireEvent.press(screen.getByRole('button', { name: 'Page 10' }))
    expect(onPageChange).toHaveBeenLastCalledWith(10)
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('Stepper names each step with its number and status', async () => {
    const onStepPress = jest.fn()
    await renderNative(
      <Stepper activeStep={1} onStepPress={onStepPress}>
        <Stepper.Step title="Organization" description="Name and type" />
        <Stepper.Step title="Activities" />
        <Stepper.Step title="Review" />
      </Stepper>,
    )
    await fireEvent.press(
      screen.getByRole('button', { name: 'Step 1 of 3: Organization, completed. Name and type' }),
    )
    expect(onStepPress).toHaveBeenCalledWith(0)
    expect(
      screen.getByRole('button', { name: 'Step 2 of 3: Activities, current' }),
    ).toBeOnTheScreen()
    // Not reached yet: plain text, not a button.
    expect(screen.getByLabelText('Step 3 of 3: Review, not started')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /Review/ })).toBeNull()
  })

  it('NavigationMenu shows the open panel under the bar', async () => {
    const onPress = jest.fn()
    await renderNative(
      <NavigationMenu>
        <NavigationMenu.Link active onPress={() => {}}>
          Home
        </NavigationMenu.Link>
        <NavigationMenu.Item label="Data">
          <NavigationMenu.Link onPress={onPress} description="Who does what">
            5W dashboard
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>,
    )
    expect(screen.getByRole('link', { name: 'Home, current page' })).toBeOnTheScreen()
    const data = screen.getByRole('button', { name: 'Data' })
    expect(data).toBeCollapsed()
    await fireEvent.press(data)
    expect(screen.getByRole('button', { name: 'Data' })).toBeExpanded()
    await fireEvent.press(screen.getByRole('link', { name: /5W dashboard/ }))
    expect(onPress).toHaveBeenCalledTimes(1)
    // Following a link closes the panel.
    expect(screen.queryByRole('link', { name: /5W dashboard/ })).toBeNull()
  })

  it('Sidebar items are links named with their badge and state, also when collapsed', async () => {
    const onPress = jest.fn()
    await renderNative(
      <Sidebar aria-label="App">
        <Sidebar.Header>
          <Sidebar.Toggle />
        </Sidebar.Header>
        <Sidebar.Group label="Workspace">
          <Sidebar.Item active onPress={onPress}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item badge="3" onPress={onPress}>
            Reports
          </Sidebar.Item>
        </Sidebar.Group>
      </Sidebar>,
    )
    await fireEvent.press(screen.getByRole('link', { name: 'Reports, 3' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeCollapsed()
    expect(screen.getByRole('link', { name: 'Dashboard, current page' })).toBeOnTheScreen()
  })

  it('Search submits with the return key and clears with its button', async () => {
    const onSearch = jest.fn()
    await renderNative(<Search placeholder="Search places" onSearch={onSearch} />)
    const field = screen.getByPlaceholderText('Search places')
    await fireEvent.changeText(field, 'hakha')
    await fireEvent(field, 'submitEditing')
    expect(onSearch).toHaveBeenCalledWith('hakha')
    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
  })

  it('CommandPalette lists commands as buttons and runs one', async () => {
    const onSelect = jest.fn()
    await renderNative(
      <CommandPalette
        defaultOpen
        commands={[
          { id: 'reports', label: '5W reports', group: 'Go to', onSelect },
          { id: 'export', label: 'Export to Excel', group: 'Actions', onSelect: () => {} },
        ]}
      />,
    )
    await fireEvent.changeText(screen.getByPlaceholderText('Type a command or search…'), '5w')
    expect(screen.queryByRole('button', { name: 'Export to Excel' })).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: '5W reports' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('ImageGallery opens the viewer from a named thumbnail', async () => {
    const onIndexChange = jest.fn()
    await renderNative(
      <ImageGallery
        onIndexChange={onIndexChange}
        images={[
          { src: 'https://example.com/1.jpg', alt: 'Road' },
          { src: 'https://example.com/2.jpg', alt: 'Lake' },
        ]}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'View Lake' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(await screen.findByText('2 of 2')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled()
    await fireEvent.press(screen.getByRole('button', { name: 'Previous image' }))
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
  })

  it('LoadingButton blocks presses and reports busy while loading', async () => {
    const onPress = jest.fn()
    const { unmount } = await renderNative(<LoadingButton onPress={onPress}>Save</LoadingButton>)
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    await unmount()
    await renderNative(
      <LoadingButton loading loadingText="Saving…" onPress={onPress}>
        Save
      </LoadingButton>,
    )
    // The spinner stays out of the name.
    const busy = screen.getByRole('button', { name: 'Saving…' })
    expect(busy).toBeDisabled()
    expect(busy).toBeBusy()
    await fireEvent.press(busy)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('Resizable handles are adjustable and resize from the accessibility actions', async () => {
    const onSizesChange = jest.fn()
    await renderNative(
      <Resizable onSizesChange={onSizesChange}>
        <Resizable.Panel defaultSize={30} minSize={20} collapsible>
          <Text>Filters</Text>
        </Resizable.Panel>
        <Resizable.Handle aria-label="Resize filters" />
        <Resizable.Panel>
          <Text>Results</Text>
        </Resizable.Panel>
      </Resizable>,
    )
    const handle = screen.getByRole('adjustable', { name: 'Resize filters' })
    expect(handle).toHaveAccessibilityValue({ min: 0, max: 100, now: 30 })
    await fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onSizesChange).toHaveBeenLastCalledWith([35, 65])
    await fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } })
    expect(onSizesChange).toHaveBeenLastCalledWith([0, 100])
  })

  it('Video uses the player from setVideoView, and says when there is none', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { unmount } = await renderNative(<Video src="https://example.org/a.mp4" title="Clip" />)
    expect(screen.getByText('This video can’t be played.')).toBeOnTheScreen()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('setVideoView'))
    warn.mockRestore()
    const Player = jest.fn((_props: { accessibilityLabel: string }) => null)
    setVideoView(Player)
    await unmount()
    await renderNative(<Video src="https://example.org/a.mp4" title="Clip" autoPlay />)
    expect(Player).toHaveBeenLastCalledWith(
      expect.objectContaining({
        source: 'https://example.org/a.mp4',
        accessibilityLabel: 'Clip',
        autoPlay: true,
        muted: true,
      }),
      undefined,
    )
    setVideoView(undefined)
  })

  it('AudioPlayer plays through the engine from setAudioEngine', async () => {
    let report: (status: { playing?: boolean; duration?: number }) => void = () => {}
    const engine = {
      play: jest.fn(() => report({ playing: true })),
      pause: jest.fn(),
      seek: jest.fn(),
      setRate: jest.fn(),
      setLoop: jest.fn(),
      release: jest.fn(),
    }
    setAudioEngine((_source, onStatus) => {
      report = onStatus
      return engine
    })
    await renderNative(<AudioPlayer src="https://example.org/a.mp3" title="Flood safety" />)
    await act(() => report({ duration: 90 }))
    await fireEvent.press(screen.getByRole('button', { name: 'Play' }))
    expect(engine.play).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Forward 10 seconds' }))
    expect(engine.seek).toHaveBeenLastCalledWith(10)
    setAudioEngine(undefined)
  })

  it('Image is named by alt, hides a decorative image and falls back on error', async () => {
    const onError = jest.fn()
    await renderNative(
      <>
        <Image src="https://example.com/road.jpg" alt="A desert road" ratio={16 / 9} />
        <Image src="https://example.com/pattern.png" alt="" ratio={1} testID="decorative" />
        <Image
          src="https://example.com/missing.jpg"
          alt="Clinic entrance"
          ratio={1}
          onError={onError}
          testID="broken"
        />
      </>,
    )
    expect(screen.getByLabelText('A desert road')).toBeOnTheScreen()
    const broken = screen.getByLabelText('Clinic entrance')
    await fireEvent(broken, 'error')
    expect(onError).toHaveBeenCalledTimes(1)
    // The fallback keeps the name, as an accessible image.
    expect(screen.getByRole('img', { name: 'Clinic entrance' })).toBeOnTheScreen()
    // The road and the fallback; the decorative image is hidden.
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})

// Android's back button: React Native calls the `hardwareBackPress` listeners
// newest first and stops at the first that returns true; if none does, the
// router goes back. The fake below does the same, without a device.
function fakeBackHandler() {
  const listeners = new Set<() => boolean | null | undefined>()
  const spy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    const listener = () => handler({ type: 'hardwareBackPress', timeStamp: Date.now() })
    listeners.add(listener)
    return { remove: () => void listeners.delete(listener) }
  })
  return {
    listeners: () => listeners.size,
    /** Presses back; `false` means nothing handled it and the screen would close. */
    press: async () => {
      let handled = false
      await act(async () => {
        handled = [...listeners].reverse().some((listener) => listener() === true)
      })
      return handled
    },
    restore: () => spy.mockRestore(),
  }
}

describe('Android back button', () => {
  // Each overlay starts open; back must close it instead of leaving the screen.
  const overlays: [string, (onOpenChange: (open: boolean) => void) => ReactElement][] = [
    [
      'Dialog',
      (onOpenChange) => (
        <Dialog defaultOpen onOpenChange={onOpenChange}>
          <Dialog.Content>
            <Dialog.Title>Edit profile</Dialog.Title>
          </Dialog.Content>
        </Dialog>
      ),
    ],
    [
      'AlertDialog',
      (onOpenChange) => (
        <AlertDialog defaultOpen onOpenChange={onOpenChange}>
          <AlertDialog.Content>
            <AlertDialog.Title>Delete Atlas?</AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <Button>Cancel</Button>
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog>
      ),
    ],
    [
      'Drawer',
      (onOpenChange) => (
        <Drawer defaultOpen onOpenChange={onOpenChange}>
          <Drawer.Content>
            <Drawer.Title>Filters</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      ),
    ],
    [
      'Sheet',
      (onOpenChange) => (
        <Sheet defaultOpen onOpenChange={onOpenChange}>
          <Sheet.Content>
            <Sheet.Title>Profile</Sheet.Title>
          </Sheet.Content>
        </Sheet>
      ),
    ],
    [
      'Popover',
      (onOpenChange) => (
        <Popover defaultOpen onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>
            <Button>Dimensions</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Layer size</Popover.Title>
          </Popover.Content>
        </Popover>
      ),
    ],
    [
      'DropdownMenu',
      (onOpenChange) => (
        <DropdownMenu defaultOpen onOpenChange={onOpenChange}>
          <DropdownMenu.Trigger>
            <Button>Options</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Rename</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
    ],
    [
      'NavigationMenu',
      (onOpenChange) => (
        <NavigationMenu defaultValue="Data" onValueChange={(value) => onOpenChange(value !== null)}>
          <NavigationMenu.Item label="Data">
            <NavigationMenu.Link onPress={() => {}}>5W dashboard</NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu>
      ),
    ],
    [
      'Select',
      (onOpenChange) => (
        <Select open aria-label="Fruit" onOpenChange={onOpenChange}>
          <Select.Item value="apple">Apple</Select.Item>
        </Select>
      ),
    ],
  ]

  it.each(overlays)('closes an open %s', async (_name, render) => {
    const back = fakeBackHandler()
    const onOpenChange = jest.fn()
    await renderNative(render(onOpenChange))
    expect(back.listeners()).toBe(1)
    expect(await back.press()).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    back.restore()
  })

  it('leaves the back button to the router while overlays are closed', async () => {
    const back = fakeBackHandler()
    await renderNative(
      <Dialog>
        <Dialog.Trigger asChild>
          <Button>Edit profile</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Edit profile</Dialog.Title>
        </Dialog.Content>
      </Dialog>,
    )
    expect(back.listeners()).toBe(0)
    await fireEvent.press(screen.getByRole('button', { name: 'Edit profile' }))
    expect(back.listeners()).toBe(1)
    expect(await back.press()).toBe(true)
    // Closed again: the listener is gone, so the next press goes to the router.
    expect(back.listeners()).toBe(0)
    expect(await back.press()).toBe(false)
    back.restore()
  })

  it('closes a Context Menu opened by long-press', async () => {
    const back = fakeBackHandler()
    const onOpenChange = jest.fn()
    await renderNative(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenu.Trigger testID="row">
          <Text>Report.pdf</Text>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Rename</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    )
    await fireEvent(screen.getByTestId('row'), 'longPress')
    expect(await back.press()).toBe(true)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    back.restore()
  })

  it('closes the innermost overlay first', async () => {
    const back = fakeBackHandler()
    const onDrawer = jest.fn()
    const onDialog = jest.fn()
    await renderNative(
      <Drawer defaultOpen onOpenChange={onDrawer}>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
          <Dialog onOpenChange={onDialog}>
            <Dialog.Trigger asChild>
              <Button>Save filter</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>Name this filter</Dialog.Title>
            </Dialog.Content>
          </Dialog>
        </Drawer.Content>
      </Drawer>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Save filter' }))
    expect(await back.press()).toBe(true)
    expect(onDialog).toHaveBeenLastCalledWith(false)
    expect(onDrawer).not.toHaveBeenCalled()
    expect(await back.press()).toBe(true)
    expect(onDrawer).toHaveBeenLastCalledWith(false)
    back.restore()
  })

  it('closes the Combobox sheet (shared by Autocomplete and Multi Select)', async () => {
    const back = fakeBackHandler()
    await renderNative(
      <Combobox aria-label="Country" options={[{ value: 'mm', label: 'Myanmar' }]} />,
    )
    expect(back.listeners()).toBe(0)
    await fireEvent.press(screen.getByRole('button', { name: 'Country' }))
    expect(back.listeners()).toBe(1)
    expect(await back.press()).toBe(true)
    expect(back.listeners()).toBe(0)
    back.restore()
  })
})
