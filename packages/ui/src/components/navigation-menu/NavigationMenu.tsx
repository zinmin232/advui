import { ChevronDownIcon, IconDefaults } from '@advui/icons'
import { shadows, zIndex } from '@advui/theme'
import {
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

const linkReset = { textDecoration: 'none', textAlign: 'start' } as const

interface MenuContextValue {
  open: string | null
  setOpen: (value: string | null) => void
}

const MenuContext = createContext<MenuContextValue>({ open: null, setOpen: () => {} })
// Links inside a panel are drawn as blocks with a description.
const InPanel = createContext(false)

const focusRing = {
  outlineColor: '$ring',
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
} as const

const TopLevelFrame = styled(View, {
  name: 'NavigationMenuTrigger',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$1',
  height: '$9',
  paddingHorizontal: '$3',
  borderRadius: '$md',
  borderWidth: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: focusRing,

  variants: {
    active: {
      true: { backgroundColor: '$accent' },
    },
  } as const,
})

const PanelLinkFrame = styled(View, {
  name: 'NavigationMenuPanelLink',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '$3',
  padding: '$3',
  borderRadius: '$md',
  borderWidth: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: { ...focusRing, outlineOffset: -2 },

  variants: {
    active: {
      true: { backgroundColor: '$accent' },
    },
  } as const,
})

const PanelFrame = styled(View, {
  name: 'NavigationMenuPanel',
  backgroundColor: '$popover',
  borderWidth: 1,
  borderColor: '$border',
  borderRadius: '$lg',
  padding: '$2',
  gap: '$1',
})

export interface NavigationMenuProps extends Omit<GetProps<typeof View>, 'children'> {
  /** `NavigationMenu.Link` and `NavigationMenu.Item` elements. */
  children: ReactNode
  /** Names the navigation landmark. Default: "Main". */
  'aria-label'?: string
  /** The open item's `value` (controlled). */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

function NavigationMenuRoot({
  children,
  'aria-label': ariaLabel = 'Main',
  value,
  defaultValue = null,
  onValueChange,
  ...props
}: NavigationMenuProps) {
  const [open, setOpen] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const rootRef = useRef<HTMLElement>(null)
  useBackToClose(open !== null, () => setOpen(null))

  // Web: a press outside the menu, or focus moving out of it, closes the panel.
  useEffect(() => {
    if (!isWeb || open === null) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null)
    }
    const onFocusIn = (event: FocusEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('focusin', onFocusIn)
    }
  }, [open, setOpen])

  // Native has no floating panel: the open item's links show under the bar.
  const openItem = !isWeb
    ? (Children.toArray(children).find(
        (child) =>
          isValidElement(child) &&
          child.type === NavigationMenuItem &&
          itemValue(child.props as NavigationMenuItemProps) === open,
      ) as ReactElement<NavigationMenuItemProps> | undefined)
    : undefined

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <View
        ref={rootRef as never}
        render="nav"
        aria-label={ariaLabel}
        {...(!isWeb && { role: 'navigation' })}
        {...props}
      >
        <View
          render="ul"
          flexDirection="row"
          flexWrap="wrap"
          alignItems="center"
          gap="$1"
          margin={0}
          padding={0}
        >
          {children}
        </View>
        {openItem ? (
          <PanelFrame marginTop="$2">
            <InPanel.Provider value>{openItem.props.children}</InPanel.Provider>
          </PanelFrame>
        ) : null}
      </View>
    </MenuContext.Provider>
  )
}

export interface NavigationMenuLinkProps extends Omit<
  GetProps<typeof View>,
  'children' | 'render'
> {
  children: ReactNode
  /** Link target on web. On iOS/Android pass `onPress` (e.g. `router.push`). */
  href?: string
  /** Render your router's link instead of `<a>`, e.g. `render={<Link href="/maps" />}`. */
  render?: GetProps<typeof View>['render']
  /** The current page: `aria-current="page"`. */
  active?: boolean
  /** Second line, shown in panels. */
  description?: ReactNode
  /** Icon before the title, shown in panels. */
  icon?: ReactNode
}

