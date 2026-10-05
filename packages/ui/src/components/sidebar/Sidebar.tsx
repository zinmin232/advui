import { ChevronLeftIcon, ChevronRightIcon, IconDefaults } from '@advui/icons'
import { type ReactNode, createContext, forwardRef, useContext, useId } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { AppShellContext, AppShellSlotContext } from '../../hooks/useAppShell'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'
import { ariaState } from '../../utils/ariaState'

const linkReset = { textDecoration: 'none', textAlign: 'start' } as const

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  id: string
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  id: '',
})

/** Hidden on screen, still read by screen readers (web). */
const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  opacity: 0.00000001,
  pointerEvents: 'none',
} as const

const SidebarFrame = styled(View, {
  name: 'Sidebar',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '$card',
  borderRightWidth: 1,
  borderColor: '$border',
  flexShrink: 0,

  variants: {
    collapsed: {
      true: { width: '$16' },
      false: { width: '$64' },
    },
  } as const,
})

const SidebarHeader = styled(View, {
  name: 'SidebarHeader',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  padding: '$3',
  minHeight: '$14',
})

const SidebarContent = styled(View, {
  name: 'SidebarContent',
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  paddingHorizontal: '$2',
  paddingVertical: '$2',
  gap: '$4',
})

const SidebarFooter = styled(View, {
  name: 'SidebarFooter',
  padding: '$3',
  borderTopWidth: 1,
  borderColor: '$border',
  gap: '$2',
})

const SidebarItemFrame = styled(View, {
  name: 'SidebarItem',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$3',
  minHeight: '$9',
  $touchable: { minHeight: '$11' },
  paddingHorizontal: '$3',
  borderRadius: '$md',
  borderWidth: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  hoverStyle: { backgroundColor: '$accent' },
  pressStyle: { backgroundColor: '$accentHover' },
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: -2,
  },

  variants: {
    active: {
      true: { backgroundColor: '$accent' },
    },
    collapsed: {
      true: { justifyContent: 'center', paddingHorizontal: 0 },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', hoverStyle: { backgroundColor: 'transparent' } },
    },
  } as const,
})

export interface SidebarProps extends Omit<GetProps<typeof SidebarFrame>, 'collapsed'> {
  /** Names the navigation landmark. Default: "Sidebar". */
  'aria-label'?: string
  /** Icon-only rail (controlled). Labels stay readable by screen readers. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const SidebarImpl = forwardRef<TamaguiElement, SidebarProps>(function Sidebar(
  {
    'aria-label': ariaLabel = 'Sidebar',
    collapsed: collapsedProp,
    defaultCollapsed = false,
    onCollapsedChange,
    ...props
  },
  ref,
) {
  const [collapsedState, setCollapsed] = useControllableState({
    value: collapsedProp,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  })
  const id = useId()
  // In an AppShell the area around it is the navigation landmark. In its
  // phone drawer it fills the drawer, and a rail would make no sense there.
  const slot = useContext(AppShellSlotContext)
  const collapsed = slot === 'drawer' ? false : collapsedState
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, id }}>
      <SidebarFrame
        ref={ref}
        id={id}
        collapsed={collapsed}
        {...(slot
          ? { flex: 1, height: 'auto' }
          : { render: 'nav', 'aria-label': ariaLabel, ...(!isWeb && { role: 'navigation' }) })}
        {...(slot === 'drawer' && { width: '100%', borderRightWidth: 0 })}
        {...props}
      />
    </SidebarContext.Provider>
  )
})

export interface SidebarGroupProps extends Omit<GetProps<typeof View>, 'children'> {
  /** Small heading over the group; hidden (but still read) when collapsed. */
  label?: string
  /** `Sidebar.Item` elements. */
  children: ReactNode
}

/** A labelled list of items. */
function SidebarGroup({ label, children, ...props }: SidebarGroupProps) {
  const { collapsed } = useContext(SidebarContext)
  const labelId = useId()
  return (
    <View gap="$1" {...props}>
      {label ? (
        <Text
          id={labelId}
          size="xs"
          weight="medium"
          tone="muted"
          paddingHorizontal="$3"
          paddingVertical="$1"
          {...(collapsed && visuallyHidden)}
        >
          {label}
        </Text>
      ) : null}
      <View
        render="ul"
        role="list"
        {...(label && { 'aria-labelledby': labelId })}
        margin={0}
        padding={0}
        gap="$0.5"
      >
        {children}
      </View>
    </View>
  )
}

