import { IconDefaults } from '@advui/icons'
import {
  Children,
  type ReactNode,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  View,
  createStyledContext,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useRipple } from '../../hooks/useRipple'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

type ListSize = 'sm' | 'md'

const ListContext = createStyledContext<{ size: ListSize }>({ size: 'md' })

// Where an item sits, so it can draw the divider above it (not above the first).
const ItemPosition = createContext({ index: 0, divided: false })

const ListFrame = styled(View, {
  name: 'List',
  context: ListContext,
  role: 'list',
  flexDirection: 'column',

  variants: {
    variant: {
      plain: {},
      outline: {
        backgroundColor: '$card',
        borderWidth: 1,
        borderColor: '$border',
        borderRadius: '$lg',
        overflow: 'hidden',
      },
    },
    size: {
      sm: {},
      md: {},
    },
  } as const,

  defaultVariants: { variant: 'plain', size: 'md' },
})

const ListItemFrame = styled(View, {
  name: 'ListItem',
  role: 'listitem',
  flexDirection: 'column',

  variants: {
    divider: {
      true: { borderTopWidth: 1, borderColor: '$border' },
    },
  } as const,
})

const ListItemRow = styled(View, {
  name: 'ListItemRow',
  context: ListContext,
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$3',
  width: '100%',

  variants: {
    size: {
      sm: { paddingHorizontal: '$3', paddingVertical: '$2', minHeight: '$11' },
      md: { paddingHorizontal: '$4', paddingVertical: '$3', minHeight: '$12' },
    },
    interactive: {
      true: {
        cursor: 'pointer',
        backgroundColor: 'transparent',
        borderWidth: 0,
        hoverStyle: { backgroundColor: '$accent' },
        pressStyle: { backgroundColor: '$accentHover' },
        // Inset, so an outline List's clipping does not cut it off.
        focusVisibleStyle: {
          outlineColor: '$ring',
          outlineStyle: 'solid',
          outlineWidth: 2,
          outlineOffset: -2,
        },
      },
    },
    disabled: {
      true: { opacity: 0.5, cursor: 'not-allowed', hoverStyle: { backgroundColor: 'transparent' } },
    },
  } as const,
})

const ListItemContent = styled(View, {
  name: 'ListItemContent',
  flex: 1,
  minWidth: 0,
  gap: '$0.5',
})

const ListItemTitle = styled(Text, {
  name: 'ListItemTitle',
  context: ListContext,
  weight: 'medium',

  variants: {
    size: {
      sm: { fontSize: '$2', lineHeight: '$2' },
      md: { fontSize: '$3', lineHeight: '$3' },
    },
  } as const,
})

const ListItemDescription = styled(Text, {
  name: 'ListItemDescription',
  context: ListContext,
  tone: 'muted',

  variants: {
    size: {
      sm: { fontSize: '$1', lineHeight: '$1' },
      md: { fontSize: '$2', lineHeight: '$2' },
    },
  } as const,
})

export type ListProps = GetProps<typeof ListFrame> & {
  /** Draws a line between items. */
  divided?: boolean
}

const ListImpl = forwardRef<TamaguiElement, ListProps>(function List(
  { variant = 'plain', size = 'md', divided = false, children, ...props },
  ref,
) {
  return (
    <ListFrame ref={ref} variant={variant} size={size} {...props}>
      {Children.toArray(children).map((child, index) => (
        <ItemPosition.Provider
          key={isValidElement(child) && child.key != null ? child.key : index}
          value={{ index, divided }}
        >
          {child}
        </ItemPosition.Provider>
      ))}
    </ListFrame>
  )
})

export interface ListItemProps extends Omit<
  GetProps<typeof ListItemFrame>,
  'children' | 'onPress' | 'title'
> {
  /** Main line. */
  title?: ReactNode
  /** Muted second line. */
  description?: ReactNode
  /** Icon, Avatar or image before the text. Icons get the muted color. */
  leading?: ReactNode
  /** Meta text, a Badge or a chevron after the text. Actions go here only when the item has no `onPress`. */
  trailing?: ReactNode
  /** Custom content in place of `title` and `description`. */
  children?: ReactNode
  /** Makes the whole row one button. */
  onPress?: GetProps<typeof ListItemRow>['onPress']
  disabled?: boolean
}

/** One row of a List: leading visual, title and description, trailing meta. */
const ListItem = forwardRef<TamaguiElement, ListItemProps>(function ListItem(
  {
    title,
    description,
    leading,
    trailing,
    children,
    onPress,
    disabled = false,
    onPressIn,
    onPressOut,
    ...props
  },
  ref,
) {
  const { index, divided } = useContext(ItemPosition)
  const pressable = !!onPress
  const ripple = useRipple({
    color: '$foreground',
    disabled: !pressable || disabled,
    onPressIn,
    onPressOut,
  })

  const content = (
    <>
      {leading ? (
        <IconDefaults size={20} color="$mutedForeground">
          {leading}
        </IconDefaults>
      ) : null}
      <ListItemContent>
        {children ?? (
          <>
            {title != null ? <ListItemTitle>{title}</ListItemTitle> : null}
            {description != null ? <ListItemDescription>{description}</ListItemDescription> : null}
          </>
        )}
      </ListItemContent>
      {trailing != null ? (
        <IconDefaults size={16} color="$mutedForeground">
          {isTextContent(trailing) ? (
            <Text size="sm" tone="muted">
              {trailing}
            </Text>
          ) : (
            trailing
          )}
        </IconDefaults>
      ) : null}
    </>
  )

  return (
    <ListItemFrame
      ref={ref}
      divider={divided && index > 0}
      {...(!pressable && { onPressIn, onPressOut })}
      {...props}
    >
      {pressable ? (
        <ListItemRow
          interactive
          disabled={disabled}
          aria-disabled={disabled || undefined}
          {...(isWeb
            ? // A button centers its text by default.
              { render: 'button', type: 'button', style: { textAlign: 'start' } }
            : { accessible: true, role: 'button' })}
          onPress={(event) => {
            if (!disabled) onPress(event)
          }}
          {...(ripple.active && { pressStyle: { backgroundColor: 'transparent' } })}
          {...ripple.props}
        >
          {ripple.element}
          {content}
        </ListItemRow>
      ) : (
        <ListItemRow>{content}</ListItemRow>
      )}
    </ListItemFrame>
  )
})

/**
 * A vertical list of rows. Each `List.Item` has an optional leading visual,
 * a title and description, and trailing meta; with `onPress` the row is a
 * button.
 */
export const List = withStaticProperties(ListImpl, {
  Item: ListItem,
  ItemTitle: ListItemTitle,
  ItemDescription: ListItemDescription,
})

export { ListFrame, ListItemFrame, ListItemTitle, ListItemDescription }
export type ListItemTitleProps = GetProps<typeof ListItemTitle>
export type ListItemDescriptionProps = GetProps<typeof ListItemDescription>