/** A link in the bar, or inside an item's panel (with a description and icon). */
const NavigationMenuLink = forwardRef<TamaguiElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(
    { children, href, render, active = false, description, icon, onPress, ...props },
    ref,
  ) {
    const inPanel = useContext(InPanel)
    const { setOpen } = useContext(MenuContext)
    const ripple = useRipple({ color: '$foreground' })
    const Frame = inPanel ? PanelLinkFrame : TopLevelFrame
    const title = (
      <Text size="sm" weight="medium" color="$foreground">
        {children}
      </Text>
    )
    return (
      <View render="li" {...(inPanel && { flexDirection: 'column' })}>
        <Frame
          ref={ref}
          active={active}
          render={render ?? (href !== undefined ? 'a' : 'button')}
          {...(href !== undefined && { href })}
          role="link"
          // Web: an <a> underlines its text and a <button> centers it; links here do neither.
          {...(isWeb && { style: linkReset })}
          {...(isWeb
            ? { 'aria-current': active ? ('page' as const) : undefined }
            : {
                accessible: true,
                // Native has no aria-current; say it in the name instead.
                ...(active &&
                  isTextContent(children) && {
                    'aria-label': `${[children].flat().join('')}, current page`,
                  }),
              })}
          onPress={(event) => {
            onPress?.(event)
            // Following a link closes the panel it was in.
            setOpen(null)
          }}
          {...props}
          {...ripple.props}
        >
          {ripple.element}
          {inPanel ? (
            <>
              {icon ? (
                <View aria-hidden paddingTop="$0.5">
                  <IconDefaults size={16} color="$mutedForeground">
                    {icon}
                  </IconDefaults>
                </View>
              ) : null}
              <View flex={1} minWidth={0} gap="$0.5">
                {title}
                {description != null ? (
                  <Text size="xs" tone="muted">
                    {description}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            title
          )}
        </Frame>
      </View>
    )
  },
)

export interface NavigationMenuItemProps {
  /** Trigger text. */
  label: string
  /** Identifies the item for `value` / `onValueChange`. Default: `label`. */
  value?: string
  /** `NavigationMenu.Link` elements shown in the panel. */
  children: ReactNode
  /** Panel width on web (a size token or number). Default: `$72`. */
  panelWidth?: GetProps<typeof View>['width']
}

const itemValue = (props: NavigationMenuItemProps) => props.value ?? props.label

/** A button in the bar that opens a panel of links. */
function NavigationMenuItem(props: NavigationMenuItemProps) {
  const { label, children, panelWidth = '$72' } = props
  const value = itemValue(props)
  const { open, setOpen } = useContext(MenuContext)
  const isOpen = open === value
  const panelId = useId()
  const triggerRef = useRef<HTMLElement>(null)
  const ripple = useRipple({ color: '$foreground' })

  const close = () => {
    setOpen(null)
    triggerRef.current?.focus()
  }

  return (
    <View
      render="li"
      position="relative"
      {...(isWeb && {
        onKeyDown: (event: { key: string; preventDefault: () => void }) => {
          if (event.key === 'Escape' && isOpen) {
            event.preventDefault()
            close()
          }
        },
      })}
    >
      <TopLevelFrame
        ref={triggerRef as never}
        active={isOpen}
        {...(isWeb
          ? { render: 'button', type: 'button', 'aria-controls': panelId }
          : { accessible: true, role: 'button' })}
        aria-expanded={isOpen}
        onPress={() => setOpen(isOpen ? null : value)}
        {...ripple.props}
      >
        {ripple.element}
        <Text size="sm" weight="medium" color="$foreground">
          {label}
        </Text>
        <View aria-hidden {...(isOpen && { rotate: '180deg' })}>
          <ChevronDownIcon size={14} color="$mutedForeground" />
        </View>
      </TopLevelFrame>
      {isWeb ? (
        <PanelFrame
          id={panelId}
          position="absolute"
          top="100%"
          left={0}
          marginTop="$1"
          width={panelWidth}
          maxWidth="$96"
          zIndex={zIndex.dropdown}
          // Kept in the page while closed so `aria-controls` always points at it.
          display={isOpen ? 'flex' : 'none'}
          {...shadows.md}
        >
          <View render="ul" margin={0} padding={0} gap="$1">
            <InPanel.Provider value>{children}</InPanel.Provider>
          </View>
        </PanelFrame>
      ) : null}
    </View>
  )
}

/**
 * Site navigation: links, and buttons that open panels of more links. It is
 * a disclosure pattern (not a `menu`), so every link is a normal Tab stop.
 * On iOS and Android the open panel shows under the bar.
 */
export const NavigationMenu = withStaticProperties(NavigationMenuRoot, {
  Link: NavigationMenuLink,
  Item: NavigationMenuItem,
})
