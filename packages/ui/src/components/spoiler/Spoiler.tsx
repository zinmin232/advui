import { type ReactNode, forwardRef, useEffect, useId, useRef, useState } from 'react'
import {
  type GetProps,
  type SizeTokens,
  type TamaguiElement,
  type Token,
  View,
  getTokenValue,
  isWeb,
  styled,
} from 'tamagui/unstyled'
import { useControllableState } from '../../hooks/useControllableState'
import { isTextContent } from '../../utils/isTextContent'
import { Button } from '../button/Button'
import { Text } from '../typography/Text'

const SpoilerFrame = styled(View, {
  displayName: 'Spoiler',
  gap: '2',
  alignItems: 'flex-start',
})

const SpoilerContent = styled(View, {
  displayName: 'SpoilerContent',
  alignSelf: 'stretch',
  overflow: 'hidden',
})

export interface SpoilerProps extends Omit<
  GetProps<typeof SpoilerFrame>,
  'children' | 'maxHeight'
> {
  children: ReactNode
  /** Height of the content while collapsed: a size token or pixels. */
  maxHeight?: SizeTokens | number
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Label of the button while collapsed. */
  showLabel?: string
  /** Label of the button while expanded. */
  hideLabel?: string
}

type FocusEvent = { currentTarget: Element; target: Element }

/**
 * Shows the start of long content, cut off at `maxHeight`, with a button that
 * shows the rest. The button appears only when the content is taller.
 */
export const Spoiler = forwardRef<TamaguiElement, SpoilerProps>(function Spoiler(
  {
    children,
    maxHeight = '24',
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    showLabel = 'Show more',
    hideLabel = 'Show less',
    ...props
  },
  ref,
) {
  const [expanded, setExpanded] = useControllableState({
    value: expandedProp,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  })
  const contentId = useId()
  const innerRef = useRef<TamaguiElement>(null)
  // Unknown until measured, after the first render (and on the server).
  const [height, setHeight] = useState<number | null>(null)
  const limit =
    typeof maxHeight === 'number'
      ? maxHeight
      : (getTokenValue(maxHeight as Token, 'size') as number)
  const overflows = height !== null && height > limit

  // Native measures with onLayout; web watches the element, which also sees
  // content that grows later, such as an image that loads.
  useEffect(() => {
    const node = innerRef.current as HTMLElement | null
    if (!isWeb || !node) return
    const measure = () => setHeight(node.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <SpoilerFrame ref={ref} {...props}>
      <SpoilerContent
        id={contentId}
        // Cut off from the first render, so short content never jumps.
        maxHeight={expanded ? undefined : limit}
        {...(isWeb &&
          !expanded &&
          overflows && {
            // A keyboard user who tabs to a link that is cut off gets the
            // rest shown, rather than focus they cannot see.
            onFocus: (event: FocusEvent) => {
              const frame = event.currentTarget.getBoundingClientRect()
              if (event.target.getBoundingClientRect().bottom > frame.bottom) setExpanded(true)
            },
          })}
      >
        <View
          ref={innerRef}
          {...(!isWeb && {
            onLayout: (event: { nativeEvent: { layout: { height: number } } }) =>
              setHeight(event.nativeEvent.layout.height),
          })}
        >
          {isTextContent(children) ? <Text>{children}</Text> : children}
        </View>
      </SpoilerContent>
      {overflows ? (
        <Button
          variant="link"
          size="sm"
          // In line with the content: the sm size pads the link variant.
          paddingHorizontal={0}
          aria-expanded={expanded}
          aria-controls={contentId}
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? hideLabel : showLabel}
        </Button>
      ) : null}
    </SpoilerFrame>
  )
})
