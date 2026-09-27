import { IconDefaults } from '@advui/icons'
import { type ReactNode, createContext, forwardRef, useContext } from 'react'
import {
  type GetProps,
  type TamaguiElement,
  Text,
  View,
  isWeb,
  withStaticProperties,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'

type BarState = { value: string; select: (value: string) => void }

const BarContext = createContext<BarState | null>(null)

export interface NavigationBarProps extends Omit<
  GetProps<typeof View>,
  'children' | 'defaultValue'
> {
  /** The current destination. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Names the navigation landmark, e.g. "Main". */
  'aria-label'?: string
  /** 3 to 5 NavigationBar.Item elements. */
  children: ReactNode
}

const NavigationBarRoot = forwardRef<TamaguiElement, NavigationBarProps>(function NavigationBar(
  { value: valueProp, defaultValue = '', onValueChange, children, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <BarContext.Provider value={{ value, select: setValue }}>
      <View
        ref={ref}
        render="nav"
        // Web: a navigation landmark of links; native: a tab bar, as screen readers expect.
        {...(!isWeb && { role: 'tablist' })}
        flexDirection="row"
        alignItems="stretch"
        width="100%"
        minHeight="$20"
        paddingVertical="$3"
        gap="$2"
        backgroundColor="$card"
        borderTopWidth={1}
        borderColor="$border"
        {...props}
      >
        {children}
      </View>
    </BarContext.Provider>
  )
})

export interface NavigationBarItemProps extends Omit<GetProps<typeof View>, 'children'> {
  value: string
  icon: ReactNode
  /** Always visible under the icon. */
  label: string
  /** A count (e.g. unread messages) or `true` for a dot. Announced with the label. */
  badge?: number | boolean
  /** Web: render your router's link, e.g. `render={<Link href="/inbox" />}`. */
  render?: GetProps<typeof View>['render']
  disabled?: boolean
}

function badgeText(badge: number | boolean | undefined) {
  if (badge === undefined || badge === false) return null
  if (badge === true) return ''
  return badge > 99 ? '99+' : String(badge)
}

const NavigationBarItem = forwardRef<TamaguiElement, NavigationBarItemProps>(
  function NavigationBarItem(
    { value, icon, label, badge, render, disabled = false, onPress, ...props },
    ref,
  ) {
    const bar = useContext(BarContext)
    if (!bar) throw new Error('NavigationBar.Item must be rendered inside <NavigationBar>.')
    const active = bar.value === value
    const count = badgeText(badge)
    const name = count === null ? label : count === '' ? `${label}, new` : `${label}, ${count} new`

    const semantics = isWeb
      ? {
          render: render ?? 'button',
          ...(render ? null : { type: 'button' }),
          'aria-current': active ? ('page' as const) : undefined,
        }
      : {
          accessible: true,
          role: 'tab' as const,
          accessibilityState: { selected: active, disabled },
        }

    return (
      <View
        ref={ref}
        {...semantics}
        aria-label={name}
        aria-disabled={disabled || undefined}
        flex={1}
        alignItems="center"
        justifyContent="flex-start"
        gap="$1"
        minWidth={0}
        paddingVertical={0}
        borderWidth={0}
        backgroundColor="transparent"
        cursor={disabled ? 'default' : 'pointer'}
        opacity={disabled ? 0.5 : 1}
        userSelect="none"
        focusVisibleStyle={{
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: 2,
          borderRadius: '$lg',
        }}
        onPress={(event) => {
          if (disabled) return
          onPress?.(event)
          bar.select(value)
        }}
        {...props}
      >
        <View
          width="$16"
          height="$8"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {/* Material's active indicator: a pill behind the icon. It is always
              painted and faded in, because Android does not round a background
              that is added after the view mounts. */}
          <View
            aria-hidden
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            borderRadius="$full"
            backgroundColor="$secondary"
            opacity={active ? 1 : 0}
            hoverStyle={{ opacity: active ? 1 : 0.6 }}
          />
          <IconDefaults size={24} color={active ? '$secondaryForeground' : '$mutedForeground'}>
            {icon}
          </IconDefaults>
          {count !== null ? (
            <View
              aria-hidden
              position="absolute"
              top={count === '' ? '$1' : 0}
              left="$9"
              minWidth={count === '' ? '$1.5' : '$4'}
              height={count === '' ? '$1.5' : '$4'}
              paddingHorizontal={count === '' ? 0 : '$1'}
              borderRadius="$full"
              backgroundColor="$error"
              alignItems="center"
              justifyContent="center"
            >
              {count === '' ? null : (
                <Text
                  fontFamily="$body"
                  fontSize="$1"
                  lineHeight="$1"
                  fontWeight="600"
                  color="$errorForeground"
                >
                  {count}
                </Text>
              )}
            </View>
          ) : null}
        </View>
        <Text
          aria-hidden
          fontFamily="$body"
          fontSize="$1"
          lineHeight="$1"
          fontWeight={active ? '700' : '500'}
          color={active ? '$foreground' : '$mutedForeground'}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    )
  },
)

/**
 * Switches between 3 to 5 top-level destinations of an app, at the bottom of
 * the screen on phones. Each item has an icon and a label; the current one is
 * marked with a pill behind the icon.
 */
export const NavigationBar = withStaticProperties(NavigationBarRoot, {
  Item: NavigationBarItem,
})
