import { ChevronRightIcon, MoreHorizontalIcon } from '@advui/icons'
import {
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useState,
} from 'react'
import { type GetProps, Text, View, isWeb, withStaticProperties } from 'tamagui'

type ItemState = { current: boolean; separator: ReactNode }

const ItemContext = createContext<ItemState>({ current: false, separator: null })

export interface BreadcrumbProps extends Omit<GetProps<typeof View>, 'children'> {
  /** Breadcrumb.Item elements, from the top level down to the current page. */
  children: ReactNode
  /**
   * Show at most this many items. The first one and the last ones stay; the
   * rest collapse behind a “Show all” button. Useful for deep paths on phones.
   */
  maxItems?: number
  /** Replaces the default chevron between items. */
  separator?: ReactNode
  /** Names the navigation landmark. Default "Breadcrumb". */
  'aria-label'?: string
}

function BreadcrumbRoot({
  children,
  maxItems,
  separator = <ChevronRightIcon size={14} color="$mutedForeground" />,
  'aria-label': ariaLabel = 'Breadcrumb',
  ...props
}: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false)
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[]
  const collapsed = !expanded && maxItems !== undefined && maxItems > 1 && items.length > maxItems
  const tail = collapsed ? items.slice(items.length - (maxItems - 1)) : items.slice(1)
  const hiddenCount = items.length - 1 - tail.length

  const ellipsis = (
    <View
      key="ellipsis"
      render="button"
      role="button"
      aria-label={`Show ${hiddenCount} more`}
      alignItems="center"
      justifyContent="center"
      width="$6"
      height="$6"
      padding={0}
      borderWidth={0}
      borderRadius="$sm"
      backgroundColor="transparent"
      cursor="pointer"
      hoverStyle={{ backgroundColor: '$accent' }}
      focusVisibleStyle={{ outlineColor: '$ring', outlineStyle: 'solid', outlineWidth: 2 }}
      {...(isWeb ? { type: 'button' } : { accessible: true, hitSlop: 10 })}
      onPress={() => setExpanded(true)}
    >
      <MoreHorizontalIcon size={16} color="$mutedForeground" />
    </View>
  )

  const shown: ReactNode[] = [items[0], ...(collapsed ? [ellipsis] : []), ...tail]
  const last = shown.length - 1

  return (
    <View render="nav" aria-label={ariaLabel} {...(!isWeb && { role: 'navigation' })} {...props}>
      <View
        render="ol"
        flexDirection="row"
        flexWrap="wrap"
        alignItems="center"
        rowGap="$1"
        columnGap="$1.5"
        margin={0}
        padding={0}
      >
        {shown.map((item, index) => (
          <ItemContext.Provider
            // Items keep their identity when the trail expands.
            key={isValidElement(item) && item.key !== null ? item.key : index}
            value={{ current: index === last, separator: index > 0 ? separator : null }}
          >
            {item === ellipsis ? <ListItem>{ellipsis}</ListItem> : item}
          </ItemContext.Provider>
        ))}
      </View>
    </View>
  )
}

function ListItem({ children }: { children: ReactNode }) {
  const { separator } = useContext(ItemContext)
  return (
    <View render="li" flexDirection="row" alignItems="center" gap="$1.5" minWidth={0}>
      {separator ? (
        <View aria-hidden {...(!isWeb && { accessible: false })}>
          {separator}
        </View>
      ) : null}
      {children}
    </View>
  )
}

export interface BreadcrumbItemProps extends Omit<GetProps<typeof Text>, 'children'> {
  children: ReactNode
  /** Link target on web. On iOS/Android pass `onPress` (e.g. `router.push`). */
  href?: string
  /** Render your router's link instead of `<a>`, e.g. `render={<Link href="/docs" />}`. */
  render?: GetProps<typeof Text>['render']
  /** Mark the current page. Default: the last item. */
  current?: boolean
}

function BreadcrumbItem({
  children,
  href,
  render,
  current: currentProp,
  onPress,
  ...props
}: BreadcrumbItemProps) {
  const context = useContext(ItemContext)
  const current = currentProp ?? context.current
  // Native apps navigate with their router, so there an item is a link only
  // with onPress; an href alone would be a dead link.
  const isLink =
    !current && (onPress !== undefined || (isWeb && (href !== undefined || render !== undefined)))

  return (
    <ListItem>
      {isLink ? (
        <Text
          render={render ?? (href !== undefined ? 'a' : 'button')}
          {...(href !== undefined && { href })}
          role="link"
          {...(!isWeb && {
            accessible: true,
            hitSlop: 8,
            // TalkBack's double-tap on text arrives as the "activate" action.
            accessibilityActions: [{ name: 'activate' }],
            onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
              if (event.nativeEvent.actionName === 'activate') onPress?.(event as never)
            },
          })}
          // Without an href this renders a <button>: drop the browser's button chrome.
          padding={0}
          borderWidth={0}
          backgroundColor="transparent"
          fontFamily="$body"
          fontSize="$2"
          lineHeight="$2"
          color="$mutedForeground"
          cursor="pointer"
          textDecorationLine="none"
          numberOfLines={1}
          hoverStyle={{ color: '$foreground', textDecorationLine: 'underline' }}
          focusVisibleStyle={{
            outlineColor: '$ring',
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineOffset: 2,
            borderRadius: '$sm',
          }}
          onPress={onPress}
          {...props}
        >
          {children}
        </Text>
      ) : (
        <Text
          aria-current={current ? 'page' : undefined}
          // Native has no aria-current; say it in the label instead.
          {...(!isWeb &&
            current &&
            typeof children === 'string' && { 'aria-label': `${children}, current page` })}
          fontFamily="$body"
          fontSize="$2"
          lineHeight="$2"
          color={current ? '$foreground' : '$mutedForeground'}
          fontWeight={current ? '500' : '400'}
          numberOfLines={1}
          {...props}
        >
          {children}
        </Text>
      )}
    </ListItem>
  )
}

/**
 * Shows where the current page sits in the hierarchy and links back up it.
 * The last item is the current page (`aria-current="page"`).
 */
export const Breadcrumb = withStaticProperties(BreadcrumbRoot, {
  Item: BreadcrumbItem,
})
