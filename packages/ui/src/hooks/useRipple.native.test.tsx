import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { createUniversalConfig, getUniversalSettings } from '@advui/theme'
import type { ReactElement } from 'react'
import { Platform, StyleSheet, processColor } from 'react-native'
import { HomeIcon, PlusIcon, SearchIcon } from '@advui/icons'
import { Accordion } from '../components/accordion/Accordion'
import { Button } from '../components/button/Button'
import { Card } from '../components/card/Card'
import { Chip } from '../components/chip/Chip'
import { Fab } from '../components/fab/Fab'
import { IconButton } from '../components/icon-button/IconButton'
import { NavigationBar } from '../components/navigation-bar/NavigationBar'
import { Snackbar } from '../components/snackbar/Snackbar'
import { Tabs } from '../components/tabs/Tabs'
import { Toaster, toast } from '../components/toast/Toaster'
import { Toggle } from '../components/toggle/Toggle'
import { ToggleGroup } from '../components/toggle-group/ToggleGroup'
import { UniversalProvider } from '../provider/UniversalProvider'

// Records the view commands the ripple sends (hotspotUpdate, setPressed).
const mockCommands: Array<[string, unknown[]]> = []
jest.mock('react-native/Libraries/Utilities/codegenNativeCommands', () => ({
  __esModule: true,
  default: ({ supportedCommands }: { supportedCommands: string[] }) =>
    Object.fromEntries(
      supportedCommands.map((name) => [
        name,
        (_view: unknown, ...args: unknown[]) => mockCommands.push([name, args]),
      ]),
    ),
}))

const config = createUniversalConfig({ androidRipple: true })
const light = config.themes.light as unknown as Record<string, { val: string }>

async function renderWithRipple(ui: ReactElement) {
  return await render(
    <UniversalProvider config={config} colorMode="light" toaster={false}>
      {ui}
    </UniversalProvider>,
  )
}

const ripples = () =>
  screen.container.queryAll((node) => node.props.nativeBackgroundAndroid !== undefined)

const grant = (pageX: number, pageY: number) => ({
  nativeEvent: {
    pageX,
    pageY,
    locationX: pageX,
    locationY: pageY,
    touches: [],
    changedTouches: [],
  },
  touchHistory: { touchBank: [] },
})

describe('useRipple', () => {
  beforeEach(() => {
    mockCommands.length = 0
    jest.replaceProperty(Platform, 'OS', 'android')
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('draws the native ripple in a pressable, hidden from screen readers', async () => {
    await renderWithRipple(<Button>Save</Button>)
    const [ripple] = ripples()
    expect(ripple?.props.nativeBackgroundAndroid).toMatchObject({
      type: 'RippleAndroid',
      borderless: false,
      alpha: 0.2,
    })
    expect(ripple?.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(ripple?.props.pointerEvents).toBe('none')
    // The button clips it to its rounded corners.
    expect(StyleSheet.flatten(screen.getByRole('button').props.style)).toMatchObject({
      overflow: 'hidden',
    })
  })

  it('starts the ripple where the finger lands and ends it on release', async () => {
    const onPressIn = jest.fn()
    const onPress = jest.fn()
    await renderWithRipple(
      <Button onPressIn={onPressIn} onPress={onPress}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Save' })
    await fireEvent(button, 'responderGrant', grant(12, 8))
    expect(mockCommands).toEqual([
      ['hotspotUpdate', [12, 8]],
      ['setPressed', [true]],
    ])
    // Your own handlers still run.
    expect(onPressIn).toHaveBeenCalledTimes(1)

    // The ripple is the pressed state, so the fill does not darken as well.
    const fill = StyleSheet.flatten(button.props.style).backgroundColor
    expect(processColor(fill)).toBe(processColor(light.primary?.val))

    await fireEvent(button, 'responderRelease', grant(12, 8))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(mockCommands.at(-1)).toEqual(['setPressed', [false]])
  })

  it('is off for disabled buttons and links', async () => {
    await renderWithRipple(
      <>
        <Button disabled>Save</Button>
        <Button variant="link">Terms</Button>
      </>,
    )
    expect(ripples()).toHaveLength(0)
  })

  it.each<[string, ReactElement, number]>([
    ['IconButton', <IconButton key="c" aria-label="Add" icon={<PlusIcon />} />, 1],
    ['Toggle', <Toggle key="c">Bold</Toggle>, 1],
    [
      'ToggleGroup',
      <ToggleGroup key="c" type="single" defaultValue="left">
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </ToggleGroup>,
      2,
    ],
    ['Fab', <Fab key="c" icon={<PlusIcon />} aria-label="New" />, 1],
    [
      'filter Chip',
      <Chip key="c" defaultSelected={false}>
        Vegan
      </Chip>,
      1,
    ],
    // A plain chip is not pressable; an input chip ripples on its remove button.
    ['plain Chip', <Chip key="c">Draft</Chip>, 0],
    [
      'input Chip',
      <Chip key="c" onRemove={() => {}}>
        Ada
      </Chip>,
      1,
    ],
    [
      'NavigationBar',
      <NavigationBar key="c" defaultValue="home">
        <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
        <NavigationBar.Item value="search" icon={<SearchIcon />} label="Search" />
      </NavigationBar>,
      2,
    ],
    [
      'Tabs',
      <Tabs key="c" defaultValue="a">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
      </Tabs>,
      2,
    ],
    [
      'Accordion',
      <Accordion key="c" type="single" collapsible>
        <Accordion.Item value="one">
          <Accordion.Trigger>Shipping</Accordion.Trigger>
          <Accordion.Content>Three to five days</Accordion.Content>
        </Accordion.Item>
      </Accordion>,
      1,
    ],
    [
      'interactive Card',
      <Card key="c" interactive role="button" aria-label="Open" onPress={() => {}} />,
      1,
    ],
    ['static Card', <Card key="c" />, 0],
    [
      'Snackbar',
      <Snackbar
        key="c"
        open
        onOpenChange={() => {}}
        duration={null}
        action={{ label: 'Undo', onPress: () => {} }}
      >
        Archived
      </Snackbar>,
      2,
    ],
  ])('%s has a ripple on each pressable part', async (_name, ui, count) => {
    await renderWithRipple(ui)
    expect(ripples()).toHaveLength(count)
  })

  it('is off on iOS and when the config does not ask for it', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    const { unmount } = await renderWithRipple(<Button>Save</Button>)
    expect(ripples()).toHaveLength(0)
    await unmount()

    jest.replaceProperty(Platform, 'OS', 'android')
    jest.replaceProperty(getUniversalSettings(config), 'androidRipple', false)
    await renderWithRipple(<Button>Save</Button>)
    expect(ripples()).toHaveLength(0)
  })

  it('reaches toasts, which render in a portal', async () => {
    jest.useFakeTimers()
    await render(
      <UniversalProvider config={config} colorMode="light" toaster={false}>
        <Toaster />
      </UniversalProvider>,
    )
    await act(async () => {
      toast('Archived', { action: { label: 'Undo', onClick: () => {} } })
    })
    // The action and the dismiss button.
    expect(ripples()).toHaveLength(2)
    await act(async () => {
      toast.dismiss()
      jest.runAllTimers()
    })
    jest.useRealTimers()
  })
})
