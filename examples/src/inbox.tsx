import {
  Avatar,
  Button,
  EmptyState,
  HStack,
  IconButton,
  Indicator,
  List,
  ScrollArea,
  Search,
  Separator,
  Show,
  type TamaguiElement,
  Text,
  Tooltip,
  VStack,
  toast,
  useBackToClose,
  useBreakpointValue,
  useReducedMotion,
} from '@advui/core'
import { ArrowLeftIcon, MailIcon, TrashIcon } from '@advui/icons'
import { type Ref, useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Keyboard } from 'react-native'
import { isWeb } from 'tamagui'
import { SectionTitle, avatarUrl, people } from './shared'

interface Message {
  id: string
  from: (typeof people)[number]
  subject: string
  time: string
  unread: boolean
  body: string[]
}

const inbox: Message[] = [
  {
    id: 'launch-review',
    from: people[0]!,
    subject: 'Launch review moved to Thursday',
    time: '9:41 AM',
    unread: true,
    body: [
      'Legal needs one more day with the new terms, so the launch review moves to Thursday at 2 PM. The room and the agenda stay the same.',
      'If Thursday does not work for you, send me your notes by Wednesday evening and I will present them.',
    ],
  },
  {
    id: 'invoice-1042',
    from: people[1]!,
    subject: 'Invoice #1042 is overdue',
    time: '8:15 AM',
    unread: true,
    body: [
      'Northwind has not paid invoice #1042, which was due last Friday. Their accounts team asked for a copy with the new purchase order number.',
      'Could you send it today? Once it is in, they expect to pay within three working days.',
    ],
  },
  {
    id: 'design-handoff',
    from: people[2]!,
    subject: 'Checkout designs are ready',
    time: 'Yesterday',
    unread: true,
    body: [
      'The final checkout screens are in the shared folder, with the empty, loading and error states for each step.',
      'I would like to walk the team through them on Monday. The address form is the only part that changed since the last review.',
    ],
  },
  {
    id: 'standup-time',
    from: people[3]!,
    subject: 'New standup time from next week',
    time: 'Yesterday',
    unread: false,
    body: [
      'With two people joining from Bangkok, we will hold standup at 9:30 instead of 10:00 from next week.',
      'The calendar invite is updated. Tell me if this clashes with anything.',
    ],
  },
  {
    id: 'survey-results',
    from: people[4]!,
    subject: 'Customer survey results',
    time: 'Mon',
    unread: false,
    body: [
      'We had 412 responses this quarter, up from 280. Satisfaction held steady, and search is still the most requested improvement.',
      'The full report is attached to the team page. I have marked the comments that are worth reading.',
    ],
  },
  {
    id: 'security-audit',
    from: people[1]!,
    subject: 'Security audit findings',
    time: 'Mon',
    unread: false,
    body: [
      'The auditors found nothing critical. Two medium findings are about session length on the admin tools, and both have tickets now.',
      'We should have them closed before the follow-up review next month.',
    ],
  },
  {
    id: 'offsite-plans',
    from: people[0]!,
    subject: 'Team offsite in January',
    time: 'Nov 2',
    unread: false,
    body: [
      'We are looking at the second week of January for the offsite. Please add any dates you cannot make to the shared calendar.',
      'Suggestions for the agenda are welcome. Last year people asked for more time to work together and fewer talks.',
    ],
  },
  {
    id: 'pricing-page',
    from: people[2]!,
    subject: 'Copy for the pricing page',
    time: 'Nov 1',
    unread: false,
    body: [
      'Here is the new copy for the pricing page. I kept the plan names and shortened the feature lists.',
      'Could someone from sales check that the limits are still right?',
    ],
  },
  {
    id: 'mobile-beta',
    from: people[3]!,
    subject: 'Mobile beta, build 214',
    time: 'Oct 30',
    unread: false,
    body: [
      'Build 214 fixes the crash on sign in and the slow first load. It is on the beta track now.',
      'Please try the new offline mode if you can, and send anything odd to the beta channel.',
    ],
  },
  {
    id: 'hiring-update',
    from: people[4]!,
    subject: 'Two offers accepted',
    time: 'Oct 28',
    unread: false,
    body: [
      'Both candidates for the support team accepted. They start on the first of the month.',
      'I will set up their accounts next week, and each of them will need a buddy for the first month.',
    ],
  },
  {
    id: 'office-move',
    from: people[0]!,
    subject: 'Office move checklist',
    time: 'Oct 27',
    unread: false,
    body: [
      'Boxes arrive on Friday. Please label yours with your name and the new desk number.',
      'The checklist has the rest, including what to do with your monitors.',
    ],
  },
  {
    id: 'quarter-close',
    from: people[1]!,
    subject: 'Quarter close dates',
    time: 'Oct 24',
    unread: false,
    body: [
      'Expenses for this quarter need to be in by the 15th. Anything later goes into the next one.',
      'Finance will send a reminder the week before.',
    ],
  },
]

