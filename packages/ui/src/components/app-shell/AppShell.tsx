import { MenuIcon } from '@advui/icons'
import {
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import {
  type GetProps,
  ScrollView,
  type TamaguiElement,
  View,
  getTokenValue,
  isWeb,
  styled,
  useConfiguration,
  useMedia,
  withStaticProperties,
} from 'tamagui'
import {
  AppShellContext,
  type AppShellContextValue,
  AppShellSlotContext,
} from '../../hooks/useAppShell'
import { useControllableState } from '../../hooks/useControllableState'
import { Drawer } from '../drawer/Drawer'
import { IconButton, type IconButtonProps } from '../icon-button/IconButton'
import { Show } from '../show-hide/ShowHide'

export type AppShellLayout = 'header-full' | 'sidebar-full'
export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

interface Insets {
  top: number
  bottom: number
  left: number
}

/** What the areas need to know about the shell they are in. */
interface AreaContextValue {
  layout: AppShellLayout
  breakpoint: AppShellBreakpoint
  hasSidebar: boolean
  hasFooter: boolean
  /** The header, when it is not sticky: Main renders it at the top of what scrolls. */
  scrollingHeader: ReactNode
  /** Native safe areas (zero on web). */
  insets: Insets
}

const AreaContext = createContext<AreaContextValue>({
  layout: 'header-full',
  breakpoint: 'md',
  hasSidebar: false,
  hasFooter: false,
  scrollingHeader: null,
  insets: { top: 0, bottom: 0, left: 0 },
})

// Bundlers replace `process.env.NODE_ENV`; this types it for apps without Node's types.
declare const process: { env: { NODE_ENV?: string } }

/** Hidden on screen, still read by screen readers. */
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0.00000001,
  pointerEvents: 'none',
} as const

const RootFrame = styled(View, {
  name: 'AppShell',
  width: '100%',
  overflow: 'hidden',
  backgroundColor: '$background',
  // Fills the screen. `height` (or `flex`) overrides it, such as in a preview.
  ...(isWeb ? { height: '100dvh' as never } : { flexGrow: 1, flexShrink: 1 }),

  variants: {
    layout: {
      'header-full': { flexDirection: 'column' },
      'sidebar-full': { flexDirection: 'row' },
    },
  } as const,
})

const HeaderFrame = styled(View, {
  name: 'AppShellHeader',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  minHeight: '$14',
  paddingHorizontal: '$4',
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderColor: '$border',
  flexShrink: 0,
})

const FooterFrame = styled(View, {
  name: 'AppShellFooter',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  minHeight: '$12',
  paddingHorizontal: '$4',
  backgroundColor: '$background',
  borderTopWidth: 1,
  borderColor: '$border',
  flexShrink: 0,
})

const SidebarFrame = styled(View, {
  name: 'AppShellSidebar',
  flexShrink: 0,
  minHeight: 0,
  ...(isWeb && { overflowY: 'auto' }),
})

/** Web: the box that scrolls, around the header (when it scrolls too) and `<main>`. */
const ScrollerFrame = styled(View, {
  name: 'AppShellScroller',
  flex: 1,
  minHeight: 0,
  minWidth: 0,
  overflowY: 'auto',
  // Keyboard users scroll it with the arrow keys once it has focus.
  tabIndex: 0,
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: -2,
  },
})

const MainFrame = styled(View, {
  name: 'AppShellMain',
  flexGrow: 1,
  flexShrink: 0,
})

/** Min height of a bar plus the safe area it pads, so the bar keeps its own height. */
function barMinHeight(token: '$12' | '$14', inset: number) {
  return inset ? (getTokenValue(token, 'size') as number) + inset : undefined
}

export type AppShellHeaderProps = GetProps<typeof HeaderFrame>

/** The top bar: `<header>` (banner) on web. Pads the top safe area on iOS and Android. */
const AppShellHeader = forwardRef<TamaguiElement, AppShellHeaderProps>(
  function AppShellHeader(props, ref) {
    const { insets } = useContext(AreaContext)
    return (
      <HeaderFrame
        ref={ref}
        render="header"
        {...(insets.top > 0 && {
          paddingTop: insets.top,
          minHeight: barMinHeight('$14', insets.top),
        })}
        {...props}
      />
    )
  },
)

export type AppShellFooterProps = GetProps<typeof FooterFrame>

/** The bottom bar: `<footer>` (contentinfo) on web. Pads the bottom safe area on iOS and Android. */
const AppShellFooter = forwardRef<TamaguiElement, AppShellFooterProps>(
  function AppShellFooter(props, ref) {
    const { insets } = useContext(AreaContext)
    return (
      <FooterFrame
        ref={ref}
        render="footer"
        {...(insets.bottom > 0 && {
          paddingBottom: insets.bottom,
          minHeight: barMinHeight('$12', insets.bottom),
        })}
        {...props}
      />
    )
  },
)

