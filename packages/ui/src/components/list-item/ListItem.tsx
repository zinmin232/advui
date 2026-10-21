import { IconDefaults } from '@advui/icons'
import { type ReactNode, createContext, forwardRef, useContext } from 'react'
import {
  type ColorTokens,
  type GetProps,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  styled,
} from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'
import { useRipple } from '../../hooks/useRipple'
import { ariaState } from '../../utils/ariaState'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

export type ListItemSize = 'sm' | 'md' | 'lg'
export type ListItemVariant = 'plain' | 'filled' | 'outline'

/** Shared with List, whose `size` its items take unless they set their own. */
export const ListContext = createStyledContext<{ size: ListItemSize }>({ size: 'md' })

// Set by List for each child: an item draws the divider above it (not above
// the first) and is a `listitem` only inside a list.
export const ListItemPosition = createContext({ inList: false, index: 0, divided: false })

const ListItemFrame = styled(View, {
  name: 'ListItem',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'stretch',
  // Clips the hover fill and the selected fill to the corners.
  overflow: 'hidden',

  variants: {
    variant: {
      plain: {},
      filled: {
        backgroundColor: "muted"
      },
      outline: {
        backgroundColor: "card",
        borderWidth: 1,
        borderColor: "border"
      },
    },
    divider: {
      true: {
        borderTopWidth: 1,
        borderColor: "border"
      },
    },
  } as const,
})

const ListItemRow = styled(View, {
  name: 'ListItemRow',
  context: ListContext,
  // Positioned so it paints above the selected fill on web.
  position: 'relative',
  flex: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  gap: "3",
  variants: {
    size: {
      sm: {
        paddingHorizontal: "3",
        paddingVertical: "2",
        minHeight: "11"
      },
      md: {
        paddingHorizontal: "4",
        paddingVertical: "3",
        minHeight: "12"
      },
      lg: {
        paddingHorizontal: "4",
        paddingVertical: "4",
        minHeight: "14"
      },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        backgroundColor: "transparent hover:accent press:accentHover",
        borderWidth: 0,
        // Inset, so the item's own clipping does not cut it off.
      outlineColor: "focus-visible:ring",
        outlineStyle: "focus-visible:solid",
        outlineWidth: "focus-visible:2px",
        outlineOffset: "focus-visible:-2px"
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: "hover:transparent press:transparent"
      },
    },
  } as const
})

const ListItemContent = styled(View, {
  name: 'ListItemContent',
  flex: 1,
  minWidth: 0,
  gap: "0-5"
})

const ListItemTitle = styled(Text, {
  name: 'ListItemTitle',
  context: ListContext,
  weight: 'medium',

  variants: {
    size: {
      sm: {
        fontSize: "2",
        lineHeight: "2"
      },
      md: {
        fontSize: "3",
        lineHeight: "3"
      },
      lg: {
        fontSize: "4",
        lineHeight: "4"
      },
    },
  } as const,
})

const ListItemDescription = styled(Text, {
  name: 'ListItemDescription',
  context: ListContext,
  tone: 'muted',

  variants: {
    size: {
      sm: {
        fontSize: "1",
        lineHeight: "1"
      },
      md: {
        fontSize: "2",
        lineHeight: "2"
      },
      lg: {
        fontSize: "3",
        lineHeight: "3"
      },
    },
  } as const,
})

const iconSizes: Record<ListItemSize, number> = { sm: 20, md: 20, lg: 24 }
const rowPadding = { sm: '3', md: '4', lg: '4' } as const

type RowProps = GetProps<typeof ListItemRow>

// Padding and gap belong to the row inside, so the pressable area fills the item.
const rowSpacing: Record<string, string> = {
  padding: 'padding',
  p: 'padding',
  paddingHorizontal: 'paddingHorizontal',
  px: 'paddingHorizontal',
  paddingVertical: 'paddingVertical',
  py: 'paddingVertical',
  paddingTop: 'paddingTop',
  pt: 'paddingTop',
  paddingBottom: 'paddingBottom',
  pb: 'paddingBottom',
  paddingLeft: 'paddingLeft',
  pl: 'paddingLeft',
  paddingRight: 'paddingRight',
  pr: 'paddingRight',
  gap: 'gap',
}

