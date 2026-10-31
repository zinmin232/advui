import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { HomeIcon, PlusIcon, SearchIcon } from '@advui/icons'
import { createThemeColors, createUniversalConfig, themePresets, zIndex } from '@advui/theme'
import { Fragment, type ReactElement, createContext, createRef, useContext, useState } from 'react'
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Dimensions,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  processColor,
  type ViewStyle,
} from 'react-native'
import { Theme, XStack, getTokenValue } from 'tamagui/unstyled'
import { renderNative, touchAt } from '../../test/native-utils'
import { Accordion } from './accordion/Accordion'
import { AppShell } from './app-shell/AppShell'
import { AlertDialog } from './alert-dialog/AlertDialog'
import { AspectRatio } from './aspect-ratio/AspectRatio'
import { Alert } from './alert/Alert'
import { Avatar } from './avatar/Avatar'
import { AudioPlayer } from './audio-player/AudioPlayer'
import { setAudioEngine } from './audio-player/engine'
import { BackToTop, type BackToTopScroll, useBackToTop } from './back-to-top/BackToTop'
import { Badge } from './badge/Badge'
import { Breadcrumb } from './breadcrumb/Breadcrumb'
import { Button } from './button/Button'
import { Calendar } from './calendar/Calendar'
import { ButtonGroup } from './button-group/ButtonGroup'
import { Card } from './card/Card'
import { Carousel } from './carousel/Carousel'
import { CheckboxGroup } from './checkbox-group/CheckboxGroup'
import { Checkbox } from './checkbox/Checkbox'
import { Chip } from './chip/Chip'
import { registerRemovable, removeAndRefocus } from './chip/removeFocus'
import { CircularProgress } from './circular-progress/CircularProgress'
import { CodeBlock } from './code-block/CodeBlock'
import { Collapsible } from './collapsible/Collapsible'
import { ColorPicker } from './color-picker/ColorPicker'
import { Combobox } from './combobox/Combobox'
import { CommandPalette } from './command-palette/CommandPalette'
import { ConfirmDialog } from './confirm-dialog/ConfirmDialog'
import { DatePicker } from './date-picker/DatePicker'
import { DateTimePicker } from './date-time-picker/DateTimePicker'
import { DateRangePicker } from './date-range-picker/DateRangePicker'
import { ContextMenu } from './context-menu/ContextMenu'
import { CopyButton } from './copy-button/CopyButton'
import { setClipboard } from './copy-button/clipboard'
import { DescriptionList } from './description-list/DescriptionList'
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
import { Field } from './field/Field'
import { HoverCard } from './hover-card/HoverCard'
import { IconButton } from './icon-button/IconButton'
import { Image } from './image/Image'
import { ImageGallery } from './image-gallery/ImageGallery'
import { Indicator } from './indicator/Indicator'
import { Input } from './input/Input'
import { Label } from './label/Label'
import { AutoGrid } from './layout/AutoGrid'
import { autoGridColumns } from './layout/autoGridColumns'
import { Container } from './layout/Container'
import { Grid } from './layout/Grid'
import { HStack, Stack, VStack, Wrap } from './layout/Stack'
import { Link } from './link/Link'
import { List } from './list/List'
import { ListItem } from './list-item/ListItem'
import { LoadingButton } from './loading-button/LoadingButton'
import { LoadingState } from './loading-state/LoadingState'
import { Menu } from './menu/Menu'
import { Menubar } from './menubar/Menubar'
import { Meter } from './meter/Meter'
import { MultiSelect } from './multi-select/MultiSelect'
import { NavigationBar } from './navigation-bar/NavigationBar'
import { NavigationMenu } from './navigation-menu/NavigationMenu'
import { NumberInput } from './number-input/NumberInput'
import { OtpInput } from './otp-input/OtpInput'
import { Pagination } from './pagination/Pagination'
import { PasswordInput } from './password-input/PasswordInput'
import { Popover } from './popover/Popover'
import { Portal } from './portal/Portal'
import { Progress } from './progress/Progress'
import { RadioGroup } from './radio-group/RadioGroup'
import { Rating } from './rating/Rating'
import { ScrollArea } from './scroll-area/ScrollArea'
import { Section } from './section/Section'
import { Separator } from './separator/Separator'
import { Hide, Show } from './show-hide/ShowHide'
import { Sticky } from './sticky/Sticky'
import { Resizable } from './resizable-panel/ResizablePanel'
import { Search } from './search/Search'
import { Select } from './select/Select'
import { Sheet } from './sheet/Sheet'
import { Sidebar } from './sidebar/Sidebar'
import { Spoiler } from './spoiler/Spoiler'
import { Slider } from './slider/Slider'
import { Snackbar } from './snackbar/Snackbar'
import { Stepper } from './stepper/Stepper'
import { Switch } from './switch/Switch'
import { TableOfContents } from './table-of-contents/TableOfContents'
import { Tabs } from './tabs/Tabs'
import { TagsInput } from './tags-input/TagsInput'
import { TimePicker } from './time-picker/TimePicker'
import { Textarea } from './textarea/Textarea'
import { Toaster, toast } from './toast/Toaster'
import { Toggle } from './toggle/Toggle'
import { ToggleGroup } from './toggle-group/ToggleGroup'
import { Toolbar } from './toolbar/Toolbar'
import { Tooltip } from './tooltip/Tooltip'
import { Tour } from './tour/Tour'
import { TransferList } from './transfer-list/TransferList'
import { Heading } from './typography/Heading'
import { Video } from './video/Video'
import { setVideoView } from './video/shared'
import { VisuallyHidden } from './visually-hidden/VisuallyHidden'
import { Text } from './typography/Text'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { UniversalProvider } from '../provider/UniversalProvider'

// These run the React Native code path (react-native + Tamagui native builds,
// `.native.tsx` platform files) — the same code Expo ships to iOS and Android.

/**
 * A disabled control takes touches (so TalkBack finds it), but Tamagui gives
 * its view no handlers. RNTL's press would still call the rendered element's
 * onPress, which no touch reaches, so check the handlers instead.
 */
