import { IconDefaults } from '@advui/icons'
import { shadows } from '@advui/theme'
import { type ReactNode, createContext, forwardRef, useContext } from 'react'
import {
  type GetProps,
  Tabs as TamaguiTabs,
  type TabsContentProps as TamaguiTabsContentProps,
  type TabsListProps as TamaguiTabsListProps,
  type TabsProps as TamaguiTabsProps,
  type TabsTabProps as TamaguiTabsTabProps,
  type TamaguiElement,
  Text,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { ariaState } from '../../utils/ariaState'
import { isTextContent } from '../../utils/isTextContent'
import type { ControlStateProps } from '../../hooks/useFieldControl'

type TabsVariant = 'pills' | 'underline'

const TabsStyleContext = createStyledContext<{ variant: TabsVariant }>({ variant: 'pills' })
const ActiveValueContext = createContext<string | undefined>(undefined)

const TabsFrame = styled(TamaguiTabs, {
  displayName: 'Tabs',
  context: TabsStyleContext,
  flexDirection: 'column',
  gap: '3',
})

const ListFrame = styled(TamaguiTabs.List, {
  displayName: 'TabsList',
  context: TabsStyleContext,
  flexDirection: 'row',
  alignSelf: 'flex-start',
  alignItems: 'center',
  maxWidth: '100%',

  variants: {
    variant: {
      pills: {
        backgroundColor: 'muted',
        borderRadius: 'lg',
        padding: '1',
        gap: '1',
      },
      underline: {
        alignSelf: 'stretch',
        borderBottomWidth: 1,
        borderColor: 'border',
        gap: '4',
      },
    },
  } as const,
})

const TriggerFrame = styled(TamaguiTabs.Tab, {
  displayName: 'TabsTrigger',
  context: TabsStyleContext,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1-5',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  transition: 'quick',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:1px',
  variants: {
    variant: {
      pills: {
        height: '8',
        paddingHorizontal: '3',
        borderRadius: 'md',
        backgroundColor: 'hover:accent',
      },
      underline: {
        height: '10',
        paddingHorizontal: '1',
        borderBottomWidth: 2,
        borderColor: 'transparent',
        marginBottom: -1,
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed' },
    },
  } as const,
})

const TriggerText = styled(Text, {
  displayName: 'TabsTriggerText',
  fontSize: '2',
  lineHeight: '2',
  fontWeight: '500',
  color: 'mutedForeground',
  userSelect: 'none',
})

// The focus ring is web only: on native the focus-visible clauses make Tamagui
// attach focus and press handlers, and Android marks the panel clickable.
const ContentFrame = styled(TamaguiTabs.Content, {
  displayName: 'TabsContent',
  ...(isWeb && {
    outlineColor: 'focus-visible:ring',
    outlineStyle: 'focus-visible:solid',
    outlineWidth: 'focus-visible:2px',
    outlineOffset: 'focus-visible:2px',
  }),
})

export type TabsProps = TamaguiTabsProps & { variant?: TabsVariant }

const TabsRoot = forwardRef<TamaguiElement, TabsProps>(function Tabs(
  {
    variant = 'pills',
    orientation = 'horizontal',
    value: valueProp,
    defaultValue,
    onValueChange,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  })
  return (
    <TabsStyleContext.Provider variant={variant}>
      <ActiveValueContext.Provider value={value}>
        <TabsFrame
          ref={ref}
          orientation={orientation}
          value={value}
          onValueChange={setValue}
          {...props}
        />
      </ActiveValueContext.Provider>
    </TabsStyleContext.Provider>
  )
})

export type TabsListProps = TamaguiTabsListProps & GetProps<typeof ListFrame>

const TabsList = forwardRef<TamaguiElement, TabsListProps>(function TabsList(props, ref) {
  const { variant } = TabsStyleContext.useStyledContext()
  return <ListFrame ref={ref} variant={variant} {...props} />
})

export interface TabsTriggerProps
  extends Omit<TamaguiTabsTabProps, 'children' | 'disabled'>, Pick<ControlStateProps, 'disabled'> {
  value: string
  children?: ReactNode
  icon?: ReactNode
}

const activeStyles = {
  pills: {
    backgroundColor: 'background',
    ...shadows.xs,
  },
  underline: { borderColor: 'primary' },
} as const

const TabsTrigger = forwardRef<TamaguiElement, TabsTriggerProps>(function TabsTrigger(
  { children, icon, onPressIn, onPressOut, ...props },
  ref,
) {
  const { variant } = TabsStyleContext.useStyledContext()
  const active = useContext(ActiveValueContext) === props.value
  const ripple = useRipple({
    color: 'foreground',
    radius: { borderRadius: variant === 'pills' ? 'md' : 0, ...props },
    disabled: props.disabled ?? false,
    onPressIn,
    onPressOut,
  })
  return (
    // Active styles come from our own context: Tamagui's `activeStyle` is not
    // applied on native.
    <TriggerFrame
      ref={ref}
      variant={variant}
      {...(active ? activeStyles[variant] : null)}
      // Tamagui sets a tab's disabled state on web only; without it TalkBack
      // read a disabled tab as plain text.
      {...(isWeb ? null : { accessible: true, 'aria-disabled': ariaState(props.disabled) })}
      {...props}
      {...ripple.props}
    >
      {ripple.element}
      <IconDefaults size={16} color={active ? 'foreground' : 'mutedForeground'}>
        {icon}
        {isTextContent(children) ? (
          <TriggerText color={active ? 'foreground' : 'mutedForeground'}>{children}</TriggerText>
        ) : (
          children
        )}
      </IconDefaults>
    </TriggerFrame>
  )
})

export type TabsContentProps = TamaguiTabsContentProps

// Native: Tamagui gives the panel a role, a label reference and a tab stop.
// Android then names the focusable panel from its text, so TalkBack read it
// twice; the panel role is web only (`null` clears Tamagui's props). The tab
// stop is cleared with `undefined`: React Native's View makes any other
// `tabIndex`, `null` included, focusable (`!tabIndex`).
const nativePanel = { role: null, 'aria-labelledby': null, tabIndex: undefined } as const

const TabsContent = forwardRef<TamaguiElement, TabsContentProps>(function TabsContent(props, ref) {
  return <ContentFrame ref={ref} {...(isWeb ? null : (nativePanel as object))} {...props} />
})

/**
 * Switch between related panels without leaving the page. Implements the WAI-ARIA
 * tabs pattern: arrow keys move focus, Home/End jump, panels are linked by id.
 */
export const Tabs = withStaticProperties(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
