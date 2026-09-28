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
  XStack,
  styled,
  withStaticProperties,
} from 'tamagui'
import { Text } from '../typography/Text'

export type TimelineTone = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'

// The last item draws no line below its marker.
const ItemPosition = createContext({ last: true })

const TimelineFrame = styled(View, {
  name: 'Timeline',
  role: 'list',
  flexDirection: 'column',
})

const TimelineItemFrame = styled(View, {
  name: 'TimelineItem',
  role: 'listitem',
  flexDirection: 'row',
  gap: '$3',
})

const TimelineConnector = styled(View, {
  name: 'TimelineConnector',
  flex: 1,
  width: 2,
  minHeight: '$4',
  marginVertical: '$1',
  borderRadius: '$full',
  backgroundColor: '$border',
})

const TimelineTitle = styled(Text, {
  name: 'TimelineTitle',
  size: 'sm',
  weight: 'medium',
})

const TimelineTime = styled(Text, {
  name: 'TimelineTime',
  size: 'xs',
  tone: 'muted',
})

const TimelineDescription = styled(Text, {
  name: 'TimelineDescription',
  size: 'sm',
  tone: 'muted',
})

const tones = {
  default: { dot: '$borderStrong', soft: '$muted', icon: '$mutedForeground' },
  primary: { dot: '$primary', soft: '$primarySoft', icon: '$primarySoftForeground' },
  success: { dot: '$success', soft: '$successSoft', icon: '$successSoftForeground' },
  warning: { dot: '$warning', soft: '$warningSoft', icon: '$warningSoftForeground' },
  error: { dot: '$error', soft: '$errorSoft', icon: '$errorSoftForeground' },
  info: { dot: '$info', soft: '$infoSoft', icon: '$infoSoftForeground' },
} as const

export type TimelineProps = GetProps<typeof TimelineFrame>

const TimelineImpl = forwardRef<TamaguiElement, TimelineProps>(function Timeline(
  { children, ...props },
  ref,
) {
  const items = Children.toArray(children)
  return (
    <TimelineFrame ref={ref} {...props}>
      {items.map((child, index) => (
        <ItemPosition.Provider
          key={isValidElement(child) && child.key != null ? child.key : index}
          value={{ last: index === items.length - 1 }}
        >
          {child}
        </ItemPosition.Provider>
      ))}
    </TimelineFrame>
  )
})

export interface TimelineItemProps extends Omit<
  GetProps<typeof TimelineItemFrame>,
  'children' | 'title'
> {
  /** What happened. */
  title: ReactNode
  /** When it happened, already formatted. */
  time?: ReactNode
  /** Details under the title. */
  description?: ReactNode
  /** Icon in the marker. Without one, the marker is a dot. */
  icon?: ReactNode
  /** Color of the marker. */
  tone?: TimelineTone
  /** Extra content under the description: a Card, a quote, attachments. */
  children?: ReactNode
}

/** One event: a marker on the line, a title and time, and details. */
const TimelineItem = forwardRef<TamaguiElement, TimelineItemProps>(function TimelineItem(
  { title, time, description, icon, tone = 'default', children, ...props },
  ref,
) {
  const { last } = useContext(ItemPosition)
  const colors = tones[tone]
  return (
    <TimelineItemFrame ref={ref} {...props}>
      <View aria-hidden alignItems="center" width="$6">
        <View height="$6" width="$6" alignItems="center" justifyContent="center">
          {icon ? (
            <View
              width="$6"
              height="$6"
              borderRadius="$full"
              alignItems="center"
              justifyContent="center"
              backgroundColor={colors.soft}
            >
              <IconDefaults size={14} color={colors.icon}>
                {icon}
              </IconDefaults>
            </View>
          ) : (
            <View width="$2.5" height="$2.5" borderRadius="$full" backgroundColor={colors.dot} />
          )}
        </View>
        {last ? null : <TimelineConnector />}
      </View>
      <View flex={1} minWidth={0} gap="$1" paddingBottom={last ? '$0' : '$6'}>
        <XStack
          minHeight="$6"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          columnGap="$2"
        >
          <TimelineTitle>{title}</TimelineTitle>
          {time != null ? <TimelineTime>{time}</TimelineTime> : null}
        </XStack>
        {description != null ? <TimelineDescription>{description}</TimelineDescription> : null}
        {children}
      </View>
    </TimelineItemFrame>
  )
})

/**
 * Events in order along a vertical line: an activity feed, an order's
 * progress, a project history. Compose with `Timeline.Item`.
 */
export const Timeline = withStaticProperties(TimelineImpl, {
  Item: TimelineItem,
})

export { TimelineFrame, TimelineItemFrame, TimelineTitle, TimelineTime, TimelineDescription }