function expectNoPressHandlers(element: { props: Record<string, unknown> }) {
  expect(element.props.onStartShouldSetResponder).toBeUndefined()
  expect(element.props.onResponderRelease).toBeUndefined()
  expect(element.props.onClick).toBeUndefined()
}

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
    expectNoPressHandlers(disabled)
    expect(onDisabledPress).not.toHaveBeenCalled()
  })

  it('Button loading state uses the native ActivityIndicator and aria-busy', async () => {
    await renderNative(<Button loading>Saving</Button>)
    expect(screen.getByRole('button', { name: /Saving/ })).toBeBusy()
    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeOnTheScreen()
  })

  it('shows pressStyle colors on frames with a transition', async () => {
    // Regression: the Animated driver's re-render-free style emitter built the
    // pressed color's interpolation but never rendered it, so a held Button
    // kept its resting fill.
    jest.useFakeTimers()
    const { light } = createThemeColors(themePresets.indigo.colors)
    await renderNative(
      <>
        <Button onPress={() => {}}>Save</Button>
        <Toggle aria-label="Bold" />
      </>,
    )
    const cases = [
      { role: 'button', name: 'Save', rest: light.primary, pressed: light.primaryPress },
      { role: 'togglebutton', name: 'Bold', rest: 'transparent', pressed: light.accentHover },
    ] as const
    const background = (role: string, name: string) =>
      processColor(StyleSheet.flatten(screen.getByRole(role, { name }).props.style).backgroundColor)
    const settle = () => act(async () => jest.advanceTimersByTime(1000))
    const touch = { nativeEvent: {}, persist() {} }

    for (const { role, name, rest, pressed } of cases) {
      await settle()
      expect(background(role, name)).toBe(processColor(rest))
      await fireEvent(screen.getByRole(role, { name }), 'responderGrant', touch)
      await settle()
      expect(background(role, name)).toBe(processColor(pressed))
      // A cancelled touch (e.g. a scroll took over), so the Toggle stays off.
      await fireEvent(screen.getByRole(role, { name }), 'responderTerminate', touch)
      await settle()
      expect(background(role, name)).toBe(processColor(rest))
    }
    jest.useRealTimers()
  })

  it('restarts only color and opacity springs on a color mode switch', async () => {
    // A bare preset animated every style: each Button also restarted springs
    // for its height, radii and border widths, on the JS driver, and a color
    // mode switch on a screen of buttons took seconds on an Android phone.
    // Colors and opacity spring to 0 or 1; a height springs to its pixels.
    const config = createUniversalConfig()
    const ui = (mode: 'light' | 'dark') => (
      <UniversalProvider config={config} colorMode={mode} toaster={false}>
        <Button>Save</Button>
        <Toggle aria-label="Bold" />
        <Card interactive>
          <Text>Plan</Text>
        </Card>
      </UniversalProvider>
    )
    const spring = jest.spyOn(Animated, 'spring')
    try {
      const view = await render(ui('light'))
      spring.mockClear()
      await view.rerender(ui('dark'))
      const targets = spring.mock.calls.map(([, options]) => (options as { toValue: number }).toValue)
      expect(targets.length).toBeGreaterThan(0)
      expect(targets.filter((target) => target !== 0 && target !== 1)).toEqual([])
    } finally {
      spring.mockRestore()
    }
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
    const wifi = screen.getByRole('switch', { name: 'Wi-Fi' })
    expect(wifi).not.toBeChecked()
    await fireEvent.press(wifi)
    expect(onSwitch).toHaveBeenCalledWith(true)
    // Tamagui's switch reports its state on web only.
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toBeChecked()
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Terms' }))
    expect(onCheck).toHaveBeenCalledWith(true)
  })

  it('a Label with htmlFor names the control on native and is not read twice', async () => {
    function Rows() {
      const [showLabel, setShowLabel] = useState(true)
      return (
        <>
          <Button onPress={() => setShowLabel(false)}>Remove label</Button>
          {showLabel ? <Label htmlFor="push">Push notifications</Label> : null}
          <Switch id="push" />
          <Label htmlFor="terms">Accept the terms</Label>
          <Checkbox id="terms" />
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Yangon" />
          <Label htmlFor="own">Visible text</Label>
          <Switch id="own" aria-label="Own name" />
        </>
      )
    }
    await renderNative(<Rows />)
    // A Label's htmlFor only moves focus on native, so its text is the name.
    expect(screen.getByRole('switch', { name: 'Push notifications' })).toBeOnTheScreen()
    expect(screen.getByRole('checkbox', { name: 'Accept the terms' })).toBeOnTheScreen()
    expect(screen.getByPlaceholderText('Yangon').props['aria-label']).toBe('City')
    expect(
      screen.getByText('Push notifications', { includeHiddenElements: true }),
    ).not.toBeVisible()
    // A control with its own name leaves its label to be read as text.
    expect(screen.getByRole('switch', { name: 'Own name' })).toBeOnTheScreen()
    expect(screen.getByText('Visible text')).toBeVisible()

    await fireEvent.press(screen.getByRole('button', { name: 'Remove label' }))
    expect(screen.queryByRole('switch', { name: 'Push notifications' })).toBeNull()
  })

  it('Switch reads as disabled and keeps a controlled value', async () => {
    const onCheckedChange = jest.fn()
    await renderNative(
      <>
        <Switch aria-label="Sync" disabled defaultChecked />
        <Switch aria-label="Backups" checked onCheckedChange={onCheckedChange} />
      </>,
    )
    const sync = screen.getByRole('switch', { name: 'Sync' })
    expect(sync).toBeDisabled()
    expect(sync).toBeChecked()
    await fireEvent.press(screen.getByRole('switch', { name: 'Backups' }))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('switch', { name: 'Backups' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Backups' })).toBeEnabled()
  })

  it('CheckboxGroup names items by their labels and reads the group as their hint', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Field label="Notifications" description="Pick where we reach you.">
        <CheckboxGroup defaultValue={['email']} onValueChange={onValueChange}>
          <CheckboxGroup.SelectAll label="All" />
          <CheckboxGroup.Item value="email" label="Email" description="Daily digest" />
          <CheckboxGroup.Item value="sms" label="SMS" />
        </CheckboxGroup>
      </Field>,
    )
    const email = screen.getByRole('checkbox', { name: 'Email' })
    expect(email).toBeChecked()
    expect(email.props.accessibilityHint).toBe(
      'Daily digest. Notifications. Pick where we reach you.',
    )
    // The visible label and description are not read a second time.
    expect(screen.getByText('Email', { includeHiddenElements: true })).not.toBeVisible()
    expect(screen.getByText('Daily digest', { includeHiddenElements: true })).not.toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'All' })).toBePartiallyChecked()

    await fireEvent.press(screen.getByRole('checkbox', { name: 'SMS' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['email', 'sms'])
    expect(screen.getByRole('checkbox', { name: 'All' })).toBeChecked()
    await fireEvent.press(screen.getByRole('checkbox', { name: 'All' }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(screen.getByRole('checkbox', { name: 'Email' })).not.toBeChecked()
  })

  it('Checkbox reads as disabled, and as no longer mixed once it is checked', async () => {
    await renderNative(
      <>
        <Checkbox aria-label="Fax" disabled />
        <CheckboxGroup aria-label="Notifications" defaultValue={['email']}>
          <CheckboxGroup.SelectAll label="All" />
          <CheckboxGroup.Item value="email" label="Email" />
          <CheckboxGroup.Item value="sms" label="SMS" />
        </CheckboxGroup>
      </>,
    )
    // Tamagui sets `disabled` on web only.
    expect(screen.getByRole('checkbox', { name: 'Fax' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'SMS' })).toBeEnabled()
    // Android rebuilds the spoken name, which carries "mixed", only on a state
    // change with a busy key; without one a checked box still said "mixed".
    const all = screen.getByRole('checkbox', { name: 'All' })
    expect(all).toBePartiallyChecked()
    expect(all.props['aria-busy']).toBe(false)
    await fireEvent.press(all)
    expect(screen.getByRole('checkbox', { name: 'All' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'All' }).props['aria-busy']).toBe(false)
  })

  it('RadioGroup names items by their labels and reads the group as their hint', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Field label="Plan" error="Pick a plan.">
        <RadioGroup defaultValue="free" onValueChange={onValueChange}>
          <RadioGroup.Item value="free" label="Free" description="Up to 3 projects" />
          <RadioGroup.Item value="pro" aria-label="Pro" />
        </RadioGroup>
      </Field>,
    )
    const free = screen.getByRole('radio', { name: 'Free' })
    expect(free).toBeChecked()
    expect(free.props.accessibilityHint).toBe('Up to 3 projects. Plan. Pick a plan.')
    expect(screen.getByText('Free', { includeHiddenElements: true })).not.toBeVisible()
    // An item without a label still hears which group it is in.
    const pro = screen.getByRole('radio', { name: 'Pro' })
    expect(pro.props.accessibilityHint).toBe('Plan. Pick a plan.')

    await fireEvent.press(pro)
    expect(onValueChange).toHaveBeenLastCalledWith('pro')
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
  })

  it('RadioGroup items read as disabled, from the group or their own prop', async () => {
    await renderNative(
      <>
        <RadioGroup aria-label="Plan" defaultValue="free" disabled>
          <RadioGroup.Item value="free" label="Free" />
        </RadioGroup>
        <RadioGroup aria-label="Size" defaultValue="s">
          <RadioGroup.Item value="s" label="Small" />
          <RadioGroup.Item value="l" label="Large" disabled />
        </RadioGroup>
      </>,
    )
    // Tamagui sets `disabled` on web only.
    expect(screen.getByRole('radio', { name: 'Free' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Large' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Small' })).toBeEnabled()
  })

  it('Input reports text changes', async () => {
    const onChangeText = jest.fn()
    await renderNative(
      <Input aria-label="Email" placeholder="you@example.com" onChangeText={onChangeText} />,
    )
    await fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'hi@example.com')
    expect(onChangeText).toHaveBeenCalledWith('hi@example.com')
  })

  it('Input slots: addon text joins the hint, and a slot button stays reachable', async () => {
    const onCopy = jest.fn()
    await renderNative(
      <Field label="Weight" description="Without the box.">
        <Input
          placeholder="0"
          leading={<SearchIcon />}
          trailing={<IconButton icon={<PlusIcon />} aria-label="Add" onPress={onCopy} />}
          trailingAddon="kg"
        />
      </Field>,
    )
    const input = screen.getByPlaceholderText('0')
    expect(input.props.accessibilityHint).toBe('Without the box. kg')
    expect(screen.getByLabelText('Weight')).toBe(input)
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }))
    expect(onCopy).toHaveBeenCalledTimes(1)
    await fireEvent.changeText(input, '12')
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

  it('Alert keeps its actions and dismiss button reachable, and hides when dismissed', async () => {
    const onDismiss = jest.fn()
    const save = jest.fn()
    await renderNative(
      <Alert
        variant="warning"
        size="lg"
        title="Unsaved changes"
        description="Save before you leave."
        actions={<Button onPress={save}>Save</Button>}
        dismissible
        onDismiss={onDismiss}
      />,
    )
    // The text is one announced element; the buttons stay separate stops.
    const text = screen.getByRole('alert')
    expect(text.props.accessible).toBe(true)
    expect(text).toHaveTextContent('Unsaved changesSave before you leave.')
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(save).toHaveBeenCalledTimes(1)
    expect(onDismiss).not.toHaveBeenCalled()
    await fireEvent.press(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
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
    // The region's name has no web keyboard shortcut, and the region has room
    // for its toasts: they sit inside it absolutely, and Android reports a view
    // outside its parent as off-screen, so TalkBack skipped them.
    const region = screen.getByLabelText('Notifications')
    expect(String(region.props['aria-label']).trim()).toBe('Notifications')
    expect(StyleSheet.flatten(region.props.style).minHeight).toBe(
      Dimensions.get('window').height / 2,
    )

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

  it('Accordion: a disabled trigger says so, and content is not a labelled region', async () => {
    await renderNative(
      <Accordion type="multiple" defaultValue={['one']}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Shipping</Accordion.Trigger>
          <Accordion.Content testID="content">Three to five days</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two" disabled>
          <Accordion.Trigger>Billing</Accordion.Trigger>
          <Accordion.Content>Invoices</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
    )
    // Tamagui sets the disabled state on web only.
    expect(screen.getByRole('button', { name: 'Billing' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Shipping' })).toBeEnabled()
    // React Native labels a view with a role or aria-labelledby with its
    // children's text, so TalkBack read the section twice.
    const content = screen.getByTestId('content')
    // Cleared with null (Tamagui 3 keeps a default over undefined): no role either way.
    expect(content.props.role ?? undefined).toBeUndefined()
    expect(content.props.accessibilityRole ?? undefined).toBeUndefined()
    expect(
      content.props['aria-labelledby'] ?? content.props.accessibilityLabelledBy ?? undefined,
    ).toBeUndefined()
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

  it('Slider is named by a Field, a Label for its id, or a Label it is labelled by', async () => {
    // aria-labelledby names nothing on iOS, so it used to read only the value.
    await renderNative(
      <>
        <Field label="Volume" description="For alerts.">
          <Slider defaultValue={40} />
        </Field>
        <Label htmlFor="bass">Bass</Label>
        <Slider id="bass" defaultValue={10} />
        <Label id="treble-label">Treble</Label>
        <Slider aria-labelledby="treble-label" defaultValue={20} />
        <Label id="gain-label">Gain</Label>
        <Label id="gain-unit">(dB)</Label>
        <Slider aria-labelledby="gain-label gain-unit" defaultValue={0} />
        <Label>Price</Label>
        <Slider aria-label="Price" defaultValue={[20, 80]} />
      </>,
    )
    expect(screen.getByRole('slider', { name: 'Volume' }).props.accessibilityHint).toBe(
      'For alerts.',
    )
    expect(screen.getByRole('slider', { name: 'Bass' })).toBeOnTheScreen()
    expect(screen.getByRole('slider', { name: 'Treble' })).toBeOnTheScreen()
    expect(screen.getByText('Treble', { includeHiddenElements: true })).not.toBeVisible()
    // A list of ids is named by their texts, joined as on web.
    expect(screen.getByRole('slider', { name: 'Gain (dB)' })).toBeOnTheScreen()
    expect(screen.getByRole('slider', { name: 'Price, Minimum' })).toBeOnTheScreen()
  })

  it('Rating is an adjustable element that swipes and presses change', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <>
        <Field label="Your stay" description="Shown with your review.">
          <Rating defaultValue={3} onValueChange={onValueChange} />
        </Field>
        <Rating aria-label="Average rating" readOnly value={4.3} />
      </>,
    )
    const rating = screen.getByRole('slider', { name: 'Your stay' })
    expect(rating.props.accessible).toBe(true)
    expect(rating.props.accessibilityHint).toBe('Shown with your review.')
    expect(rating.props.accessibilityValue).toEqual({ min: 0, max: 5, now: 3, text: '3 of 5' })
    await fireEvent(rating, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(onValueChange).toHaveBeenLastCalledWith(4)
    await fireEvent(rating, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } })
    expect(onValueChange).toHaveBeenLastCalledWith(3)

    // The icons are press targets that reach 44pt with hitSlop.
    type Host = typeof rating
    const descendants = (node: Host): Host[] =>
      node.children.flatMap((child) =>
        typeof child === 'string' ? [] : [child as Host, ...descendants(child as Host)],
      )
    const icons = descendants(rating).filter((node) => node.props.hitSlop !== undefined)
    expect(icons).toHaveLength(5)
    expect(icons[0]!.props.hitSlop).toEqual({ top: 10, bottom: 10 })
    await fireEvent.press(icons[0]!)
    expect(onValueChange).toHaveBeenLastCalledWith(1)
    expect(screen.getByRole('slider', { name: 'Your stay' }).props.accessibilityValue.now).toBe(1)

    expect(screen.getByRole('image', { name: 'Average rating: 4.3 of 5' })).toBeOnTheScreen()
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

  it('menu, Select and Popover sheets stop below the status bar', async () => {
    // Tamagui grows a fit sheet up to the whole window; in landscape a tall menu
    // slid under the status bar. The frame is capped and its list scrolls.
    const maxHeightAbove = (text: string) =>
      screen.getAllByText(text).map((found) => {
        let node = found.parent
        while (node && StyleSheet.flatten(node.props.style)?.maxHeight === undefined) {
          node = node.parent
        }
        return StyleSheet.flatten(node?.props.style)?.maxHeight
      })
    await render(
      <UniversalProvider
        config={createUniversalConfig()}
        toaster={false}
        insets={{ top: 40, bottom: 0, left: 0, right: 0 }}
      >
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <Button>Options</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Rename</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <Select open aria-label="Fruit" placeholder="Pick a fruit">
          <Select.Item value="apple">Apple</Select.Item>
        </Select>
        <Popover defaultOpen>
          <Popover.Trigger asChild>
            <Button>Dimensions</Button>
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Title>Layer size</Popover.Title>
          </Popover.Content>
        </Popover>
      </UniversalProvider>,
    )
    // The screen (which the sheet covers) less the top inset and 32 for the handle.
    const expected = Dimensions.get('screen').height - 40 - 32
    // The Select is open from the start, so the page behind is hidden.
    await fireEvent.press(
      screen.getByRole('button', { name: 'Options', includeHiddenElements: true }),
    )
    expect(maxHeightAbove('Rename')).toContain(expected)
    expect(maxHeightAbove('Apple')).toContain(expected)
    // Popover's sheet (Date Picker, Color Picker) too; Adapt renders its content twice.
    await screen.findAllByText('Layer size')
    expect(maxHeightAbove('Layer size')).toContain(expected)
  })

  it('Select sheet has a visible handle and no dropdown panel inside', async () => {
    await renderNative(
      <Select open aria-label="Fruit" placeholder="Pick a fruit">
        <Select.Item value="apple">Apple</Select.Item>
      </Select>,
    )
    const option = screen.getByText('Apple')
    // Tamagui 3 keeps the viewport's styles in the sheet on native: the
    // dropdown's border drew a box around the options.
    let node = option.parent
    let sheet = option
    while (node) {
      expect(StyleSheet.flatten(node.props.style)?.borderTopWidth ?? 0).toBe(0)
      sheet = node
      node = node.parent
    }
    // Tamagui 3's unstyled handle has no size of its own. The sheet renders in
    // a portal, so look below the option's topmost ancestor.
    const heights: unknown[] = []
    const visit = (found: typeof option) => {
      heights.push(StyleSheet.flatten(found.props.style)?.height)
      for (const child of found.children) if (typeof child === 'object') visit(child)
    }
    visit(sheet)
    expect(heights).toContain(getTokenValue('2-5', 'space'))
  })

  it('Menubar opens one menu at a time as a sheet of accessible items', async () => {
    const onUndo = jest.fn()
    const onValueChange = jest.fn()
    await renderNative(
      <Menubar aria-label="Editor" onValueChange={onValueChange}>
        <Menubar.Menu value="file">
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>New file</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu value="edit">
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item onSelect={onUndo}>Undo</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
        <Menubar.Menu value="share">
          <Menubar.Trigger disabled>Share</Menubar.Trigger>
          <Menubar.Content>
            <Menubar.Item>Copy link</Menubar.Item>
          </Menubar.Content>
        </Menubar.Menu>
      </Menubar>,
    )
    const file = screen.getByRole('button', { name: 'File' })
    expect(file).toBeCollapsed()
    expect(screen.getByRole('button', { name: 'Share' })).toBeDisabled()
    // Closed sheets stay mounted; their rows must be hidden from screen readers.
    expect(screen.queryByRole('menuitem', { name: 'New file' })).toBeNull()
    await fireEvent.press(file)
    expect(file).toBeExpanded()
    expect(screen.getByRole('menuitem', { name: 'New file' })).toBeOnTheScreen()
    // The bar stays under the sheet's scrim, hidden from screen readers while a
    // menu is open; pressing another trigger moves to its menu.
    await fireEvent.press(screen.getByRole('button', { name: 'Edit', includeHiddenElements: true }))
    expect(onValueChange).toHaveBeenLastCalledWith('edit')
    expect(screen.queryByRole('menuitem', { name: 'New file' })).toBeNull()
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Undo' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    await fireEvent.press(screen.getByRole('button', { name: 'Share' }))
    expect(onValueChange).toHaveBeenCalledTimes(3)
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

  it('ConfirmDialog opens an alertdialog and stays busy until onConfirm resolves', async () => {
    const onOpenChange = jest.fn()
    let finish = () => {}
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    await renderNative(
      <ConfirmDialog
        trigger={<Button>Delete project</Button>}
        title="Delete Atlas?"
        description="This cannot be undone."
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Delete project' }))
    let node: { props: { role?: string }; parent: unknown } | null =
      await screen.findByText('Delete Atlas?')
    while (node && node.props.role !== 'alertdialog') node = node.parent as typeof node
    expect(node?.props.role).toBe('alertdialog')
    await fireEvent.press(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeBusy()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    await act(async () => finish())
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByText('Delete Atlas?')).toBeNull())
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
    // On the host view itself: fireEvent would also find a handler further up.
    expect(row.props.accessibilityActions).toEqual([{ name: 'longpress', label: 'Options' }])
    expect(row.props.onAccessibilityAction).toEqual(expect.any(Function))
    await fireEvent(row, 'longPress')
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Rename' }))
    expect(onRename).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menuitem', { name: 'Rename' })).toBeNull()

    // VoiceOver / TalkBack users reach it through the "long press" action.
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } })
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeOnTheScreen()
  })

  it('modal overlays hide the screen from screen readers, and close from the overlay', async () => {
    await renderNative(
      <>
        <Text>Account page</Text>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Edit profile</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Profile</Dialog.Title>
          </Dialog.Content>
        </Dialog>
      </>,
    )
    expect(screen.getByText('Account page')).toBeVisible()
    await fireEvent.press(screen.getByRole('button', { name: 'Edit profile' }))
    let dialog: { props: { role?: string }; parent: unknown } | null =
      await screen.findByText('Profile')
    while (dialog && dialog.props.role !== 'dialog') dialog = dialog.parent as typeof dialog
    // TalkBack and VoiceOver stay in the dialog: the screen behind is hidden.
    expect(screen.getByText('Account page', { includeHiddenElements: true })).not.toBeVisible()
    // The dialog fades in; under load the check can land before it finishes.
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible())
    // The overlay is the dialog's sibling in the portal. Tamagui closes from an
    // outside press on web only.
    const layer = (dialog as unknown as { parent: { children: unknown[] } }).parent
    await fireEvent.press(layer.children[0] as never)
    await waitFor(() => expect(screen.queryByText('Profile')).toBeNull())
    expect(screen.getByText('Account page')).toBeVisible()
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

  it('Dialog, AlertDialog and Drawer animate in from their enter values', async () => {
    // Tamagui 3 drops enter values that pass through a styled() wrapper of
    // Dialog.Content or Overlay on native: all three appeared in one frame.
    jest.useFakeTimers()
    const styleAbove = (text: string, key: 'opacity' | 'transform') => {
      let node = screen.getByText(text).parent
      while (node && StyleSheet.flatten(node.props.style)?.[key] === undefined) node = node.parent
      return StyleSheet.flatten(node?.props.style)?.[key]
    }
    await renderNative(
      <>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>In the dialog</Dialog.Title>
          </Dialog.Content>
        </Dialog>
        <AlertDialog>
          <AlertDialog.Trigger asChild>
            <Button>Open alert</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Title>In the alert</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog>
        <Drawer>
          <Drawer.Trigger asChild>
            <Button>Open drawer</Button>
          </Drawer.Trigger>
          <Drawer.Content side="left">
            <Drawer.Title>In the drawer</Drawer.Title>
          </Drawer.Content>
        </Drawer>
      </>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Open dialog' }))
    expect(styleAbove('In the dialog', 'opacity')).toBe(0)
    await fireEvent.press(
      screen.getByRole('button', { name: 'Open alert', includeHiddenElements: true }),
    )
    expect(styleAbove('In the alert', 'opacity')).toBe(0)
    await fireEvent.press(
      screen.getByRole('button', { name: 'Open drawer', includeHiddenElements: true }),
    )
    expect(styleAbove('In the drawer', 'transform')).toContainEqual({
      translateX: -Dimensions.get('window').width,
    })
    await act(async () => {
      jest.advanceTimersByTime(1000)
    })
    expect(styleAbove('In the dialog', 'opacity')).toBe(1)
    expect(styleAbove('In the alert', 'opacity')).toBe(1)
    expect(styleAbove('In the drawer', 'transform')).not.toContainEqual({
      translateX: -Dimensions.get('window').width,
    })
    jest.useRealTimers()
  })

  it('Tabs announce selected and disabled tabs', async () => {
    // Tamagui sets a tab's disabled state on web only: TalkBack read a
    // disabled tab as plain text.
    await renderNative(
      <Tabs defaultValue="account">
        <Tabs.List aria-label="Settings">
          <Tabs.Trigger value="account">Account</Tabs.Trigger>
          <Tabs.Trigger value="advanced" disabled>
            Advanced
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="account">
          <Text>Account panel</Text>
        </Tabs.Content>
      </Tabs>,
    )
    expect(screen.getByRole('tab', { name: 'Account' })).toBeSelected()
    expect(screen.getByRole('tab', { name: 'Account' })).toBeEnabled()
    const advanced = screen.getByRole('tab', { name: 'Advanced' })
    expect(advanced).toBeDisabled()
    expect(advanced.props.accessible).toBe(true)
    // A focusable panel with a role is named from its text on Android, so
    // TalkBack read the panel's text twice.
    let node = screen.getByText('Account panel').parent
    while (node) {
      expect(node.props.role).not.toBe('tabpanel')
      // React Native makes a view with any other tabIndex, null included, focusable.
      expect(node.props.tabIndex).toBeUndefined()
      expect(node.props.onClick).toBeUndefined()
      node = node.parent
    }
  })

  it('truncated Text stays on one line and the elevated Card casts a shadow', async () => {
    // Tamagui 3 variants hold styles only: `numberOfLines` and `elevation`
    // set by a variant never reached the native view.
    await renderNative(
      <>
        <Text truncate>One long line</Text>
        <Card variant="elevated">
          <Card.Title truncate>A long card title</Card.Title>
        </Card>
      </>,
    )
    for (const text of ['One long line', 'A long card title']) {
      expect(screen.getByText(text).props.numberOfLines).toBe(1)
      expect(screen.getByText(text).props.ellipsizeMode).toBe('tail')
    }
    let node = screen.getByText('A long card title').parent
    while (node && node.props.elevation === undefined) node = node.parent
    expect(node?.props.elevation).toBeGreaterThan(0)
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

  it('Link opens URLs with the system; a path needs onPress', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const onPress = jest.fn()
    await renderNative(
      <>
        <Link href="https://example.com" external>
          Example
        </Link>
        <Link href="/docs">Docs</Link>
        <Link href="/settings" onPress={onPress}>
          Settings
        </Link>
        <Text>
          Email <Link href="mailto:team@example.com">the team</Link>.
        </Text>
      </>,
    )
    await fireEvent.press(screen.getByRole('link', { name: 'Example' }))
    expect(openURL).toHaveBeenLastCalledWith('https://example.com')
    await fireEvent(screen.getByRole('link', { name: 'the team' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(openURL).toHaveBeenLastCalledWith('mailto:team@example.com')

    expect(screen.queryByRole('link', { name: 'Docs' })).toBeNull()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('router.push("/docs")'))
    await fireEvent.press(screen.getByRole('link', { name: 'Settings' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(openURL).toHaveBeenCalledTimes(2)
    openURL.mockRestore()
    warn.mockRestore()
  })

  it('Fab: the small one takes touches 44 high, as Button does', async () => {
    await renderNative(
      <>
        <Fab size="sm" icon={<PlusIcon />} aria-label="Add" />
        <Fab icon={<PlusIcon />} aria-label="Compose" />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Add' }).props.hitSlop).toBe(2)
    expect(screen.getByRole('button', { name: 'Compose' }).props.hitSlop).toBeUndefined()
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

  it('Chip moves focus to the next input chip after a removal, or the previous after the last', async () => {
    // The test renderer's views have no siblings to walk, so this drives the
    // registry with stand-ins for React Native's DOM-like elements.
    jest.useFakeTimers()
    const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {})
    type Node = {
      isConnected: boolean
      nextElementSibling: Node | null
      previousElementSibling: Node | null
    }
    const node = (): Node => ({
      isConnected: true,
      nextElementSibling: null,
      previousElementSibling: null,
    })
    const [ada, grace, alan, text] = [node(), node(), node(), node()]
    ada.nextElementSibling = grace
    grace.previousElementSibling = ada
    grace.nextElementSibling = alan
    alan.previousElementSibling = grace
    // Not a chip: skipped.
    alan.nextElementSibling = text
    const buttons = { ada: node(), grace: node(), alan: node() }
    registerRemovable(ada, buttons.ada)
    registerRemovable(grace, buttons.grace)
    registerRemovable(alan, buttons.alan)

    removeAndRefocus(ada, () => {
      ada.isConnected = false
    })
    jest.advanceTimersByTime(100)
    // Not yet: focused before the view leaves the screen, TalkBack loses it again.
    expect(focus).not.toHaveBeenCalled()
    jest.advanceTimersByTime(300)
    expect(focus).toHaveBeenLastCalledWith(buttons.grace, 'focus')

    removeAndRefocus(alan, () => {
      alan.isConnected = false
    })
    jest.advanceTimersByTime(400)
    expect(focus).toHaveBeenLastCalledWith(buttons.grace, 'focus')

    // A chip the app keeps leaves focus alone.
    removeAndRefocus(grace, () => {})
    jest.advanceTimersByTime(1000)
    expect(focus).toHaveBeenCalledTimes(2)
    focus.mockRestore()
    jest.useRealTimers()
  })

  it('disabled controls stay touchable, so TalkBack finds them by touch, and ignore presses', async () => {
    const onPress = jest.fn()
    await renderNative(
      <>
        <Button disabled onPress={onPress}>
          Save
        </Button>
        <Chip disabled onPress={onPress}>
          Invite team
        </Chip>
      </>,
    )
    for (const name of ['Save', 'Invite team']) {
      const button = screen.getByRole('button', { name })
      expect(StyleSheet.flatten(button.props.style).pointerEvents).not.toBe('none')
      expect(button.props.pointerEvents).not.toBe('none')
      expectNoPressHandlers(button)
    }
  })

  it('TagsInput shows its placeholder on one line and keeps it for screen readers', async () => {
    await renderNative(<TagsInput aria-label="Invite" placeholder="name@example.com" />)
    // Android wraps a long TextInput placeholder onto a cut-off second line, so
    // the real one is transparent and a one-line copy, hidden from screen
    // readers, is drawn over the empty box.
    const field = screen.getByPlaceholderText('name@example.com')
    expect(processColor(field.props.placeholderTextColor)).toBe(processColor('transparent'))
    const copy = screen.getByText('name@example.com', { includeHiddenElements: true })
    expect(copy.props.numberOfLines).toBe(1)
    expect(copy).not.toBeVisible()
    await fireEvent.changeText(field, 'ada')
    expect(screen.queryByText('name@example.com', { includeHiddenElements: true })).toBeNull()
  })

  it('TagsInput: a disabled field’s remove buttons read as disabled and do nothing', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <TagsInput
        aria-label="Topics"
        defaultValue={['web']}
        disabled
        onValueChange={onValueChange}
      />,
    )
    const remove = screen.getByRole('button', { name: 'Remove web' })
    expect(remove).toBeDisabled()
    await fireEvent.press(remove)
    expect(onValueChange).not.toHaveBeenCalled()
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
    // Android does not mark tabs clickable: TalkBack's double-tap is "activate".
    await fireEvent(screen.getByRole('tab', { name: 'Home' }), 'accessibilityAction', {
      nativeEvent: { actionName: 'activate' },
    })
    expect(onValueChange).toHaveBeenLastCalledWith('home')
    expect(screen.getByRole('tab', { name: 'Home' })).toBeSelected()
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

  it('CircularProgress and Progress read their value as text, and spin busy without one', async () => {
    await renderNative(
      <>
        <CircularProgress value={40} label="Storage used" showValue />
        <CircularProgress label="Syncing" />
        <Progress value={15} max={60} label="Upload" />
        <Progress value={0} max={0} label="Queue" />
      </>,
    )
    // Android reads only the text: min, max and now are range info, which
    // TalkBack reads for a ProgressBar class, not a progressbar role's view.
    expect(screen.getByRole('progressbar', { name: 'Storage used' })).toHaveAccessibilityValue({
      min: 0,
      max: 100,
      now: 40,
      text: '40%',
    })
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAccessibilityValue({
      text: '25%',
    })
    // A max of 0, before there is any work, reads 0% and not NaN%.
    expect(screen.getByRole('progressbar', { name: 'Queue' })).toHaveAccessibilityValue({
      text: '0%',
    })
    // The percentage is visible but hidden from screen readers, which get the value.
    expect(screen.queryByText('40%')).toBeNull()
    expect(screen.getByText('40%', { includeHiddenElements: true })).toBeOnTheScreen()
    expect(screen.getByRole('progressbar', { name: 'Syncing' })).toBeBusy()
  })

  it('Meter reads its value as text, by default the percentage', async () => {
    await renderNative(
      <>
        <Meter value={7.2} max={10} label="Storage" valueText="7.2 of 10 GB used" />
        <Meter value={30} min={20} max={60} label="Temperature" />
      </>,
    )
    expect(screen.getByRole('meter', { name: 'Storage' })).toHaveAccessibilityValue({
      min: 0,
      max: 10,
      now: 7.2,
      text: '7.2 of 10 GB used',
    })
    expect(screen.getByRole('meter', { name: 'Temperature' })).toHaveAccessibilityValue({
      text: '25%',
    })
  })

  it('Spoiler shows its button once the content measures taller than maxHeight', async () => {
    const onExpandedChange = jest.fn()
    await renderNative(
      <>
        <Spoiler maxHeight={96} onExpandedChange={onExpandedChange}>
          <Text>A long trail description</Text>
        </Spoiler>
        <Spoiler maxHeight={96}>
          <Text>A short note</Text>
        </Spoiler>
      </>,
    )
    // Nothing is measured on the first render, so there is no button yet.
    expect(screen.queryByRole('button')).toBeNull()
    const measured = (text: string) => {
      let node = screen.getByText(text).parent
      while (node && !node.props.onLayout) node = node.parent
      if (!node) throw new Error('no measured view')
      return node
    }
    await fireEvent(measured('A long trail description'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 240 } },
    })
    await fireEvent(measured('A short note'), 'layout', {
      nativeEvent: { layout: { width: 300, height: 40 } },
    })
    const button = screen.getByRole('button', { name: 'Show more' })
    expect(button).toBeCollapsed()
    expect(screen.getAllByRole('button')).toHaveLength(1)
    // Cut off at 96px until pressed.
    const content = measured('A long trail description').parent!
    expect(StyleSheet.flatten(content.props.style).maxHeight).toBe(96)
    await fireEvent.press(button)
    expect(onExpandedChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: 'Show less' })).toBeExpanded()
    expect(StyleSheet.flatten(content.props.style).maxHeight).toBeUndefined()
  })

  it('DescriptionList reads a term and its text as one stop, and leaves controls apart', async () => {
    await renderNative(
      <DescriptionList>
        <DescriptionList.Item term="Order">#4021</DescriptionList.Item>
        <DescriptionList.Item term="Email">
          <Button>Copy</Button>
        </DescriptionList.Item>
      </DescriptionList>,
    )
    // The nearest view above the text that a screen reader stops on.
    const stop = (text: string) => {
      let node = screen.getByText(text).parent
      while (node && node.props.accessible !== true) node = node.parent
      return node
    }
    expect(stop('#4021')).not.toBeNull()
    expect(stop('Order')).toBe(stop('#4021'))
    // Merging this item would hide its button.
    expect(stop('Email')).toBeNull()
    expect(screen.getByRole('button', { name: 'Copy' })).toBeOnTheScreen()
  })

  it('BackToTop shows once a ScrollArea is scrolled down, and scrolls it back', async () => {
    let scroll: BackToTopScroll | undefined
    function Feed() {
      scroll = useBackToTop({ threshold: 100 })
      return (
        <>
          <ScrollArea aria-label="Feed" {...scroll.scrollProps}>
            <Text>Posts</Text>
          </ScrollArea>
          <BackToTop scroll={scroll} />
          {/* Without a ScrollArea there is no page to watch on native. */}
          <BackToTop label="Page" />
        </>
      )
    }
    await renderNative(<Feed />)
    expect(screen.queryByRole('button')).toBeNull()
    const area = screen.getByLabelText('Feed')
    await fireEvent.scroll(area, { nativeEvent: { contentOffset: { x: 0, y: 400 } } })
    const button = screen.getByRole('button', { name: 'Back to top' })
    expect(screen.queryByRole('button', { name: 'Page' })).toBeNull()
    const scrollTo = jest.fn()
    ;(scroll!.scrollProps.ref.current as unknown as { scrollTo: jest.Mock }).scrollTo = scrollTo
    await fireEvent.press(button)
    expect(scrollTo).toHaveBeenCalledWith({ y: 0, animated: true })
    await fireEvent.scroll(area, { nativeEvent: { contentOffset: { x: 0, y: 0 } } })
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('TableOfContents marks the current link in its name and calls onItemPress', async () => {
    const onItemPress = jest.fn()
    await renderNative(
      <TableOfContents
        items={[
          { id: 'install', label: 'Install' },
          { id: 'usage', label: 'Usage' },
        ]}
        onItemPress={onItemPress}
      />,
    )
    // Native reads no aria-current, so the name says it.
    expect(screen.getByRole('link', { name: 'Install, current' })).toBeOnTheScreen()
    const usage = screen.getByRole('link', { name: 'Usage' })
    await fireEvent.press(usage)
    expect(onItemPress).toHaveBeenCalledWith({ id: 'usage', label: 'Usage' })
    expect(screen.getByRole('link', { name: 'Usage, current' })).toBeOnTheScreen()
    // Named outright: a label left out keeps the last one on Android, which
    // read "Install, current" after the press.
    const install = screen.getByRole('link', { name: 'Install' })
    expect(install.props['aria-label'] ?? install.props.accessibilityLabel).toBe('Install')
  })

  it('TransferList moves checked items, names each box by its list, and announces the move', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const onValueChange = jest.fn()
    await renderNative(
      <TransferList
        items={[
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
        ]}
        defaultValue={['email']}
        onValueChange={onValueChange}
      />,
    )
    // Group names are not read on native: the list's name is each box's hint.
    const name = screen.getByRole('checkbox', { name: 'Name' })
    expect(name.props.accessibilityHint).toBe('Available.')
    const add = screen.getByRole('button', { name: 'Move to Selected' })
    expect(add).toBeDisabled()
    await fireEvent.press(name)
    expect(add).toBeEnabled()
    await fireEvent.press(add)
    expect(onValueChange).toHaveBeenCalledWith(['name', 'email'])
    expect(announce).toHaveBeenCalledWith('1 moved to Selected')
    announce.mockRestore()
  })

  it('Portal renders beside the app: it keeps the theme, not React context', async () => {
    const Probe = createContext('lost')
    function Read() {
      return <Text>Context {useContext(Probe)}</Text>
    }
    await renderNative(
      <Probe.Provider value="kept">
        <Text>Light text</Text>
        <Theme name="dark">
          <Text>Dark text</Text>
          <Portal>
            <Text>In the portal</Text>
            <Read />
          </Portal>
        </Theme>
      </Probe.Provider>,
    )
    const color = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style).color
    expect(color('Dark text')).not.toEqual(color('Light text'))
    expect(color('In the portal')).toEqual(color('Dark text'))
    // What the docs tell apps: pass values in as props, or read a store.
    expect(screen.getByText('Context lost')).toBeOnTheScreen()
  })

  it('Tour reads each step as one heading stop, moves focus to it, and walks the steps', async () => {
    const focus = jest
      .spyOn(AccessibilityInfo, 'sendAccessibilityEvent')
      .mockImplementation(() => {})
    const onComplete = jest.fn()
    await renderNative(
      <Tour
        defaultOpen
        onComplete={onComplete}
        steps={[
          { title: 'Welcome', description: 'A quick look around.' },
          { title: 'Your projects', description: 'Everything you made is here.' },
        ]}
      />,
    )
    // Native: the step and the title are one stop, and the card has no
    // role, which would make it one stop catching the buttons' touches.
    const heading = screen.getByRole('heading', { name: 'Step 1 of 2 Welcome' })
    expect(focus).toHaveBeenLastCalledWith(expect.anything(), 'focus')
    expect(screen.queryByRole('dialog')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { name: 'Step 2 of 2 Your projects' })).toBeOnTheScreen()
    expect(heading).not.toBeOnTheScreen()
    expect(focus).toHaveBeenCalledTimes(2)
    await fireEvent.press(screen.getByRole('button', { name: 'Done' }))
    expect(onComplete).toHaveBeenCalled()
    expect(screen.queryByText('Your projects')).toBeNull()
    focus.mockRestore()
  })

  it('Tour places its card from the target’s place in the root view, where the portal draws', async () => {
    // Android's measureInWindow starts below the status bar (here 40 high),
    // which an edge-to-edge app draws under.
    const target = {
      current: {
        measure: (done: (...box: number[]) => void) => done(0, 0, 80, 32, 100, 140),
        measureInWindow: (done: (...box: number[]) => void) => done(100, 100, 80, 32),
      },
    }
    await renderNative(
      <Tour defaultOpen steps={[{ title: 'Search', target: target as never }]} />,
    )
    let card = screen.getByRole('heading', { name: 'Step 1 of 1 Search' }).parent
    while (card && StyleSheet.flatten(card.props.style)?.position !== 'absolute') card = card.parent
    // 4px around the target, then 12px to the card.
    expect(StyleSheet.flatten(card?.props.style)).toMatchObject({ top: 140 + 32 + 4 + 12 })
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

  it('Toolbar lays out its regions and keeps each control reachable', async () => {
    const onPress = jest.fn()
    const onValueChange = jest.fn()
    await renderNative(
      <>
        <Toolbar
          testID="bar"
          role="toolbar"
          aria-label="Formatting"
          leading="Notes"
          trailing={<Button onPress={onPress}>Save</Button>}
        >
          <Toolbar.Group aria-label="Alignment" testID="group">
            <ToggleGroup type="single" defaultValue="left" onValueChange={onValueChange}>
              <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
              <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
            </ToggleGroup>
          </Toolbar.Group>
          <Toolbar.Separator testID="separator" />
        </Toolbar>
        <Toolbar testID="column" orientation="vertical" variant="ghost">
          <IconButton aria-label="Rotate" icon={<PlusIcon />} />
        </Toolbar>
      </>,
    )
    const bar = screen.getByTestId('bar')
    expect(bar.props.role).toBe('toolbar')
    expect(bar.props['aria-label'] ?? bar.props.accessibilityLabel).toBe('Formatting')
    // Not one merged element: its controls stay separate for TalkBack and VoiceOver.
    expect(bar.props.accessible).not.toBe(true)
    expect(StyleSheet.flatten(bar.props.style).flexDirection).toBe('row')
    expect(screen.getByTestId('group').props.role).toBe('group')
    // Decorative, so hidden from assistive technology.
    const separator = screen.getByTestId('separator', { includeHiddenElements: true })
    expect(separator).not.toBeVisible()
    expect(StyleSheet.flatten(separator.props.style).width).toBe(1)
    // A text region is wrapped in Text (a bare string would throw in a View).
    expect(screen.getByText('Notes')).toBeOnTheScreen()

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    await fireEvent.press(screen.getByRole('radio', { name: 'Right' }))
    expect(onValueChange).toHaveBeenCalledWith('right')

    const column = StyleSheet.flatten(screen.getByTestId('column').props.style)
    expect(column.flexDirection).toBe('column')
    expect(column.alignSelf).toBe('flex-start')
    expect(screen.getByRole('button', { name: 'Rotate' })).toBeOnTheScreen()
  })

  it('Toolbar: a center that grows takes only the free space, unless the bar wraps', async () => {
    // Yoga sized a center holding a growing field at the whole bar, so the
    // title beside it shrank to a letter a line.
    await renderNative(
      <>
        <Toolbar leading="Users" center={<XStack testID="field" flex={1} />} />
        <Toolbar wrap leading="Orders" center={<XStack testID="wrapped" flex={1} />} />
      </>,
    )
    const region = (testID: string) =>
      StyleSheet.flatten(screen.getByTestId(testID).parent?.props.style)
    expect(region('field')).toMatchObject({ flexGrow: 1, flexBasis: 0 })
    // With wrap, the center's size decides where the line breaks.
    expect(region('wrapped').flexGrow).toBe(1)
    expect(region('wrapped').flexBasis).toBeUndefined()
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
    // React Native's ScrollView drops aria-label; Android read no name.
    expect(scroll.props.accessibilityLabel).toBe('Albums')
    expect(screen.getByText('Nightfall')).toBeOnTheScreen()
  })

  it('OtpInput is one text field that keeps digits and reports completion', async () => {
    const onComplete = jest.fn()
    await renderNative(
      <OtpInput aria-label="Code" placeholder="code" length={4} onComplete={onComplete} />,
    )
    await fireEvent.changeText(screen.getByPlaceholderText('code'), '12a34')
    expect(onComplete).toHaveBeenCalledWith('1234')
    // Android leaves a view with alpha 0 out of the accessibility tree, so
    // TalkBack never found the field; it keeps a trace of opacity.
    expect(screen.getByLabelText('Code')).toBeVisible()
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
    // Native has no aria-current, so today's name says so.
    expect(screen.getByRole('button', { name: 'Sunday, March 1, 2026, today' })).toBeOnTheScreen()
    const day = screen.getByRole('button', { name: /March 12, 2026/ })
    await fireEvent.press(day)
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 12))
    expect(screen.getByRole('button', { name: /March 12, 2026/ })).toBeSelected()
  })

  it('TimePicker puts the field label in each select name, since a group name is not read', async () => {
    await renderNative(
      <Field label="Pickup" description="We wait 10 minutes.">
        <TimePicker defaultValue="14:45" hourCycle={12} minuteStep={15} />
      </Field>,
    )
    const hour = screen.getByRole('combobox', { name: 'Pickup, Hour' })
    expect(hour).toHaveAccessibilityValue({ text: '2' })
    expect(hour.props.accessibilityHint).toBe('We wait 10 minutes.')
    expect(screen.getByRole('combobox', { name: 'Pickup, Minute' })).toHaveAccessibilityValue({
      text: '45',
    })
    expect(screen.getByRole('combobox', { name: 'Pickup, AM or PM' })).toHaveAccessibilityValue({
      text: 'PM',
    })
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

  it('DateTimePicker puts the field label in each part name and keeps the time on a new day', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Field label="Starts" description="In your time zone.">
        <DateTimePicker
          locale="en-US"
          defaultValue={new Date(2026, 9, 14, 14, 45)}
          hourCycle={12}
          minuteStep={15}
          onValueChange={onValueChange}
        />
      </Field>,
    )
    // Native reads no group names, so each part carries the field's.
    const date = screen.getByRole('button', { name: 'Starts, Date' })
    expect(date).toHaveAccessibilityValue({ text: 'Oct 14, 2026' })
    expect(date.props.accessibilityHint).toBe('In your time zone.')
    const hour = screen.getByRole('combobox', { name: 'Starts, Hour' })
    expect(hour).toHaveAccessibilityValue({ text: '2' })
    expect(hour.props.accessibilityHint).toBe('In your time zone.')
    expect(screen.getByRole('combobox', { name: 'Starts, Minute' })).toHaveAccessibilityValue({
      text: '45',
    })
    expect(screen.getByRole('combobox', { name: 'Starts, AM or PM' })).toHaveAccessibilityValue({
      text: 'PM',
    })
    await fireEvent.press(date)
    await fireEvent.press(await screen.findByRole('button', { name: /October 20, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 20, 14, 45))
  })

  it('ColorPicker:adjustable area and sliders, swatches, and a field that opens a sheet', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <>
        <Field label="Brand color" description="Used for buttons.">
          <ColorPicker
            inline
            defaultValue="#ff0000"
            swatches={[{ value: '#0000ff', label: 'Blue' }]}
            onValueChange={onValueChange}
          />
        </Field>
        <ColorPicker aria-label="Accent" defaultValue="#00ff00" />
      </>,
    )
    // Native has no group names, so each control reads the field's.
    const area = screen.getByRole('slider', { name: 'Color' })
    expect(area.props.accessible).toBe(true)
    expect(area.props.accessibilityHint).toBe('Brand color. Used for buttons.')
    expect(area.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 100,
      text: 'Saturation 100%, brightness 100%',
    })
    // Swipes change the brightness; the actions menu holds the saturation.
    await fireEvent(area, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } })
    expect(onValueChange).toHaveBeenLastCalledWith('#e60000')
    await fireEvent(area, 'accessibilityAction', { nativeEvent: { actionName: 'desaturate' } })
    expect(screen.getByRole('slider', { name: 'Color' }).props.accessibilityValue.text).toBe(
      'Saturation 90%, brightness 90%',
    )

    const hue = screen.getByRole('slider', { name: 'Hue' })
    expect(hue.props.hitSlop).toEqual({ top: 13, bottom: 13 })
    await fireEvent(hue, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } })
    expect(screen.getByRole('slider', { name: 'Hue' }).props.accessibilityValue).toEqual({
      min: 0,
      max: 360,
      now: 10,
      text: '10°',
    })

    expect(screen.getByRole('button', { name: 'Blue' })).not.toBeSelected()
    await fireEvent.press(screen.getByRole('button', { name: 'Blue' }))
    expect(onValueChange).toHaveBeenLastCalledWith('#0000ff')
    expect(screen.getByRole('button', { name: 'Blue' })).toBeSelected()

    // The field reads its color as the value, and opens the picker in a sheet.
    const accent = screen.getByRole('button', { name: 'Accent' })
    expect(accent).toHaveAccessibilityValue({ text: '#00ff00' })
    await fireEvent.press(accent)
    // The sheet's area is readable; the inline picker behind it is hidden from
    // screen readers while the sheet is open.
    expect(await screen.findAllByRole('slider', { name: 'Color' })).toHaveLength(1)
    expect(
      screen.getAllByRole('slider', { name: 'Color', includeHiddenElements: true }),
    ).toHaveLength(2)
  })

  it('ColorPicker keeps a sheet around it out of its drags', async () => {
    await renderNative(<ColorPicker aria-label="Accent" inline defaultValue="#00ff00" />)
    const area = screen.getByRole('slider', { name: 'Color' })
    // The view around the area: it answers moves, but does not take touches itself.
    let guard = area.parent
    while (guard && !(guard.props.onMoveShouldSetResponder && !guard.props.onResponderGrant)) {
      guard = guard.parent
    }
    const touch = touchAt(10, 10)
    expect(guard!.props.onMoveShouldSetResponder()).toBe(false)
    await fireEvent(area, 'responderGrant', touch)
    // Tamagui's Sheet, if asked about a vertical move, marks itself as
    // dragging even though the area keeps the gesture, and then stays open.
    expect(guard!.props.onMoveShouldSetResponder()).toBe(true)
    await fireEvent(area, 'responderRelease', touchAt(10, 10, { lifted: true }))
    expect(guard!.props.onMoveShouldSetResponder()).toBe(false)
  })

  it('DateRangePicker reads its range with plain spaces', async () => {
    await renderNative(
      <DateRangePicker
        aria-label="Stay"
        locale="en-US"
        defaultValue={{ start: new Date(2026, 9, 1), end: new Date(2026, 9, 14) }}
      />,
    )
    // Newer ICU puts thin spaces around the dash; the field shows plain ones.
    expect(screen.getByRole('button', { name: 'Stay' })).toHaveAccessibilityValue({
      text: 'Oct 1 – 14, 2026',
    })
  })

  it('Field names its control and reads help and error text as the hint', async () => {
    await renderNative(
      <Field label="Email" description="Work email." error="Enter an email.">
        <Input placeholder="you@example.com" />
      </Field>,
    )
    const input = screen.getByPlaceholderText('you@example.com')
    // A Label's htmlFor only moves focus on native, so the field names the control.
    expect(screen.getByLabelText('Email')).toBe(input)
    expect(input.props.accessibilityHint).toBe('Enter an email. Work email.')
    expect(input.props['aria-invalid'] ?? input.props.accessibilityState?.invalid).toBeTruthy()
  })

  it('Field wires a control inside a layout and adds "(optional)" to its name', async () => {
    await renderNative(
      <Field
        label="Nickname"
        optional
        description="Shown to friends."
        orientation="horizontal"
        disabled
      >
        <XStack>
          <Input placeholder="nick" />
          <Button>Random</Button>
        </XStack>
      </Field>,
    )
    const input = screen.getByPlaceholderText('nick')
    expect(screen.getByLabelText('Nickname (optional)')).toBe(input)
    expect(input.props.accessibilityHint).toBe('Shown to friends.')
    expect(input).toBeDisabled()
    // Only form controls read the field; the button keeps its own props.
    expect(screen.getByRole('button', { name: 'Random' })).not.toBeDisabled()
  })

  it('Field names its control from element text and hides the repeated label', async () => {
    await renderNative(
      <Field
        label={
          <>
            API <Text weight="bold">key</Text> <PlusIcon />
          </>
        }
        description={<Text>Starts with sk_.</Text>}
        error={
          <>
            Revoked. <Text weight="semibold">Make a new one.</Text>
          </>
        }
      >
        <Input placeholder="key" />
      </Field>,
    )
    const input = screen.getByPlaceholderText('key')
    expect(screen.getByLabelText('API key')).toBe(input)
    expect(input.props.accessibilityHint).toBe('Revoked. Make a new one. Starts with sk_.')
    // The control already says it; the visible label is hidden from screen readers.
    expect(screen.queryByText('API', { exact: false })).toBeNull()
  })

  it('Field disables its Input and Textarea so they cannot be edited', async () => {
    await renderNative(
      <>
        <Field label="Title" disabled>
          <Input placeholder="title" />
        </Field>
        <Field label="Notes" disabled>
          <Textarea placeholder="notes" />
        </Field>
      </>,
    )
    expect(screen.getByPlaceholderText('title').props.editable).toBe(false)
    expect(screen.getByPlaceholderText('notes').props.editable).toBe(false)
    expect(screen.getByPlaceholderText('notes')).toBeDisabled()
  })

  it('Field names a Combobox but not the search box in its sheet', async () => {
    await renderNative(
      <Field label="Country" description="Where you live.">
        <Combobox placeholder="Search" options={[{ value: 'mm', label: 'Myanmar' }]} />
      </Field>,
    )
    const field = screen.getByRole('button', { name: 'Country' })
    expect(field.props.accessibilityHint).toBe('Where you live.')
    await fireEvent.press(field)
    expect(screen.getByPlaceholderText('Search').props.accessibilityHint).toBeUndefined()
  })

  it('Field gives a Select its help text as the hint', async () => {
    await renderNative(
      <Field label="Plan" description="Billed monthly.">
        <Select defaultValue="team">
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="team">Team</Select.Item>
        </Select>
      </Field>,
    )
    expect(screen.getByLabelText('Plan').props.accessibilityHint).toBe('Billed monthly.')
  })

  it('Select opens and picks for screen readers, and reads the choice as its value', async () => {
    // Tamagui's trigger and items react to touches only; TalkBack could neither
    // reach them nor activate them, and read "Plan" without the choice.
    const onValueChange = jest.fn()
    await renderNative(
      <Field label="Plan">
        <Select defaultValue="team" onValueChange={onValueChange}>
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="team">Team</Select.Item>
          <Select.Item value="business" disabled>
            Business
          </Select.Item>
        </Select>
      </Field>,
    )
    const activate = { nativeEvent: { actionName: 'activate' } }
    const trigger = screen.getByRole('combobox', { name: 'Plan' })
    expect(trigger).toHaveAccessibilityValue({ text: 'Team' })
    await fireEvent(trigger, 'accessibilityAction', activate)
    expect(trigger).toBeExpanded()
    const business = await screen.findByRole('option', { name: 'Business' })
    expect(business).toBeDisabled()
    await fireEvent(business, 'accessibilityAction', activate)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('option', { name: 'Team' })).toBeSelected()
    await fireEvent(screen.getByRole('option', { name: 'Free' }), 'accessibilityAction', activate)
    expect(onValueChange).toHaveBeenCalledWith('free')
    expect(trigger).toHaveAccessibilityValue({ text: 'Free' })
    expect(trigger).toBeCollapsed()
  })

  it('Select reads its placeholder as the value until a choice', async () => {
    await renderNative(
      <Select aria-label="Timezone" placeholder="Select a timezone">
        <Select.Item value="yangon">Yangon</Select.Item>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'Timezone' })).toHaveAccessibilityValue({
      text: 'Select a timezone',
    })
  })

  it('Select reads an option whose value is empty (Filter Bar’s "Any") as its value', async () => {
    await renderNative(
      <Select aria-label="Status" placeholder="Any" value="">
        <Select.Item value="">All statuses</Select.Item>
        <Select.Item value="open">Open</Select.Item>
      </Select>,
    )
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveAccessibilityValue({
      text: 'All statuses',
    })
  })

  it('Select’s small trigger is as tall as a small field', async () => {
    await renderNative(
      <Select size="sm" aria-label="Level">
        <Select.Item value="info">Info</Select.Item>
      </Select>,
    )
    // Tamagui's trigger is a ListItem with a 40px minimum height of its own.
    expect(
      StyleSheet.flatten(screen.getByRole('combobox', { name: 'Level' }).props.style),
    ).toMatchObject({ height: 32, minHeight: 0 })
  })

  it('Field puts "required" in the native name, which has no required state', async () => {
    await renderNative(
      <>
        <Field label="Email" required>
          <Input placeholder="email" />
        </Field>
        <Field label="Courriel" required requiredText="obligatoire">
          <Input placeholder="courriel" />
        </Field>
        <Field label="Nickname" optional>
          <Input placeholder="nickname" />
        </Field>
      </>,
    )
    expect(screen.getByPlaceholderText('email')).toHaveProp('aria-label', 'Email, required')
    expect(screen.getByPlaceholderText('courriel')).toHaveProp(
      'aria-label',
      'Courriel, obligatoire',
    )
    expect(screen.getByPlaceholderText('nickname')).toHaveProp('aria-label', 'Nickname (optional)')
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
        <Field label="Email">
          <Input placeholder="you@example.com" />
        </Field>
        <Input aria-label="Notes" placeholder="Notes" />
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
    // A control outside a Field follows the form too.
    expect(screen.getByPlaceholderText('Notes')).toBeDisabled()
  })

  it('PasswordInput toggles secure text entry from its toggle button', async () => {
    await renderNative(<PasswordInput aria-label="Password" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input.props.secureTextEntry).toBe(true)
    // React Native has no aria-pressed: the toggle reports "checked" instead.
    const toggle = screen.getByRole('togglebutton', { name: 'Show password' })
    expect(toggle.props['aria-checked']).toBe(false)
    await fireEvent.press(toggle)
    expect(screen.getByPlaceholderText('Password').props.secureTextEntry).toBe(false)
    expect(screen.getByRole('togglebutton', { name: 'Show password' }).props['aria-checked']).toBe(
      true,
    )
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

  it('LoadingState reads its text as one status and keeps its button reachable', async () => {
    const onCancel = jest.fn()
    await renderNative(
      <LoadingState title="Loading invoices…" description="This can take a minute.">
        <Button onPress={onCancel}>Cancel</Button>
      </LoadingState>,
    )
    // The text says it, so the spinner is hidden.
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Loading invoices…This can take a minute.')
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('EmptyState, LoadingState and FileDropzone keep a dashed border dashed on Android', async () => {
    await renderNative(
      <>
        <EmptyState testID="empty" bordered title="No results" />
        <LoadingState testID="loading" bordered />
        <FileDropzone invalid />
      </>,
    )
    // Android dashes a rounded border only from `borderWidth` and `borderColor`
    // for all sides, and Tamagui splits both into per-side props (its `style`
    // prop too, since Tamagui 3). So the frame's own border is transparent and
    // a plain view on top draws the dashes with one width, color and radius.
    for (const frame of [
      screen.getByTestId('empty'),
      screen.getByTestId('loading'),
      screen.getByRole('button', { name: /Tap to choose files/ }),
    ]) {
      expect(StyleSheet.flatten(frame.props.style).borderTopColor).toBe('transparent')
      type Node = { props: Record<string, unknown>; children: (Node | string)[] }
      const find = (node: Node): Node | undefined => {
        for (const child of node.children) {
          if (typeof child === 'string') continue
          if (child.props.pointerEvents === 'none') return child
          const found = find(child)
          if (found) return found
        }
      }
      const overlay = find(frame as unknown as Node)
      const style = StyleSheet.flatten(overlay?.props.style as ViewStyle)
      expect(style).toMatchObject({ borderWidth: 1, borderStyle: 'dashed' })
      expect(style.borderColor).toMatch(/^#/)
      expect(style.borderRadius).toBeGreaterThan(0)
      expect(style).not.toHaveProperty('borderTopWidth')
      expect(style).not.toHaveProperty('borderTopColor')
    }
  })

  it('Combobox opens a searchable sheet and picks a labelled row', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <Combobox
        aria-label="Country"
        placeholder="Search"
        options={[
          { value: 'mm', label: 'Myanmar' },
          { value: 'th', label: 'Thailand', description: 'UTC+07:00' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    // The field is a named button: its text is read only as its value.
    const field = screen.getByRole('button', { name: 'Country' })
    expect(field).toHaveAccessibilityValue({ text: 'Search' })
    await fireEvent.press(field)
    await fireEvent.changeText(screen.getByPlaceholderText('Search'), 'thai')
    expect(screen.queryByRole('button', { name: 'Myanmar' })).toBeNull()
    // The row's name holds its description, as its text does on web.
    await fireEvent.press(screen.getByRole('button', { name: 'Thailand, UTC+07:00' }))
    expect(onValueChange).toHaveBeenCalledWith('th')
    expect(field).toHaveAccessibilityValue({ text: 'Thailand' })
  })

  it('MultiSelect rows are checkboxes and the sheet stays open between picks', async () => {
    const onValueChange = jest.fn()
    await renderNative(
      <MultiSelect
        aria-label="Labels"
        placeholder="Add labels"
        options={[
          { value: 'bug', label: 'Bug' },
          { value: 'docs', label: 'Docs' },
        ]}
        onValueChange={onValueChange}
      />,
    )
    const field = screen.getByRole('button', { name: 'Labels' })
    expect(field).toHaveAccessibilityValue({ text: 'Add labels' })
    // Yoga starts a wrapping row's lines at the top; the placeholder is centered.
    expect(StyleSheet.flatten(field.props.style).alignContent).toBe('center')
    await fireEvent.press(field)
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bug' }))
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Docs' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['bug', 'docs'])
    expect(screen.getByRole('checkbox', { name: 'Bug' })).toBeChecked()
    // The chips are not read inside the named field; its value lists the picks.
    expect(field).toHaveAccessibilityValue({ text: 'Bug, Docs' })
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

  it('ListItem: the row is one button beside its actions, and says when it is selected', async () => {
    const onPress = jest.fn()
    const onDownload = jest.fn()
    await renderNative(
      <>
        <ListItem title="Reports" selected onPress={onPress} />
        <ListItem
          title="Quarterly report.pdf"
          description="Modified 2 hours ago"
          onPress={onPress}
          actions={<Button onPress={onDownload}>Download</Button>}
        />
        <ListItem title="Version" trailing="2.4.0" />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Reports' })).toBeSelected()
    expect(screen.getByRole('button', { name: /Quarterly report/ })).not.toBeSelected()
    // A sibling of the row's button, so pressing it does not press the row.
    await fireEvent.press(screen.getByRole('button', { name: 'Download' }))
    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onPress).not.toHaveBeenCalled()
    await fireEvent.press(screen.getByRole('button', { name: /Quarterly report/ }))
    expect(onPress).toHaveBeenCalledTimes(1)
    // Without onPress the row is not a button.
    expect(screen.queryByRole('button', { name: /Version/ })).toBeNull()
  })

  it('ListItem: a selectable row is a toggle button that reports checked', async () => {
    const onSelectedChange = jest.fn()
    await renderNative(
      <>
        <ListItem title="Option A" selectable onSelectedChange={onSelectedChange} />
        <ListItem title="Option B" selectable disabled onSelectedChange={onSelectedChange} />
      </>,
    )
    const state = () =>
      screen.getByRole('togglebutton', { name: 'Option A' }).props.accessibilityState
    expect(state()).toMatchObject({ checked: false })
    await fireEvent.press(screen.getByRole('togglebutton', { name: 'Option A' }))
    expect(state()).toMatchObject({ checked: true })
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
    const disabled = screen.getByRole('togglebutton', { name: 'Option B' })
    expect(disabled).toBeDisabled()
    await fireEvent.press(disabled)
    expect(onSelectedChange).toHaveBeenCalledTimes(1)
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

  it('cleared disabled, busy and selected states are sent as false', async () => {
    // Regression: Android keeps the last value of a prop that is removed, so a
    // state that went from true to absent stayed on and TalkBack kept reading
    // "Page 1, selected" and "Previous page, disabled" after paging.
    await renderNative(<Pagination count={10} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Next page' }))
    const state = (name: string) => {
      const { props } = screen.getByRole('button', { name })
      return {
        ...props.accessibilityState,
        disabled: props['aria-disabled'],
        busy: props['aria-busy'],
        selected: props['aria-selected'],
      }
    }
    expect(state('Previous page')).toMatchObject({ disabled: false, busy: false })
    expect(state('Page 1')).toMatchObject({ selected: false, disabled: false })
    expect(state('Page 2')).toMatchObject({ selected: true })
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

  it('TagsInput adds tags with return and commas, and removes them', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const onValueChange = jest.fn()
    await renderNative(
      <Field label="Topics" description="Press return after each one.">
        <TagsInput placeholder="Add a topic" onValueChange={onValueChange} />
      </Field>,
    )
    const field = screen.getByPlaceholderText('Add a topic')
    // The TextInput itself hears key presses. Tamagui drops onKeyPress from
    // its own Input on native, and fireEvent would still find it further up.
    expect(field.props.onKeyPress).toEqual(expect.any(Function))
    expect(field.props.accessibilityLabel ?? field.props['aria-label']).toBe('Topics')
    expect(field.props.accessibilityHint).toBe('Press return after each one.')
    // Return keeps the keyboard open for the next tag.
    expect(field.props.submitBehavior).toBe('submit')
    await fireEvent.changeText(field, 'web')
    await fireEvent(field, 'submitEditing')
    expect(onValueChange).toHaveBeenLastCalledWith(['web'])
    expect(announce).toHaveBeenLastCalledWith('Added web')
    await fireEvent.changeText(field, 'ios,')
    expect(onValueChange).toHaveBeenLastCalledWith(['web', 'ios'])
    await fireEvent.press(screen.getByRole('button', { name: 'Remove web' }))
    expect(onValueChange).toHaveBeenLastCalledWith(['ios'])
    expect(announce).toHaveBeenLastCalledWith('Removed web')
    await fireEvent(field, 'keyPress', { nativeEvent: { key: 'Backspace' } })
    expect(onValueChange).toHaveBeenLastCalledWith([])
    announce.mockRestore()
  })

  it('Carousel snaps to each slide, moves with its buttons and announces the slide', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const onIndexChange = jest.fn()
    await renderNative(
      <Carousel aria-label="Featured" slidesPerView={2} onIndexChange={onIndexChange}>
        <Text>Slide one</Text>
        <Text>Slide two</Text>
        <Text>Slide three</Text>
      </Carousel>,
    )
    const slide = screen.getByText('Slide one').parent!
    let track = slide.parent
    while (track && track.props.horizontal !== true) track = track.parent
    if (!track) throw new Error('no horizontal ScrollView')
    // Slide widths come from the measured width: (300 - 16) / 2, 16px apart.
    await fireEvent(track, 'layout', { nativeEvent: { layout: { width: 300, height: 120 } } })
    expect(StyleSheet.flatten(slide.props.style).width).toBe(142)
    expect(track.props.snapToOffsets).toEqual([0, 158])
    expect(track.props.disableIntervalMomentum).toBe(true)

    const next = screen.getByRole('button', { name: 'Next slide' })
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
    // The current dot says so in its name, not with a selected state: TalkBack
    // reads the whole row of dots when that state moves.
    const first = screen.getByRole('button', { name: 'Go to slide 1, current' })
    expect(first).not.toBeSelected()
    await fireEvent.press(next)
    expect(onIndexChange).toHaveBeenLastCalledWith(1)
    expect(announce).toHaveBeenLastCalledWith('Slide 2 of 3')
    expect(screen.getByRole('button', { name: 'Go to slide 2, current' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeOnTheScreen()
    expect(next).toBeDisabled()

    // A swipe back settles on the first slide.
    await fireEvent(track, 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    })
    expect(onIndexChange).toHaveBeenLastCalledWith(0)
    announce.mockRestore()
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
    expectNoPressHandlers(busy)
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
    // An unnamed frame: TalkBack made a named one a stop that caught touches
    // meant for the buttons inside.
    expect(screen.queryByLabelText('Flood safety')).toBeNull()
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

  it('Tooltip renders only its trigger, which keeps its name and is not marked expanded', async () => {
    const onPress = jest.fn()
    await renderNative(
      <Tooltip content="Saves your draft">
        <Button onPress={onPress}>Save</Button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Save' })
    expect(trigger.props['aria-expanded']).toBeUndefined()
    expect(trigger.props.accessibilityState?.expanded).toBeUndefined()
    expect(screen.queryByText('Saves your draft')).toBeNull()
    await fireEvent.press(trigger)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('CopyButton copies with the clipboard from setClipboard and announces the result', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const onCopyError = jest.fn()
    const { unmount } = await renderNative(
      <CopyButton value="token-123" onCopyError={onCopyError} />,
    )
    // No clipboard yet: the press fails and says why.
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(announce).toHaveBeenLastCalledWith('Couldn’t copy'))
    expect(onCopyError).toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('setClipboard'))
    warn.mockRestore()
    await unmount()

    const write = jest.fn((_text: string) => {})
    setClipboard(write)
    await renderNative(<CopyButton value="token-123">Copy token</CopyButton>)
    const button = screen.getByRole('button', { name: 'Copy token' })
    await fireEvent(button, 'layout', { nativeEvent: { layout: { width: 150, height: 40 } } })
    await fireEvent.press(button)
    expect(write).toHaveBeenCalledWith('token-123')
    await waitFor(() => expect(announce).toHaveBeenLastCalledWith('Copied'))
    // The shorter "Copied" keeps the label's width.
    const copied = screen.getByRole('button', { name: 'Copied' })
    expect(StyleSheet.flatten(copied.props.style).minWidth).toBe(150)
    setClipboard(undefined)
    announce.mockRestore()
  })

  it('CopyButton leaves a copy to Android 13, which confirms it and is read by TalkBack', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    jest.replaceProperty(Platform, 'OS', 'android')
    jest.spyOn(Platform, 'Version', 'get').mockReturnValue(33)
    const write = jest.fn((_text: string) => {})
    setClipboard(write)
    await renderNative(<CopyButton value="token-123" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }))
    expect(write).toHaveBeenCalledWith('token-123')
    expect(announce).not.toHaveBeenCalled()
    // A failure is ours to say.
    setClipboard(() => Promise.reject(new Error('denied')))
    await fireEvent.press(screen.getByRole('button', { name: 'Copy' }))
    await waitFor(() => expect(announce).toHaveBeenLastCalledWith('Couldn’t copy'))
    jest.restoreAllMocks()
    setClipboard(undefined)
  })

  it('CodeBlock scrolls long lines sideways, hides line numbers and copies the code', async () => {
    const write = jest.fn((_text: string) => {})
    setClipboard(write)
    const code = 'const a = 1\n\nreturn a'
    await renderNative(
      <>
        <CodeBlock title="main.ts" code={code} lineNumbers />
        <CodeBlock code="wrapped line" wrap copyable={false} />
      </>,
    )
    const line = screen.getByText('const a = 1')
    let scroll = line.parent
    while (scroll && scroll.props.horizontal !== true) scroll = scroll.parent
    expect(scroll).toBeTruthy()
    expect(screen.queryByText('2')).toBeNull()
    expect(screen.getByText('2', { includeHiddenElements: true })).toBeTruthy()
    // Wrapped code needs no sideways scroll.
    let wrapped = screen.getByText('wrapped line').parent
    while (wrapped && wrapped.props.horizontal !== true) wrapped = wrapped.parent
    expect(wrapped).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Copy code' }))
    expect(write).toHaveBeenCalledWith(code)
    setClipboard(undefined)
  })

  it('CodeBlock ends an unwrapped italic line with a hair space, so Android keeps its last word', async () => {
    const tokens = [[{ content: '// a comment', italic: true }]]
    await renderNative(
      <>
        <CodeBlock code="// a comment" tokens={tokens} copyable={false} />
        <CodeBlock code="// a comment" tokens={tokens} copyable={false} wrap />
      </>,
    )
    const [plain, wrapped] = screen.getAllByText('// a comment').map((token) => token.parent!)
    expect(plain!.props.children).toContain('\u200A')
    expect(wrapped!.props.children).not.toContain('\u200A')
  })

  it('VisuallyHidden is read with the text around it and drawn nowhere', async () => {
    await renderNative(
      <>
        <Link href="https://example.com/pricing">
          Read more<VisuallyHidden> about pricing</VisuallyHidden>
        </Link>
        <VisuallyHidden>3 unread messages</VisuallyHidden>
      </>,
    )
    expect(screen.getByRole('link', { name: 'Read more about pricing' })).toBeOnTheScreen()
    // Inside a Text the box does nothing, so the words are transparent and tiny.
    // Android reads a color of 0 as unset and drew them in the link's color, so
    // the color has no alpha but is not 0.
    const nested = StyleSheet.flatten(screen.getByText('about pricing').props.style)
    const color = processColor(nested.color) as number
    expect(color >>> 24).toBe(0)
    expect(color).not.toBe(0)
    expect(nested.fontSize).toBeLessThan(1)
    // On its own: a 1pt box, with a trace of opacity so Android keeps it in the tree.
    const alone = StyleSheet.flatten(screen.getByText('3 unread messages').props.style)
    expect(alone).toMatchObject({ position: 'absolute', width: 1, height: 1, overflow: 'hidden' })
    expect(alone.opacity).toBeGreaterThan(0)
    expect(processColor(alone.color) as number).toBe(color)
    expect(alone).not.toHaveProperty('whiteSpace')
  })

  it('Indicator reads its label and pins a hidden mark to the corner', async () => {
    await renderNative(
      <>
        <Indicator tone="success" placement="bottom-end" overlap="circle" label="Online">
          <Avatar alt="Ada Lovelace" />
        </Indicator>
        <Indicator count={120} placement="bottom-start" overlap="circle" label="120 unread">
          <Avatar alt="Grace Hopper" />
        </Indicator>
      </>,
    )
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeOnTheScreen()
    expect(screen.getByText('Online')).toBeOnTheScreen()
    expect(screen.getByText('120 unread')).toBeOnTheScreen()
    // The count is drawn, but TalkBack and VoiceOver read the label instead.
    expect(screen.queryByText('99+')).toBeNull()
    const count = screen.getByText('99+', { includeHiddenElements: true })
    expect(count).not.toBeVisible()
    // A point at the corner, moved in to the circle's edge. The mark centers on
    // it at its own size, and neither takes touches meant for the avatar.
    let anchor = count.parent
    while (anchor && StyleSheet.flatten(anchor.props.style)?.width !== 0) anchor = anchor.parent
    const style = StyleSheet.flatten(anchor?.props.style)
    expect(style).toMatchObject({ position: 'absolute', width: 0, height: 0 })
    expect(style).toMatchObject({ alignItems: 'center', justifyContent: 'center' })
    expect(String(style.bottom)).toMatch(/^14\.6\d*%$/)
    expect(String(style.left)).toMatch(/^14\.6\d*%$/)
    expect(anchor?.props.pointerEvents ?? style.pointerEvents).toBe('none')
  })
})

// Grid widths come from media props; on native Tamagui re-reads them from the
// window size, so these resize the (mocked) window like a rotation would.
describe('Grid layout', () => {
  const phone = Dimensions.get('window')
  const resize = async (width: number) => {
    await act(async () => {
      Dimensions.set({ window: { ...phone, width }, screen: { ...phone, width } })
    })
  }
  const style = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)
  const layout = () => (
    <Grid columns={12} gap="4" testID="grid">
      <Grid.Item span={{ base: 12, md: 8 }} testID="main">
        <Text>Main</Text>
      </Grid.Item>
      <Grid.Item span={{ md: 4 }} offset={{ lg: 0 }} testID="side">
        <Text>Side</Text>
      </Grid.Item>
      <Grid.Item span={6} offset={3} testID="offset">
        <Text>Offset</Text>
      </Grid.Item>
      <Text testID="plain">Plain</Text>
    </Grid>
  )

  afterEach(async () => {
    await resize(phone.width)
  })

  it('stacks 8 / 4 below md (the mocked phone is 750 wide)', async () => {
    expect(phone.width).toBeLessThan(768)
    await renderNative(layout())
    expect(style('main').width).toBe('100%')
    expect(style('side').width).toBe('100%')
    // A plain child keeps its one-column cell.
    expect(StyleSheet.flatten(screen.getByTestId('plain').parent?.props.style).width).toBe(
      `${100 / 12}%`,
    )
  })

  it('splits 8 / 4 from md, with no extra wrapper around an item', async () => {
    await resize(1024)
    await renderNative(layout())
    expect(style('main').width).toBe('66.66666666666667%')
    expect(style('side').width).toBe('33.333333333333336%')
    expect(screen.getByTestId('main').parent).toBe(screen.getByTestId('grid'))
    // Half the $4 gap (16) on each side of the cell, and pulled back on the grid.
    expect(style('main')).toMatchObject({ paddingLeft: 8, paddingRight: 8 })
    expect(style('grid')).toMatchObject({ marginLeft: -8, marginRight: -8, rowGap: 16 })
  })

  it('offsets with marginStart, which React Native mirrors in RTL', async () => {
    await renderNative(layout())
    expect(style('offset')).toMatchObject({ width: '50%', marginStart: '25%' })
  })
})

// The responsive layout props are media props underneath, so on native they
// follow the window size like Grid's spans.
describe('responsive layout props', () => {
  const phone = Dimensions.get('window')
  const resize = async (width: number) => {
    await act(async () => {
      Dimensions.set({ window: { ...phone, width }, screen: { ...phone, width } })
    })
  }
  const style = (testID: string) => StyleSheet.flatten(screen.getByTestId(testID).props.style)

  afterEach(async () => {
    await resize(phone.width)
  })

  const responsiveStack = (
    <Stack testID="stack" direction={{ base: 'column', md: 'row' }} align="center" />
  )

  it('lays a Stack out as a column below md', async () => {
    await renderNative(responsiveStack)
    expect(style('stack')).toMatchObject({ flexDirection: 'column', alignItems: 'center' })
  })

  it('lays the same Stack out as a row from md', async () => {
    await resize(1024)
    await renderNative(responsiveStack)
    expect(style('stack')).toMatchObject({ flexDirection: 'row', alignItems: 'center' })
  })

  it('lets raw style props win over the responsive ones, in either order', async () => {
    await resize(1024)
    await renderNative(
      <>
        <Stack testID="before" flexDirection="column-reverse" direction="row" />
        <Stack testID="after" direction="row" flexDirection="column-reverse" />
        <Stack
          testID="media"
          direction={{ base: 'column', md: 'row' }}
          flexDirection="md:row-reverse"
        />
        <HStack testID="hstack" direction="column" distribute="between" />
      </>,
    )
    expect(style('before').flexDirection).toBe('column-reverse')
    expect(style('after').flexDirection).toBe('column-reverse')
    expect(style('media').flexDirection).toBe('row-reverse')
    expect(style('hstack')).toMatchObject({
      flexDirection: 'column',
      justifyContent: 'space-between',
    })
  })

  it('wraps a Wrap row of chips', async () => {
    await renderNative(<Wrap testID="wrap" distribute="center" />)
    expect(style('wrap')).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    })
  })

  it('pads a Container by its gutter, and by default as before', async () => {
    await resize(1024)
    await renderNative(
      <>
        <Container testID="default" />
        <Container testID="flush" gutter="0" centerContent />
      </>,
    )
    expect(style('default')).toMatchObject({ paddingLeft: 32, paddingRight: 32 })
    expect(style('flush')).toMatchObject({ paddingLeft: 0, paddingRight: 0, alignItems: 'center' })
  })

  it('reads a labelled separator as its label', async () => {
    await renderNative(
      <>
        <Separator label="or" />
        <Separator label="Continue with" decorative={false} testID="named" />
      </>,
    )
    expect(screen.getByText('or')).toBeTruthy()
    const named = screen.getByTestId('named')
    expect(named.props.accessible).toBe(true)
    expect(named.props['aria-label'] ?? named.props.accessibilityLabel).toBe('Continue with')
  })
})

// Show / Hide read the window size on native and leave hidden content out.
describe('Show, Hide, Section and Sticky on native', () => {
  const phone = Dimensions.get('window')
  const resize = async (width: number) => {
    await act(async () => {
      Dimensions.set({ window: { ...phone, width }, screen: { ...phone, width } })
    })
  }
  function Probe() {
    return <Text>{`at ${useBreakpoint()}`}</Text>
  }
  const layout = () => (
    <>
      <Show above="md">
        <Text>desktop nav</Text>
      </Show>
      <Show below="md">
        <Text>menu button</Text>
      </Show>
      <Hide below="sm">
        <Text>search</Text>
      </Hide>
      <Probe />
    </>
  )

  afterEach(async () => {
    await resize(phone.width)
  })

  it('renders only what fits a phone (the mocked one is 750 wide)', async () => {
    await renderNative(layout())
    expect(screen.queryByText('desktop nav')).toBeNull()
    expect(screen.getByText('menu button')).toBeTruthy()
    expect(screen.getByText('search')).toBeTruthy()
    expect(screen.getByText('at sm')).toBeTruthy()
  })

  it('unmounts the phone content and mounts the desktop content from md', async () => {
    await resize(1024)
    await renderNative(layout())
    expect(screen.getByText('desktop nav')).toBeTruthy()
    expect(screen.queryByText('menu button')).toBeNull()
    expect(screen.getByText('at lg')).toBeTruthy()
  })

  it('hides content below sm on a narrow phone', async () => {
    await resize(400)
    await renderNative(layout())
    expect(screen.queryByText('search')).toBeNull()
    expect(screen.getByText('at base')).toBeTruthy()
  })

  it('reads text on a primary Section in the sub-theme colors', async () => {
    const theme = createThemeColors(themePresets.indigo.colors).light_primary
    await renderNative(
      <Section background="primary" aria-label="Newsletter" testID="band">
        <Text>Subscribe</Text>
      </Section>,
    )
    const style = StyleSheet.flatten(screen.getByText('Subscribe').props.style)
    expect(String(style.color).toLowerCase()).toBe(theme.foreground.toLowerCase())
    expect(
      String(
        StyleSheet.flatten(screen.getByTestId('band').props.style).backgroundColor,
      ).toLowerCase(),
    ).toBe(theme.background.toLowerCase())
  })

  it('pins top Stickys in a ScrollArea, looking through fragments', async () => {
    await renderNative(
      <ScrollArea aria-label="Townships" height={300}>
        <VStack padding="4" gap="2">
          {['Kachin', 'Shan'].map((region) => (
            <Fragment key={region}>
              <Sticky>
                <Text>{region}</Text>
              </Sticky>
              <Text>{`${region} township`}</Text>
            </Fragment>
          ))}
        </VStack>
      </ScrollArea>,
    )
    const scroll = screen.getByLabelText('Townships')
    expect(scroll.props.stickyHeaderIndices).toEqual([0, 2])
    // The VStack's padding and gap now style the scroll content.
    expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toMatchObject({
      paddingTop: 16,
      gap: 8,
    })
    expect(screen.getByText('Shan township')).toBeTruthy()
  })

  it('leaves a ScrollArea without Stickys as it was', async () => {
    await renderNative(
      <ScrollArea aria-label="Plain" height={300}>
        <VStack padding="4">
          <Text>Row</Text>
        </VStack>
      </ScrollArea>,
    )
    const plain = screen.getByLabelText('Plain')
    expect(plain.props.stickyHeaderIndices).toBeUndefined()
    // Android: it scrolls inside a scrolling screen.
    expect(plain.props.nestedScrollEnabled).toBe(true)
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

describe('AppShell and AutoGrid on native', () => {
  const phone = Dimensions.get('window')
  const resize = async (width: number) => {
    await act(async () => {
      Dimensions.set({ window: { ...phone, width }, screen: { ...phone, width } })
    })
  }
  const shell = (props: { onSidebarOpenChange?: (open: boolean) => void; onPage?: () => void }) => (
    <AppShell onSidebarOpenChange={props.onSidebarOpenChange}>
      <AppShell.Header>
        <AppShell.SidebarTrigger />
        <Text>Adv Data</Text>
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Main">
        <Sidebar>
          <Sidebar.Group label="Workspace">
            <Sidebar.Item onPress={props.onPage}>Reports</Sidebar.Item>
          </Sidebar.Group>
        </Sidebar>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Text>Overview</Text>
      </AppShell.Main>
    </AppShell>
  )

  afterEach(async () => {
    await resize(phone.width)
  })

  it('opens the sidebar in a drawer on a phone, and an item closes it', async () => {
    const onSidebarOpenChange = jest.fn()
    const onPage = jest.fn()
    await renderNative(shell({ onSidebarOpenChange, onPage }))
    expect(screen.getByText('Overview')).toBeOnTheScreen()
    // Below md (the mocked phone is 750 wide) the side area is not mounted.
    expect(screen.queryByText('Reports')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Open navigation' }))
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(true)
    await fireEvent.press(await screen.findByRole('link', { name: 'Reports' }))
    expect(onPage).toHaveBeenCalledTimes(1)
    expect(onSidebarOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('shows the sidebar beside Main from md, with no trigger', async () => {
    await resize(1024)
    await renderNative(shell({}))
    expect(screen.getByRole('link', { name: 'Reports' })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull()
  })

  it('pads the safe areas, except with safeArea={false}; the drawer always does', async () => {
    const padding = (testID: string) => {
      // The open drawer hides the screen behind it from screen readers.
      const style = StyleSheet.flatten(
        screen.getByTestId(testID, { includeHiddenElements: true }).props.style,
      )
      return { top: style.paddingTop, bottom: style.paddingBottom }
    }
    const drawerPadding = async () => {
      let node = (await screen.findByText('Reports')).parent
      while (node && node.props.role !== 'dialog') node = node.parent
      const style = StyleSheet.flatten(node?.props.style)
      return { top: style.paddingTop, bottom: style.paddingBottom }
    }
    const app = (safeArea: boolean) => (
      <UniversalProvider
        config={createUniversalConfig()}
        toaster={false}
        insets={{ top: 40, bottom: 30, left: 0, right: 0 }}
      >
        <AppShell safeArea={safeArea} defaultSidebarOpen>
          <AppShell.Header testID="header">
            <Text>Adv Data</Text>
          </AppShell.Header>
          <AppShell.Sidebar aria-label="Main">
            <Text>Reports</Text>
          </AppShell.Sidebar>
          <AppShell.Main>
            <Text>Overview</Text>
          </AppShell.Main>
          <AppShell.Footer testID="footer">
            <Text>Synced</Text>
          </AppShell.Footer>
        </AppShell>
      </UniversalProvider>
    )
    const view = await render(app(true))
    expect(padding('header').top).toBe(40)
    expect(padding('footer').bottom).toBe(30)
    expect(await drawerPadding()).toEqual({ top: 40, bottom: 30 })
    await view.rerender(app(false))
    expect(padding('header').top).not.toBe(40)
    expect(padding('footer').bottom).not.toBe(30)
    expect(await drawerPadding()).toEqual({ top: 40, bottom: 30 })
  })

  it('AutoGrid shows one column until it is measured, then the same count as web', async () => {
    await renderNative(
      <AutoGrid testID="grid" minChildWidth={240} gap="4">
        {['A', 'B', 'C', 'D'].map((name) => (
          <Text key={name} testID={name}>
            {name}
          </Text>
        ))}
      </AutoGrid>,
    )
    const cell = () => StyleSheet.flatten(screen.getByTestId('A').parent?.props.style)
    expect(cell().width).toBe('100%')
    await fireEvent(screen.getByTestId('grid'), 'layout', {
      nativeEvent: { layout: { width: 1000, height: 400, x: 0, y: 0 } },
    })
    // 3 columns of (1000 - 2 × 16) / 3, as web's CSS grid would pick.
    expect(autoGridColumns(1000, 240, 16)).toBe(3)
    expect(cell().width).toBe(322)
    expect(StyleSheet.flatten(screen.getByTestId('grid').props.style)).toMatchObject({
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    })
  })
})

describe('Keyboard avoidance on native', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  /** The host ScrollView around a text. */
  const scrollViewOf = (text: string) => {
    let node = screen.getByText(text).parent
    while (node && node.props.nestedScrollEnabled === undefined) node = node.parent
    if (!node) throw new Error(`no scroll view around ${text}`)
    return node
  }

  it('ScrollArea avoidKeyboard lets iOS inset it; one inside it leaves that to the outer one', async () => {
    await renderNative(
      <>
        <ScrollArea aria-label="Profile" avoidKeyboard>
          <VStack>
            <Text>Name</Text>
            <ScrollArea aria-label="Notes" avoidKeyboard height={120}>
              <Text>Note</Text>
            </ScrollArea>
          </VStack>
        </ScrollArea>
        <ScrollArea aria-label="Feed">
          <Text>Post</Text>
        </ScrollArea>
      </>,
    )
    const profile = screen.getByLabelText('Profile')
    expect(profile.props.automaticallyAdjustKeyboardInsets).toBe(true)
    // A tap on a button while the keyboard is up presses it.
    expect(profile.props.keyboardShouldPersistTaps).toBe('handled')
    expect(screen.getByLabelText('Notes').props.automaticallyAdjustKeyboardInsets).toBeUndefined()
    expect(screen.getByLabelText('Feed').props.automaticallyAdjustKeyboardInsets).toBeUndefined()
    expect(screen.getByLabelText('Feed').props.keyboardShouldPersistTaps).toBeUndefined()
  })

  it('on Android, a ScrollArea ends where the keyboard starts, measured from the root view', async () => {
    jest.replaceProperty(Platform, 'OS', 'android')
    const listeners = new Map<string, (event: unknown) => void>()
    jest.spyOn(Keyboard, 'addListener').mockImplementation((event, listener) => {
      listeners.set(event, listener as (event: unknown) => void)
      return { remove: () => void listeners.delete(event) } as never
    })
    jest.spyOn(Keyboard, 'metrics').mockReturnValue(undefined)
    const ref = createRef<{ measure: unknown }>()
    await renderNative(
      <ScrollArea ref={ref as never} aria-label="Profile" avoidKeyboard>
        <Text>Name</Text>
      </ScrollArea>,
    )
    const margin = () =>
      StyleSheet.flatten(screen.getByLabelText('Profile').props.style)?.marginBottom ?? 0
    // Below a 100px header, 700 high until the margin shortens it.
    const node = ref.current
    if (!node) throw new Error('no scroll view')
    node.measure = (done: (...box: number[]) => void) =>
      done(0, 100, 400, 700 - Number(margin()), 0, 100)
    const keyboard = async (event: string, screenY?: number) => {
      await act(async () => {
        listeners.get(event)?.({ endCoordinates: { screenX: 0, screenY, width: 400, height: 0 } })
      })
    }
    await keyboard('keyboardDidShow', 500)
    expect(margin()).toBe(300)
    // The emoji panel makes the keyboard taller; the view's bottom is still 800.
    await keyboard('keyboardDidShow', 450)
    expect(margin()).toBe(350)
    await keyboard('keyboardDidHide')
    expect(margin()).toBe(0)
  })

  it('AppShell.Main avoids the keyboard unless turned off, and a ScrollArea in it leaves it to Main', async () => {
    await renderNative(
      <>
        <AppShell>
          <AppShell.Main>
            <Text>Checkout</Text>
            <ScrollArea aria-label="Items" avoidKeyboard height={120}>
              <Text>Item</Text>
            </ScrollArea>
          </AppShell.Main>
        </AppShell>
        <AppShell avoidKeyboard={false}>
          <AppShell.Main>
            <Text>Reports</Text>
          </AppShell.Main>
        </AppShell>
      </>,
    )
    expect(scrollViewOf('Checkout').props.automaticallyAdjustKeyboardInsets).toBe(true)
    expect(scrollViewOf('Checkout').props.keyboardShouldPersistTaps).toBe('handled')
    expect(screen.getByLabelText('Items').props.automaticallyAdjustKeyboardInsets).toBeUndefined()
    expect(scrollViewOf('Reports').props.automaticallyAdjustKeyboardInsets).toBeUndefined()
  })
})

describe('Android back button', () => {
  // Each overlay starts open; back must close it instead of leaving the screen.
  const overlays: [string, (onOpenChange: (open: boolean) => void) => ReactElement][] = [
    [
      'AppShell drawer',
      (onOpenChange) => (
        <AppShell defaultSidebarOpen onSidebarOpenChange={onOpenChange}>
          <AppShell.Sidebar aria-label="Main">
            <Text>Reports</Text>
          </AppShell.Sidebar>
          <AppShell.Main>
            <Text>Overview</Text>
          </AppShell.Main>
        </AppShell>
      ),
    ],
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
      'ConfirmDialog',
      (onOpenChange) => (
        <ConfirmDialog defaultOpen onOpenChange={onOpenChange} title="Delete Atlas?" />
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
      'Menubar',
      (onOpenChange) => (
        <Menubar defaultValue="file" onValueChange={(value) => onOpenChange(value !== null)}>
          <Menubar.Menu value="file">
            <Menubar.Trigger>File</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>New file</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>
          <Menubar.Menu value="edit">
            <Menubar.Trigger>Edit</Menubar.Trigger>
            <Menubar.Content>
              <Menubar.Item>Undo</Menubar.Item>
            </Menubar.Content>
          </Menubar.Menu>
        </Menubar>
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
    [
      'Tour',
      (onOpenChange) => (
        <Tour defaultOpen onOpenChange={onOpenChange} steps={[{ title: 'Welcome' }]} />
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

  it('keeps a ConfirmDialog open while onConfirm runs', async () => {
    const back = fakeBackHandler()
    const onOpenChange = jest.fn()
    await renderNative(
      <ConfirmDialog
        defaultOpen
        onOpenChange={onOpenChange}
        title="Delete Atlas?"
        confirmLabel="Delete"
        onConfirm={() => new Promise(() => {})}
      />,
    )
    await fireEvent.press(await screen.findByRole('button', { name: 'Delete' }))
    // Handled, so the screen stays, but the dialog does not close mid-request.
    expect(await back.press()).toBe(true)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByText('Delete Atlas?')).toBeOnTheScreen()
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
