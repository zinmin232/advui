import { Children, forwardRef, isValidElement } from 'react'
import { type GetProps, type TamaguiElement, View, styled, withStaticProperties } from 'tamagui'
import {
  ListContext,
  ListItem,
  ListItemDescription,
  ListItemPosition,
  ListItemTitle,
} from '../list-item/ListItem'

const ListFrame = styled(View, {
  name: 'List',
  context: ListContext,
  role: 'list',
  flexDirection: 'column',

  variants: {
    variant: {
      plain: {},
      outline: {
        backgroundColor: "card",
        borderWidth: 1,
        borderColor: "border",
        borderRadius: "lg",
        overflow: 'hidden'
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  } as const,

  defaultVariants: { variant: 'plain', size: 'md' },
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
        <ListItemPosition.Provider
          key={isValidElement(child) && child.key != null ? child.key : index}
          value={{ inList: true, index, divided }}
        >
          {child}
        </ListItemPosition.Provider>
      ))}
    </ListFrame>
  )
})

/**
 * A vertical list of rows. `List.Item` is `ListItem`: an optional leading
 * visual, a title and description, trailing meta and actions; with
 * `onPress` the row is a button.
 */
export const List = withStaticProperties(ListImpl, {
  Item: ListItem,
  ItemTitle: ListItemTitle,
  ItemDescription: ListItemDescription,
})

export { ListFrame }