export interface AppShellSidebarProps extends GetProps<typeof SidebarFrame> {
  /** Names the navigation landmark, on screen and in the drawer. Default: "Main". */
  'aria-label'?: string
}

/**
 * The side area: a `<nav>` from the breakpoint up, sized by its content, so a
 * collapsible Sidebar inside still shrinks. Below the breakpoint its children
 * move into the drawer.
 */
const AppShellSidebar = forwardRef<TamaguiElement, AppShellSidebarProps>(function AppShellSidebar(
  { children, 'aria-label': label = 'Main', ...props },
  ref,
) {
  const { breakpoint, layout, hasFooter, insets } = useContext(AreaContext)
  const fullHeight = layout === 'sidebar-full'
  return (
    <Show above={breakpoint}>
      <SidebarFrame
        ref={ref}
        render="nav"
        aria-label={label}
        {...(!isWeb && { role: 'navigation' as const })}
        // Native: the edges it touches clear the notch and home indicator.
        paddingTop={fullHeight ? insets.top : 0}
        paddingBottom={fullHeight || !hasFooter ? insets.bottom : 0}
        paddingLeft={insets.left}
        {...props}
      >
        <AppShellSlotContext.Provider value="inline">{children}</AppShellSlotContext.Provider>
      </SidebarFrame>
    </Show>
  )
})

export type AppShellMainProps = GetProps<typeof MainFrame>

/**
 * The content: `<main>`, in the area that scrolls between the header and
 * footer (a ScrollView on iOS and Android), so they stay in place.
 */
const AppShellMain = forwardRef<TamaguiElement, AppShellMainProps>(function AppShellMain(
  { children, ...props },
  ref,
) {
  const { scrollingHeader, hasFooter, insets } = useContext(AreaContext)
  const main = (
    <MainFrame ref={ref} render="main" {...props}>
      {children}
    </MainFrame>
  )
  if (isWeb) {
    return (
      <ScrollerFrame>
        {scrollingHeader}
        {main}
      </ScrollerFrame>
    )
  }
  return (
    <ScrollView
      flex={1}
      // Android: still scrolls when the shell sits inside a scrolling screen.
      nestedScrollEnabled
      contentContainerStyle={{ flexGrow: 1, paddingBottom: hasFooter ? 0 : insets.bottom }}
    >
      {scrollingHeader}
      {main}
    </ScrollView>
  )
})

export interface AppShellSidebarTriggerProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  /** Default: a menu icon. */
  icon?: ReactElement
  /** Default: "Open navigation". */
  'aria-label'?: string
}

/**
 * Opens the drawer. Shown only below the breakpoint, where the sidebar is a
 * drawer; it reports `aria-expanded` and `aria-controls` (web).
 */
const AppShellSidebarTrigger = forwardRef<TamaguiElement, AppShellSidebarTriggerProps>(
  function AppShellSidebarTrigger(
    { icon = <MenuIcon />, 'aria-label': label = 'Open navigation', ...props },
    ref,
  ) {
    const { breakpoint, hasSidebar } = useContext(AreaContext)
    if (!hasSidebar) return null
    return (
      <Show below={breakpoint}>
        <Drawer.Trigger asChild>
          <IconButton ref={ref} icon={icon} aria-label={label} {...props} />
        </Drawer.Trigger>
      </Show>
    )
  },
)

type AreaName = 'header' | 'sidebar' | 'main' | 'footer'

const areaTypes = new Map<unknown, AreaName>([
  [AppShellHeader, 'header'],
  [AppShellSidebar, 'sidebar'],
  [AppShellMain, 'main'],
  [AppShellFooter, 'footer'],
])

let warned = false

/** The first Header, Sidebar, Main and Footer among the children. */
function pickAreas(children: ReactNode) {
  const areas: Partial<Record<AreaName, ReactElement>> = {}
  let ignored = false
  Children.forEach(children, (child) => {
    const name = isValidElement(child) ? areaTypes.get(child.type) : undefined
    if (name && !areas[name]) areas[name] = child as ReactElement
    else if (child != null && typeof child !== 'boolean') ignored = true
  })
  if (ignored && process.env.NODE_ENV !== 'production' && !warned) {
    warned = true
    console.warn(
      'AppShell: only one each of AppShell.Header, .Sidebar, .Main and .Footer, as direct children, are rendered.',
    )
  }
  return areas
}

interface SidebarDrawerProps {
  sidebar: ReactElement<AppShellSidebarProps>
  width: number
  context: AppShellContextValue
}