function splitSpacing(props: Record<string, unknown>) {
  const row: Record<string, unknown> = {}
  const frame: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    const target = rowSpacing[key]
    if (target) row[target] = value
    else frame[key] = value
  }
  return { row, frame }
}

const linkReset = { textDecoration: 'none', textAlign: 'start' } as const

export interface ListItemProps extends Omit<
  GetProps<typeof ListItemFrame>,
  'children' | 'onPress' | 'title' | 'variant'
> {
  /** Main line. Text gets the title style; an element is rendered as it is. */
  title?: ReactNode
  /** Muted second line. */
  description?: ReactNode
  /** Custom content in place of `title` and `description`. */
  children?: ReactNode
  /** Icon, Avatar, image, Checkbox or Radio before the text. Icons are sized and muted. */
  leading?: ReactNode
  /**
   * After the text: meta text, a Badge, a status, a chevron. Part of the
   * pressable area, so it must not hold controls when the item is pressable;
   * put those in `actions`.
   */
  trailing?: ReactNode
  /** Buttons or controls at the end, outside the pressable area. They keep their own presses. */
  actions?: ReactNode
  /** Surface. Inside a List, leave it `plain` and set the List's `variant`. */
  variant?: ListItemVariant
  /** Padding, text and icon size. Default: the List's `size`, or `md`. */
  size?: ListItemSize
  /** Line above the item. Default: from the List's `divided` (not above the first item). */
  divider?: boolean
  /** Color of the title, description and icons. Pair it with a `backgroundColor`. */
  color?: ColorTokens
  /** Makes the item one button (or a link with `href`). */
  onPress?: RowProps['onPress']
  /** Web: the item is a link. On iOS and Android navigate in `onPress` instead. */
  href?: string
  /**
   * Highlights the item. On a pressable item it is the current one
   * (`aria-current`); with `selectable` it is the toggle state.
   */
  selected?: boolean
  /** Selected at first, when a `selectable` item manages its state. */
  defaultSelected?: boolean
  /** Pressing toggles `selected` (a toggle button). */
  selectable?: boolean
  /** Called with the new state when a `selectable` item is pressed. */
  onSelectedChange?: (selected: boolean) => void
  /** Blocks `onPress`, `href` and selection, and dims the item. `actions` stay enabled. */
  disabled?: boolean
}

/**
 * One row: a leading visual, a title and description, trailing meta and
 * actions. On its own or as `List.Item`. With `onPress`, `href` or
 * `selectable` the content is one button or link; `actions` sit beside it.
 */