// React Native commits a change to the screen after the JS tree has it. Focused
// sooner, TalkBack loses the view again and starts at the top of the screen.
const nativeFocusDelay = 250

/** Moves keyboard focus on web, and TalkBack or VoiceOver focus on iOS and Android. */
function moveFocus(view: TamaguiElement | null) {
  if (isWeb) (view as HTMLElement | null)?.focus()
  else
    setTimeout(() => {
      if (view?.isConnected) AccessibilityInfo.sendAccessibilityEvent(view as never, 'focus')
    }, nativeFocusDelay)
}

function MessageView({
  message,
  backRef,
  onBack,
  onMarkUnread,
  onDelete,
}: {
  message: Message
  backRef: Ref<TamaguiElement>
  onBack: () => void
  onMarkUnread: () => void
  onDelete: () => void
}) {
  const reducedMotion = useReducedMotion()
  return (
    <VStack
      flex={1}
      transition={reducedMotion ? undefined : { preset: 'quick', properties: 'transform, opacity' }}
      opacity={{ default: 1, enter: 0 }}
      x={{ default: 0, enter: 24 }}
    >
      <HStack gap="2" padding="2" borderBottomWidth={1} borderColor="border">
        <Show below="md">
          <IconButton
            ref={backRef}
            aria-label="Back to inbox"
            icon={<ArrowLeftIcon />}
            onPress={onBack}
          />
        </Show>
        <HStack flex={1} justifyContent="flex-end" gap="1">
          <Tooltip content="Mark as unread">
            <IconButton aria-label="Mark as unread" icon={<MailIcon />} onPress={onMarkUnread} />
          </Tooltip>
          <Tooltip content="Delete">
            <IconButton aria-label="Delete" icon={<TrashIcon />} onPress={onDelete} />
          </Tooltip>
        </HStack>
      </HStack>
      <ScrollArea flex={1} aria-label="Message">
        <VStack gap="4" padding="4 md:6">
          <Text render="h2" size="xl" weight="bold" margin={0} role="heading" aria-level={2}>
            {message.subject}
          </Text>
          <HStack gap="3">
            <Avatar alt={message.from.name} src={avatarUrl(message.from.img)} />
            <VStack flex={1}>
              <Text weight="medium">{message.from.name}</Text>
              <Text size="sm" tone="muted">
                {message.from.email}
              </Text>
            </VStack>
            <Text size="sm" tone="muted">
              {message.time}
            </Text>
          </HStack>
          <Separator />
          {message.body.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
          <Button alignSelf="flex-start" onPress={() => toast('A reply would open here')}>
            Reply
          </Button>
        </VStack>
      </ScrollArea>
    </VStack>
  )
}

/**
 * A list beside its detail from `md` up, and a list that the detail covers on
 * phones. Both panes are always in the tree and CSS chooses what shows, so the
 * server renders the right layout for every width. The list stays under the
 * message, so it keeps its scroll position.
 *
 * The open message is state here because this screen runs under any router.
 * An app keeps its id in the route, so that a link opens one message and the
 * browser's back button returns to the list.
 */
export function InboxScreen() {
  const [messages, setMessages] = useState(inbox)
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const wide = useBreakpointValue({ base: false, md: true })

  const open = messages.find((message) => message.id === openId)
  // Behind the message on a phone: out of reach for the keyboard and screen readers.
  const covered = !!open && !wide

  const search = query.trim().toLowerCase()
  const found = messages.filter((message) =>
    `${message.from.name} ${message.subject}`.toLowerCase().includes(search),
  )
  const unread = messages.filter((message) => message.unread).length

  const listRef = useRef<TamaguiElement>(null)
  const backRef = useRef<TamaguiElement>(null)
  const rowRef = useRef<TamaguiElement>(null)
  const hadMessage = useRef(false)

  useEffect(() => {
    if (openId && !wide) moveFocus(backRef.current)
    else if (!openId && hadMessage.current) {
      // A deleted message took its row with it.
      moveFocus(rowRef.current?.isConnected ? rowRef.current : listRef.current)
    }
    hadMessage.current = !!openId
  }, [openId, wide])

  const close = () => setOpenId(null)
  // Android's back button returns to the list. On a wide screen it leaves the screen.
  useBackToClose(covered, close, { modal: false })

  const openMessage = (message: Message, row: TamaguiElement) => {
    Keyboard.dismiss()
    rowRef.current = row
    setOpenId(message.id)
    setMessages((prev) => prev.map((m) => (m === message ? { ...m, unread: false } : m)))
  }

  const markUnread = (message: Message) => {
    setMessages((prev) => prev.map((m) => (m === message ? { ...m, unread: true } : m)))
    close()
  }

  const remove = (message: Message) => {
    const index = messages.indexOf(message)
    setMessages((prev) => prev.filter((m) => m !== message))
    close()
    toast('Message deleted', {
      action: {
        label: 'Undo',
        onClick: () =>
          setMessages((prev) => [...prev.slice(0, index), message, ...prev.slice(index)]),
      },
    })
  }

  return (
    <HStack
      flex={1}
      alignItems="stretch"
      position="relative"
      overflow="hidden"
      backgroundColor="background"
    >
      {/* Its own stacking context, so a z-index inside (Avatar's) stays under the message. */}
      <VStack
        width="100% md:80 lg:96"
        position="relative"
        zIndex={0}
        {...(isWeb ? { inert: covered } : { 'aria-hidden': covered })}
      >
        <VStack gap="3" padding="4">
          <SectionTitle title="Inbox" description={unread ? `${unread} unread` : 'All read'} />
          <Search
            aria-label="Search messages"
            placeholder="Search messages"
            value={query}
            onValueChange={setQuery}
          />
        </VStack>
        <ScrollArea ref={listRef} flex={1} aria-label="Messages" avoidKeyboard>
          {found.length ? (
            <List divided>
              {found.map((message) => (
                <List.Item
                  key={message.id}
                  selected={message.id === openId}
                  aria-label={`${message.unread ? 'Unread, ' : ''}${message.from.name}, ${message.subject}, ${message.time}`}
                  leading={
                    <Indicator visible={message.unread} overlap="circle">
                      <Avatar size="sm" alt={message.from.name} src={avatarUrl(message.from.img)} />
                    </Indicator>
                  }
                  title={
                    <List.ItemTitle weight={message.unread ? 'bold' : 'medium'}>
                      {message.from.name}
                    </List.ItemTitle>
                  }
                  description={message.subject}
                  trailing={message.time}
                  onPress={(event) =>
                    openMessage(message, event.currentTarget as unknown as TamaguiElement)
                  }
                />
              ))}
            </List>
          ) : (
            <EmptyState
              icon={<MailIcon />}
              title="No messages found"
              description={
                query ? `Nothing matches “${query}”.` : 'New messages will show up here.'
              }
            />
          )}
        </ScrollArea>
      </VStack>
      <Show above="md">
        <Separator orientation="vertical" />
      </Show>
      <VStack
        display={open ? 'flex' : 'none md:flex'}
        position="absolute md:relative"
        top={0}
        right={0}
        bottom={0}
        left={0}
        flex={1}
        backgroundColor="background"
      >
        {open ? (
          <MessageView
            key={open.id}
            message={open}
            backRef={backRef}
            onBack={close}
            onMarkUnread={() => markUnread(open)}
            onDelete={() => remove(open)}
          />
        ) : (
          <VStack flex={1} justifyContent="center">
            <EmptyState
              icon={<MailIcon />}
              title="No message selected"
              description="Choose one from the list to read it here."
              headingLevel={2}
            />
          </VStack>
        )}
      </VStack>
    </HStack>
  )
}