/** Below the breakpoint: the sidebar's children in a drawer from the left. */
function SidebarDrawer({ sidebar, width, context }: SidebarDrawerProps) {
  const label = sidebar.props['aria-label'] ?? 'Main'
  const insets = useConfiguration().insets
  return (
    <Drawer.Content
      side="left"
      width={width}
      padding={0}
      gap={0}
      paddingTop={insets?.top ?? 0}
      paddingBottom={insets?.bottom ?? 0}
      paddingLeft={insets?.left ?? 0}
      paddingRight={0}
    >
      <Drawer.Title {...visuallyHidden}>{label}</Drawer.Title>
      {/* Inside the portal, so native (where portals drop context) still has it. */}
      <AppShellContext.Provider value={context}>
        <AppShellSlotContext.Provider value="drawer">
          <View
            render="nav"
            aria-label={label}
            {...(!isWeb && { role: 'navigation' as const })}
            flex={1}
            minHeight={0}
          >
            {sidebar.props.children}
          </View>
        </AppShellSlotContext.Provider>
      </AppShellContext.Provider>
    </Drawer.Content>
  )
}

export interface AppShellProps extends Omit<GetProps<typeof RootFrame>, 'layout'> {
  /** Whether the header or the sidebar spans its whole edge. Default `header-full`. */
  layout?: AppShellLayout
  /** Below this width the sidebar is a drawer, opened by `AppShell.SidebarTrigger`. Default `md`. */
  sidebarBreakpoint?: AppShellBreakpoint
  /** Width of the drawer, in px. Default `280`. */
  drawerWidth?: number
  /** Whether the drawer is open (controlled). */
  sidebarOpen?: boolean
  defaultSidebarOpen?: boolean
  onSidebarOpenChange?: (open: boolean) => void
  /** Keep the header in place while Main scrolls. With `false` it scrolls away with Main. Default `true`. */
  stickyHeader?: boolean
  /** `AppShell.Header`, `.Sidebar`, `.Main` and `.Footer`, each at most once. */
  children?: ReactNode
}

function AppShellRoot({
  children,
  layout = 'header-full',
  sidebarBreakpoint = 'md',
  drawerWidth = 280,
  sidebarOpen: openProp,
  defaultSidebarOpen = false,
  onSidebarOpenChange,
  stickyHeader = true,
  ...props
}: AppShellProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultSidebarOpen,
    onChange: onSidebarOpenChange,
  })
  // The drawer only exists below the breakpoint; one left open closes when
  // the window widens past it. Web reads this after hydration, and the
  // drawer starts closed, so the server markup is the same at every width.
  const desktop = useMedia()[sidebarBreakpoint] === true
  useEffect(() => {
    if (desktop && open) setOpen(false)
  }, [desktop, open, setOpen])
  const drawerOpen = open && !desktop

  const configInsets = useConfiguration().insets
  const insets = useMemo(
    () => ({
      top: configInsets?.top ?? 0,
      bottom: configInsets?.bottom ?? 0,
      left: configInsets?.left ?? 0,
    }),
    [configInsets?.top, configInsets?.bottom, configInsets?.left],
  )
  const { header, sidebar, main, footer } = pickAreas(children)
  const area: AreaContextValue = {
    layout,
    breakpoint: sidebarBreakpoint,
    hasSidebar: sidebar !== undefined,
    hasFooter: footer !== undefined,
    scrollingHeader: stickyHeader ? null : header,
    insets,
  }
  const context = useMemo(
    () => ({ sidebarOpen: drawerOpen, setSidebarOpen: setOpen }),
    [drawerOpen, setOpen],
  )
  const pinnedHeader = stickyHeader ? header : null

  return (
    // The drawer is a Drawer (focus trap, Escape, overlay, Android back), and
    // its root wraps the shell so the trigger in the header can open it.
    <Drawer open={drawerOpen} onOpenChange={setOpen}>
      <AppShellContext.Provider value={context}>
        <AreaContext.Provider value={area}>
          <RootFrame layout={layout} {...props}>
            {layout === 'sidebar-full' ? (
              <>
                {sidebar}
                <View flex={1} minWidth={0}>
                  {pinnedHeader}
                  {main}
                  {footer}
                </View>
              </>
            ) : (
              <>
                {pinnedHeader}
                <View flexDirection="row" flex={1} minHeight={0}>
                  {sidebar}
                  {main}
                </View>
                {footer}
              </>
            )}
          </RootFrame>
        </AreaContext.Provider>
        {sidebar ? (
          <SidebarDrawer
            sidebar={sidebar as ReactElement<AppShellSidebarProps>}
            width={drawerWidth}
            context={context}
          />
        ) : null}
      </AppShellContext.Provider>
    </Drawer>
  )
}

/**
 * The frame of an app screen: a header, a sidebar, the main content and a
 * footer. It fills the screen, Main scrolls between the header and footer,
 * and below `sidebarBreakpoint` the sidebar becomes a drawer.
 */
export const AppShell = withStaticProperties(AppShellRoot, {
  Header: AppShellHeader,
  Sidebar: AppShellSidebar,
  Main: AppShellMain,
  Footer: AppShellFooter,
  SidebarTrigger: AppShellSidebarTrigger,
})

export { useAppShell } from '../../hooks/useAppShell'