export const ListItem = forwardRef<TamaguiElement, ListItemProps>(function ListItem(
  {
    title,
    description,
    children,
    leading,
    trailing,
    actions,
    variant = 'plain',
    size: sizeProp,
    divider: dividerProp,
    color,
    onPress,
    href,
    selected: selectedProp,
    defaultSelected = false,
    selectable = false,
    onSelectedChange,
    disabled = false,
    onPressIn,
    onPressOut,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  const { row: spacing, frame: props } = splitSpacing(rest)
  const { inList, index, divided } = useContext(ListItemPosition)
  const listSize = ListContext.useStyledContext().size
  const size = sizeProp ?? listSize
  const divider = dividerProp ?? (divided && index > 0)
  const [selected, setSelected] = useControllableState({
    value: selectedProp,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
  })

  const isLink = href !== undefined && !selectable
  const interactive = selectable || isLink || !!onPress
  const ripple = useRipple({
    color: 'foreground',
    disabled: !interactive || disabled,
    onPressIn,
    onPressOut,
  })

  const textColor = color ? { color } : null

  const content = (
    <>
      {leading != null ? (
        <View flexShrink={0} alignItems="center" justifyContent="center">
          <IconDefaults size={iconSizes[size]} color={color ?? 'mutedForeground'}>
            {leading}
          </IconDefaults>
        </View>
      ) : null}
      <ListItemContent>
        {children ?? (
          <>
            {title == null ? null : isTextContent(title) ? (
              <ListItemTitle {...textColor}>{title}</ListItemTitle>
            ) : (
              title
            )}
            {description == null ? null : isTextContent(description) ? (
              <ListItemDescription {...textColor}>{description}</ListItemDescription>
            ) : (
              description
            )}
          </>
        )}
      </ListItemContent>
      {trailing != null ? (
        // Never wider than half the row, so long meta wraps instead of
        // squeezing the title.
        <View flexShrink={0} maxWidth="50%" flexDirection="row" alignItems="center" gap="3">
          <IconDefaults size={16} color={color ?? 'mutedForeground'}>
            {isTextContent(trailing) ? (
              <Text size="sm" tone="muted" {...textColor}>
                {trailing}
              </Text>
            ) : (
              trailing
            )}
          </IconDefaults>
        </View>
      ) : null}
    </>
  )

  const semantics = isWeb
    ? {
        render: isLink && !disabled ? 'a' : 'button',
        ...(isLink && !disabled
          ? { href, style: linkReset }
          : { type: 'button', style: linkReset }),
        ...(selectable
          ? { 'aria-pressed': selected }
          : { 'aria-current': selected ? (isLink ? 'page' : 'true') : undefined }),
      }
    : selectable
      ? {
          // React Native has no aria-pressed; a toggle button reports "checked".
          accessible: true,
          accessibilityRole: 'togglebutton' as const,
          accessibilityState: { checked: selected, disabled },
        }
      : {
          accessible: true,
          role: isLink ? ('link' as const) : ('button' as const),
          // Native has no aria-current; screen readers announce "selected".
          'aria-selected': ariaState(selected),
        }

  // Painted from the start and faded in: Android does not round a
  // background that is added after the view mounts.
  const shown = selected ? (disabled ? 0.5 : 1) : 0

  return (
    <ListItemFrame
      ref={ref}
      variant={variant}
      divider={divider}
      borderRadius={variant === 'plain' ? (inList || divider ? 0 : 'md') : 'lg'}
      {...(inList && { role: 'listitem' as const })}
      {...(!interactive && ariaLabel !== undefined && { 'aria-label': ariaLabel })}
      {...(!interactive && { onPressIn, onPressOut })}
      {...props}
    >
      <View
        aria-hidden
        pointerEvents="none"
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundColor="secondary"
        opacity={shown}
      />
      {/* A shape as well as a fill, so the selected item stands out on every
          variant and custom background. */}
      <View
        aria-hidden
        pointerEvents="none"
        position="absolute"
        left={0}
        top="2"
        bottom="2"
        width="1"
        borderTopRightRadius="full"
        borderBottomRightRadius="full"
        backgroundColor="primary"
        opacity={shown}
      />
      <ListContext.Provider size={size}>
        {interactive ? (
          <ListItemRow
            interactive
            disabled={disabled}
            aria-disabled={ariaState(disabled)}
            {...semantics}
            {...(ariaLabel !== undefined && { 'aria-label': ariaLabel })}
            onPress={(event) => {
              if (disabled) {
                // A disabled link has no href, but stop anything else too.
                event?.preventDefault?.()
                return
              }
              onPress?.(event)
              if (selectable) setSelected(!selected)
            }}
            {...spacing}
            {...(ripple.active && { pressStyle: { backgroundColor: 'transparent' } })}
            {...ripple.props}
          >
            {ripple.element}
            {content}
          </ListItemRow>
        ) : (
          <ListItemRow disabled={disabled} {...spacing}>
            {content}
          </ListItemRow>
        )}
      </ListContext.Provider>
      {actions != null ? (
        <View
          position="relative"
          flexShrink={0}
          flexDirection="row"
          alignItems="center"
          gap="2"
          paddingRight={ (spacing.paddingRight ?? spacing.paddingHorizontal ?? spacing.padding ?? rowPadding[size]) as RowProps['paddingRight'] }
        >
          {actions}
        </View>
      ) : null}
    </ListItemFrame>
  )
})

export { ListItemFrame, ListItemTitle, ListItemDescription }
export type ListItemTitleProps = GetProps<typeof ListItemTitle>
export type ListItemDescriptionProps = GetProps<typeof ListItemDescription>
