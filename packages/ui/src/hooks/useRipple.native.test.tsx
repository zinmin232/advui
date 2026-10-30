import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { createUniversalConfig, getUniversalSettings } from '@advui/theme'
import type { ReactElement } from 'react'
import { Platform, StyleSheet, processColor } from 'react-native'
import { View } from 'tamagui/unstyled'
import { BellIcon, HomeIcon, PlusIcon, SearchIcon } from '@advui/icons'
import { Accordion } from '../components/accordion/Accordion'
import { Button } from '../components/button/Button'
import { ButtonGroup } from '../components/button-group/ButtonGroup'
import { Card } from '../components/card/Card'
import { Chip } from '../components/chip/Chip'
import { Fab } from '../components/fab/Fab'
import { IconButton } from '../components/icon-button/IconButton'
import { Indicator } from '../components/indicator/Indicator'
import { ListItem } from '../components/list-item/ListItem'
import { NavigationBar } from '../components/navigation-bar/NavigationBar'
import { Snackbar } from '../components/snackbar/Snackbar'
import { Tabs } from '../components/tabs/Tabs'
import { Toaster, toast } from '../components/toast/Toaster'
import { Toggle } from '../components/toggle/Toggle'
import { ToggleGroup } from '../components/toggle-group/ToggleGroup'
import { UniversalProvider } from '../provider/UniversalProvider'
import { touchAt } from '../../test/native-utils'
import { type RippleOptions, useRipple } from './useRipple'

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

type Node = ReturnType<typeof screen.getByRole>

// The native view around this one: a ripple's clip, or the clip's pressable.
function hostParent(node: Node | undefined) {
  let parent = node?.parent
  while (parent && typeof parent.type !== 'string') parent = parent.parent
  if (!parent) throw new Error('No host parent')
  return parent
}

const style = (node: Node) => StyleSheet.flatten(node.props.style) ?? {}

// Top left, top right, bottom right, bottom left.
function corners(node: Node) {
  const { borderRadius = 0, ...rest } = style(node) as Record<string, number | undefined>
  return ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(
    (corner) => rest[`border${corner}Radius`] ?? borderRadius,
  )
}

function OwnPressable({ radius }: Pick<RippleOptions, 'radius'>) {
  const ripple = useRipple({ color: 'foreground', radius })
  return (
    <View role="button" aria-label="Open" onPress={() => {}} {...ripple.props}>
      {ripple.element}
    </View>
  )
}

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
    // Its clip takes no touches and hides it from screen readers.
    const clip = hostParent(ripple)
    expect(clip.props.importantForAccessibility).toBe('no-hide-descendants')
    expect(clip.props.pointerEvents ?? style(clip).pointerEvents).toBe('none')
  })

  // Indicator's "Counts on icon buttons": the count hangs over the corner.
  it('clips the ripple to the corners, not the content', async () => {
    await renderWithRipple(
      <IconButton
        circular
        aria-label="Notifications, 3 unread"
        icon={
          <Indicator count={3} size="sm">
            <BellIcon />
          </Indicator>
        }
      />,
    )
    const button = screen.getByRole('button', { name: 'Notifications, 3 unread' })
    const clip = hostParent(ripples()[0])
    expect(hostParent(clip)).toBe(button)
    expect(style(clip).overflow).toBe('hidden')
    expect(corners(clip)).toEqual([9999, 9999, 9999, 9999])
    expect(style(button).overflow).not.toBe('hidden')
  })

  it('takes the corners from a radius or from props that set them', async () => {
    const { rerender } = await renderWithRipple(<OwnPressable />)
    expect(corners(hostParent(ripples()[0]))).toEqual([0, 0, 0, 0])

    const md = config.tokens.radius.md.val as number
    await rerender(
      <UniversalProvider config={config} colorMode="light" toaster={false}>
        <OwnPressable radius="md" />
      </UniversalProvider>,
    )
    expect(corners(hostParent(ripples()[0]))).toEqual([md, md, md, md])

    // Only the corners of an element's props, here the end of a joined group.
    await rerender(
      <UniversalProvider config={config} colorMode="light" toaster={false}>
        <OwnPressable
          radius={
            {
              borderRadius: 'md',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              padding: '4',
            } as RippleOptions['radius']
          }
        />
      </UniversalProvider>,
    )
    const clip = hostParent(ripples()[0])
    expect(corners(clip)).toEqual([0, md, md, 0])
    expect(style(clip).padding).toBeUndefined()
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
    await fireEvent(button, 'responderGrant', touchAt(12, 8))
    expect(mockCommands).toEqual([
      ['hotspotUpdate', [12, 8]],
      ['setPressed', [true]],
    ])
    // Your own handlers still run.
    expect(onPressIn).toHaveBeenCalledTimes(1)

    // The ripple is the pressed state, so the fill does not darken as well.
    const fill = StyleSheet.flatten(button.props.style).backgroundColor
    expect(processColor(fill)).toBe(processColor(light.primary?.val))

    await fireEvent(button, 'responderRelease', touchAt(12, 8, { lifted: true }))
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

  const pressables: Array<[string, ReactElement, number]> = [
    ['IconButton', <IconButton key="c" aria-label="Add" icon={<PlusIcon />} />, 1],
    [
      'large pill Button',
      <Button key="c" size="lg" borderRadius="full">
        Save
      </Button>,
      1,
    ],
    [
      'attached ButtonGroup',
      <ButtonGroup key="c" aria-label="Pages">
        <Button>Back</Button>
        <Button>Next</Button>
      </ButtonGroup>,
      2,
    ],
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
    ['extended Fab', <Fab key="c" size="lg" icon={<PlusIcon />} label="Compose" />, 1],
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
      'underline Tabs',
      <Tabs key="c" defaultValue="a" variant="underline">
        <Tabs.List aria-label="Sections">
          <Tabs.Trigger value="a">A</Tabs.Trigger>
        </Tabs.List>
      </Tabs>,
      1,
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
    ['List Item', <ListItem key="c" title="Inbox" onPress={() => {}} />, 1],
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
  ]

  it.each(pressables)('%s has a ripple on each pressable part', async (_name, ui, count) => {
    await renderWithRipple(ui)
    expect(ripples()).toHaveLength(count)
  })

  // Navigation Bar's ripple is in the indicator's pill, below.
  it.each(pressables.filter(([name]) => name !== 'NavigationBar'))(
    '%s keeps the ripple in its corners',
    async (_name, ui) => {
      await renderWithRipple(ui)
      for (const ripple of ripples()) {
        const clip = hostParent(ripple)
        expect(corners(clip)).toEqual(corners(hostParent(clip)))
      }
    },
  )

  it('Navigation Bar draws the ripple in the pill behind the icon', async () => {
    await renderWithRipple(
      <NavigationBar defaultValue="home">
        <NavigationBar.Item value="home" icon={<HomeIcon />} label="Home" />
      </NavigationBar>,
    )
    const clip = hostParent(ripples()[0])
    expect(corners(clip)).toEqual([9999, 9999, 9999, 9999])
    expect(hostParent(clip)).not.toBe(screen.getByRole('tab'))
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
