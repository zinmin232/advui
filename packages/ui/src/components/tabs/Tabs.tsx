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
  styled,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'

type TabsVariant = 'pills' | 'underline'

const TabsStyleContext = createStyledContext<{ variant: TabsVariant }>({ variant: 'pills' })
const ActiveValueContext = createContext<string | undefined>(undefined)

const TabsFrame = styled(TamaguiTabs, {
  name: 'Tabs',
  context: TabsStyleContext,
  flexDirection: 'column',
  gap: '$3',
})

const ListFrame = styled(TamaguiTabs.List, {
  name: 'TabsList',
  context: TabsStyleContext,
  flexDirection: 'row',
  alignSelf: 'flex-start',
  alignItems: 'center',
  maxWidth: '100%',

  variants: {
    variant: {
      pills: {
        backgroundColor: '$muted',
        borderRadius: '$lg',
        padding: '$1',
        gap: '$1',
      },
      underline: {
        alignSelf: 'stretch',
        borderBottomWidth: 1,
        borderColor: '$border',
        gap: '$4',
      },
    },
  } as const,
})

const TriggerFrame = styled(TamaguiTabs.Tab, {
  name: 'TabsTrigger',
  context: TabsStyleContext,
  unstyled: true,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$1.5',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  transition: 'quick',
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 1,
  },

  variants: {
    variant: {
      pills: {
        height: '$8',
        paddingHorizontal: '$3',
        borderRadius: '$md',
        hoverStyle: { backgroundColor: '$accent' },
      },
      underline: {
        height: '$10',
        paddingHorizontal: '$1',
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
  name: 'TabsTriggerText',
  fontSize: '$2',
  lineHeight: '$2',
  fontWeight: '500',
  color: '$mutedForeground',
  userSelect: 'none',
})

const ContentFrame = styled(TamaguiTabs.Content, {
  name: 'TabsContent',
  focusVisibleStyle: {
    outlineColor: '$ring',
    outlineStyle: 'solid',
    outlineWidth: 2,
    outlineOffset: 2,
  },
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

export interface TabsTriggerProps extends Omit<TamaguiTabsTabProps, 'children'> {
  value: string
  children?: ReactNode
  icon?: ReactNode
}

const activeStyles = {
  pills: {
    backgroundColor: '$background',
    ...shadows.xs,
  },
  underline: { borderColor: '$primary' },
} as const

const TabsTrigger = forwardRef<TamaguiElement, TabsTriggerProps>(function TabsTrigger(
  { children, icon, ...props },
  ref,
) {
  const { variant } = TabsStyleContext.useStyledContext()
  const active = useContext(ActiveValueContext) === props.value
  return (
    // Active styles come from our own context: Tamagui's `activeStyle` is not
    // applied on native.
    <TriggerFrame
      ref={ref}
      variant={variant}
      {...(active ? activeStyles[variant] : null)}
      {...props}
    >
      <IconDefaults size={16} color={active ? '$foreground' : '$mutedForeground'}>
        {icon}
        {typeof children === 'string' ? (
          <TriggerText color={active ? '$foreground' : '$mutedForeground'}>{children}</TriggerText>
        ) : (
          children
        )}
      </IconDefaults>
    </TriggerFrame>
  )
})

export type TabsContentProps = TamaguiTabsContentProps

/**
 * Switch between related panels without leaving the page. Implements the WAI-ARIA
 * tabs pattern: arrow keys move focus, Home/End jump, panels are linked by id.
 */
export const Tabs = withStaticProperties(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: ContentFrame,
})
