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
  type SizeTokens,
  type TamaguiElement,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui/unstyled'
import { isTextContent } from '../../utils/isTextContent'
import { Text } from '../typography/Text'

type Orientation = 'horizontal' | 'vertical'

type ListState = {
  orientation: Orientation
  divided: boolean
  termWidth: SizeTokens | number
}

const ListContext = createContext<ListState>({
  orientation: 'horizontal',
  divided: false,
  termWidth: '40',
})
// The item's place in the list, for the line above every item but the first.
const IndexContext = createContext(0)

const DescriptionListFrame = styled(View, {
  displayName: 'DescriptionList',
  render: 'dl',
  flexDirection: 'column',
  // A dl has margins in browsers.
  margin: 0,
})

export interface DescriptionListProps extends GetProps<typeof DescriptionListFrame> {
  /** `horizontal` puts each term beside its details; `vertical` above them. */
  orientation?: Orientation
  /** Draws a line between items. */
  divided?: boolean
  /** Width of the term column when horizontal: a size token or pixels. */
  termWidth?: SizeTokens | number
}

const DescriptionListRoot = forwardRef<TamaguiElement, DescriptionListProps>(
  function DescriptionList(
    { orientation = 'horizontal', divided = false, termWidth = '40', children, ...props },
    ref,
  ) {
    return (
      <ListContext.Provider value={{ orientation, divided, termWidth }}>
        <DescriptionListFrame ref={ref} gap={divided ? 0 : '3'} {...props}>
          {Children.toArray(children).map((child, index) => (
            <IndexContext.Provider
              key={isValidElement(child) && child.key != null ? child.key : index}
              value={index}
            >
              {child}
            </IndexContext.Provider>
          ))}
        </DescriptionListFrame>
      </ListContext.Provider>
    )
  },
)

const DescriptionTerm = styled(Text, {
  displayName: 'DescriptionListTerm',
  render: 'dt',
  size: 'sm',
  weight: 'medium',
  tone: 'muted',
})

const DescriptionDetails = styled(View, {
  displayName: 'DescriptionListDetails',
  render: 'dd',
  // A dd is indented in browsers.
  margin: 0,
  minWidth: 0,
  // A Badge keeps its own width.
  alignItems: 'flex-start',
})

export interface DescriptionListItemProps extends Omit<GetProps<typeof View>, 'children'> {
  /** What is described, such as "Status". */
  term: ReactNode
  /** The details: text, or elements such as a Badge or a Link. */
  children?: ReactNode
}

const DescriptionListItem = forwardRef<TamaguiElement, DescriptionListItemProps>(
  function DescriptionListItem({ term, children, ...props }, ref) {
    const { orientation, divided, termWidth } = useContext(ListContext)
    const index = useContext(IndexContext)
    const horizontal = orientation === 'horizontal'
    const text = isTextContent(children)
    return (
      <View
        ref={ref}
        flexDirection={horizontal ? 'row' : 'column'}
        gap={horizontal ? '4' : '1'}
        {...(divided && {
          paddingVertical: '3',
          ...(index > 0 && { borderTopWidth: 1, borderColor: 'border' }),
        })}
        // iOS and Android read a term and its text as one stop ("Status,
        // Active"). Details with controls stay apart, or they could not be
        // reached.
        {...(!isWeb && text && { accessible: true })}
        {...props}
      >
        <DescriptionTerm {...(horizontal && { width: termWidth, flexShrink: 0 })}>
          {term}
        </DescriptionTerm>
        <DescriptionDetails {...(horizontal && { flex: 1 })}>
          {text ? <Text size="sm">{children}</Text> : children}
        </DescriptionDetails>
      </View>
    )
  },
)

/**
 * Terms and their details, such as the fields of an order or a profile: a
 * `dl` on web. Each `DescriptionList.Item` takes a `term` and its details as
 * children.
 */
export const DescriptionList = withStaticProperties(DescriptionListRoot, {
  Item: DescriptionListItem,
})