export interface SidebarItemProps extends Omit<GetProps<typeof View>, 'children' | 'render'> {
  /** The label. */
  children: ReactNode
  icon?: ReactNode
  /** Link target on web. On iOS/Android pass `onPress` (e.g. `router.push`). */
  href?: string
  /** Render your router's link instead of `<a>`. */
  render?: GetProps<typeof View>['render']
  /** The current page: `aria-current="page"`. */
  active?: boolean
  /** A count or short tag after the label, e.g. `12` or "New". */
  badge?: ReactNode
  disabled?: boolean
}

/** One navigation link: icon, label and an optional badge. */
const SidebarItem = forwardRef<TamaguiElement, SidebarItemProps>(function SidebarItem(
  { children, icon, href, render, active = false, badge, disabled = false, onPress, ...props },
  ref,
) {
  const { collapsed } = useContext(SidebarContext)
  const shell = useContext(AppShellContext)
  const inDrawer = useContext(AppShellSlotContext) === 'drawer'
  const ripple = useRipple({ color: '$foreground', disabled })
  const text = isTextContent(children) ? [children].flat().join('') : undefined
  const badgeText = isTextContent(badge) ? [badge].flat().join('') : undefined
  // Native: one name with everything a screen reader would read on web.
  const nativeName =
    text && [text, badgeText, active ? 'current page' : undefined].filter(Boolean).join(', ')

  return (
    <View render="li" role="listitem">
      <SidebarItemFrame
        ref={ref}
        active={active}
        collapsed={collapsed}
        disabled={disabled}
        render={render ?? (href !== undefined && !disabled ? 'a' : 'button')}
        {...(href !== undefined && !disabled && { href })}
        role="link"
        // Web: an <a> underlines its text and a <button> centers it; links here do neither.
        {...(isWeb && { style: linkReset })}
        aria-disabled={ariaState(disabled)}
        {...(isWeb
          ? { 'aria-current': active ? ('page' as const) : undefined }
          : { accessible: true, ...(nativeName && { 'aria-label': nativeName }) })}
        onPress={(event) => {
          if (disabled) return
          onPress?.(event)
          // Following a link from an AppShell's phone drawer closes the drawer.
          if (inDrawer) shell?.setSidebarOpen(false)
        }}
        {...props}
        {...ripple.props}
      >
        {ripple.element}
        {icon ? (
          <View aria-hidden>
            <IconDefaults size={18} color={active ? '$foreground' : '$mutedForeground'}>
              {icon}
            </IconDefaults>
          </View>
        ) : null}
        <Text
          flex={1}
          size="sm"
          numberOfLines={1}
          color="$foreground"
          {...(active && { weight: 'medium' as const })}
          {...(collapsed && visuallyHidden)}
        >
          {children}
        </Text>
        {badge != null ? (
          <View {...(collapsed && visuallyHidden)}>
            {badgeText !== undefined ? (
              <Text size="xs" weight="medium" tone="muted">
                {badge}
              </Text>
            ) : (
              badge
            )}
          </View>
        ) : null}
      </SidebarItemFrame>
    </View>
  )
})

export interface SidebarToggleProps {
  /** Default: "Collapse sidebar" / "Expand sidebar". */
  labels?: { collapse: string; expand: string }
}

/** Collapses the sidebar to an icon rail and back. Put it in the header. */
function SidebarToggle({
  labels = { collapse: 'Collapse sidebar', expand: 'Expand sidebar' },
}: SidebarToggleProps) {
  const { collapsed, setCollapsed, id } = useContext(SidebarContext)
  // An AppShell drawer never collapses to a rail.
  const inDrawer = useContext(AppShellSlotContext) === 'drawer'
  if (inDrawer) return null
  return (
    <IconButton
      size="sm"
      icon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      aria-label={collapsed ? labels.expand : labels.collapse}
      aria-expanded={!collapsed}
      {...(isWeb && { 'aria-controls': id })}
      onPress={() => setCollapsed(!collapsed)}
    />
  )
}

/** Whether the surrounding Sidebar is collapsed, for your own header or footer content. */
export function useSidebar() {
  const { collapsed, setCollapsed } = useContext(SidebarContext)
  return { collapsed, setCollapsed }
}

/**
 * App navigation down the side of the screen: a header, groups of links,
 * and a footer. It can collapse to an icon rail. On phones, put it in a
 * Drawer.
 */
export const Sidebar = withStaticProperties(SidebarImpl, {
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Item: SidebarItem,
  Toggle: SidebarToggle,
})

export { SidebarFrame, SidebarItemFrame }
export type SidebarHeaderProps = GetProps<typeof SidebarHeader>
export type SidebarContentProps = GetProps<typeof SidebarContent>
export type SidebarFooterProps = GetProps<typeof SidebarFooter>
