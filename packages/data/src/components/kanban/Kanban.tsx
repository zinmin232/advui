import {
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AccessibilityInfo } from 'react-native'
import {
  type GetProps,
  type SizeTokens,
  type TamaguiElement,
  View,
  XStack,
  isWeb,
  styled,
} from 'tamagui/unstyled'
import {
  Badge,
  Portal,
  ScrollArea,
  Text,
  VisuallyHidden,
  shadows,
  useControllableState,
  useRipple,
} from '@advui/core'
import { type KanbanColumn, type KanbanItem, type KanbanMove, findItem, moveItem } from './moves'
import type { DragTarget } from './place'
import { useDrag } from './useDrag'

export interface KanbanLabels {
  /** Read with each card on web: how to move it with the keyboard. */
  instructions: string
  /** Names a column's list: its title and card count. */
  column: (title: string, count: number) => string
  /** Shown in a column with no cards. */
  empty: string
  pickedUp: (item: string, column: string, position: number, count: number) => string
  moved: (item: string, column: string, position: number, count: number) => string
  dropped: (item: string, column: string, position: number, count: number) => string
  cancelled: (item: string) => string
  /** Screen reader actions on iOS and Android. */
  moveUp: string
  moveDown: string
  moveTo: (column: string) => string
}

const defaultLabels: KanbanLabels = {
  instructions:
    'Press Space to pick the card up. Then the arrow keys move it, Space drops it and Escape puts it back.',
  column: (title, count) => `${title}, ${count === 1 ? '1 card' : `${count} cards`}`,
  empty: 'No cards',
  pickedUp: (item, column, position, count) =>
    `Picked up ${item}. ${column}, position ${position} of ${count}.`,
  moved: (item, column, position, count) => `${item}: ${column}, position ${position} of ${count}.`,
  dropped: (item, column, position, count) =>
    `Dropped ${item} in ${column}, position ${position} of ${count}.`,
  cancelled: (item) => `${item} is back where it was.`,
  moveUp: 'Move up',
  moveDown: 'Move down',
  moveTo: (column) => `Move to ${column}`,
}

const KanbanFrame = styled(View, {
  displayName: 'Kanban',
})

const ColumnFrame = styled(View, {
  displayName: 'KanbanColumn',
  flexShrink: 0,
  gap: '2',
  padding: '2',
  borderRadius: 'lg',
  backgroundColor: 'muted',
})

export const KanbanCardFrame = styled(View, {
  displayName: 'KanbanCard',
  gap: '1',
  padding: '3',
  borderRadius: 'lg',
  borderWidth: 1,
  borderColor: 'border',
  backgroundColor: 'card',
  outlineColor: 'focus-visible:ring',
  outlineStyle: 'focus-visible:solid',
  outlineWidth: 'focus-visible:2px',
  outlineOffset: 'focus-visible:2px',
  variants: {
    state: {
      rest: {},
      // Picked up with the keyboard: it moves with the arrow keys.
      lifted: { borderColor: 'primary' },
      // Where a dragged card will land: the card itself follows the pointer.
      placeholder: { backgroundColor: 'primarySoft', borderColor: 'primary' },
    },
    movable: {
      true: { cursor: 'grab' },
    },
  } as const,
  defaultVariants: { state: 'rest' },
})

type Drag = {
  itemId: string
  columnId: string
  index: number
  from: { columnId: string; index: number }
  mode: 'keyboard' | 'pointer'
}

export interface KanbanProps<T extends KanbanItem = KanbanItem> extends Omit<
  GetProps<typeof KanbanFrame>,
  'children' | 'defaultValue' | 'columnWidth'
> {
  /** The columns and their cards (controlled). */
  value?: KanbanColumn<T>[]
  defaultValue?: KanbanColumn<T>[]
  /** Called with the columns after a card moves. */
  onValueChange?: (columns: KanbanColumn<T>[]) => void
  /** Called after a card moves, with where from and where to. */
  onItemMove?: (move: KanbanMove) => void
  /** Makes cards open on a press (or Enter). */
  onItemPress?: (item: T) => void
  /**
   * Called when a card is picked up. On iOS and Android, a board inside a
   * scroll view that is not Adv UI's (ScrollArea, AppShell) should stop it
   * here (`scrollEnabled={false}`), or a quick first move scrolls the screen.
   */
  onItemDragStart?: (item: T) => void
  /** Called when a picked-up card is dropped or put back. */
  onItemDragEnd?: (item: T) => void
  /** Draws a card's content. Default: its title and description. */
  renderItem?: (item: T) => ReactNode
  /** Width of each column. Default `72`. */
  columnWidth?: SizeTokens | number
  /** Names the board. Recommended. */
  'aria-label'?: string
  labels?: Partial<KanbanLabels>
  ref?: Ref<TamaguiElement>
}

/**
 * Cards in columns that people move by dragging, with the keyboard, or with
 * screen reader actions on iOS and Android, such as tasks through stages.
 */
export function Kanban<T extends KanbanItem = KanbanItem>({
  value,
  defaultValue = [],
  onValueChange,
  onItemMove,
  onItemPress,
  onItemDragStart,
  onItemDragEnd,
  renderItem,
  columnWidth = '72',
  'aria-label': label,
  labels: labelsProp,
  ref,
  ...props
}: KanbanProps<T>) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [columns, setColumns] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const [drag, setDrag] = useState<Drag | null>(null)
  const dragRef = useRef(drag)
  dragRef.current = drag
  // The board as the drag would leave it: the card sits at its new place.
  const preview = drag ? moveItem(columns, drag.itemId, drag.columnId, drag.index) : columns
  const previewRef = useRef<readonly KanbanColumn<T>[]>(preview)
  previewRef.current = preview
  const draggingId = useRef<string | null>(null)
  draggingId.current = drag?.itemId ?? null

  const boardRef = useRef<TamaguiElement>(null)
  const columnNodes = useRef(new Map<string, TamaguiElement>())
  const cardNodes = useRef(new Map<string, TamaguiElement>())
  const instructionsId = useId()
  // An id for each card's description; item ids may hold spaces, which a
  // list of ids cannot.
  const descriptionIds = useRef(new Map<string, string>())
  const descriptionId = (itemId: string) => {
    let id = descriptionIds.current.get(itemId)
    if (!id)
      descriptionIds.current.set(itemId, (id = `${instructionsId}-${descriptionIds.current.size}`))
    return id
  }
  const [message, setMessage] = useState({ text: '', key: 0 })
  const announce = (text: string) => {
    if (isWeb) setMessage((current) => ({ text, key: current.key + 1 }))
    else AccessibilityInfo.announceForAccessibility(text)
  }

  // A card that moved to another column mounts again there: give it focus
  // back. After a pointer drag without scrolling: the card is in view.
  const focusAfter = useRef<{ id: string; scroll: boolean } | null>(null)
  const focusTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useLayoutEffect(() => {
    if (!focusAfter.current) return
    const { id, scroll } = focusAfter.current
    focusAfter.current = null
    if (isWeb) {
      ;(cardNodes.current.get(id) as HTMLElement | undefined)?.focus({ preventScroll: !scroll })
      return
    }
    // Native: once the old view has left the screen, or TalkBack loses focus again.
    clearTimeout(focusTimer.current)
    focusTimer.current = setTimeout(() => {
      const node = cardNodes.current.get(id) as { isConnected?: boolean } | undefined
      if (node?.isConnected !== false)
        AccessibilityInfo.sendAccessibilityEvent(node as never, 'focus')
    }, 250)
  })
  useEffect(() => () => clearTimeout(focusTimer.current), [])

  const place = (target: { columnId: string; index: number }, list = previewRef.current) => {
    const column = list.find((c) => c.id === target.columnId)!
    return [column.title, target.index + 1, column.items.length] as const
  }

  const start = (itemId: string, mode: Drag['mode']) => {
    const found = findItem(columns, itemId)
    if (!found || found.item.disabled) return
    const from = { columnId: found.column.id, index: found.index }
    const next = { itemId, mode, ...from, from }
    // Now, not on the next render: the move that started a drag is placed too.
    dragRef.current = next
    draggingId.current = itemId
    setDrag(next)
    onItemDragStart?.(found.item)
    if (mode === 'keyboard') announce(labels.pickedUp(found.item.title, ...place(from, columns)))
  }

  const over = (target: DragTarget, spoken: boolean) => {
    const current = dragRef.current
    if (!current || (current.columnId === target.columnId && current.index === target.index)) return
    const next = { ...current, ...target }
    dragRef.current = next
    setDrag(next)
    // A pointer drag refocuses the card once, when it drops.
    if (current.mode === 'keyboard' && current.columnId !== target.columnId) {
      focusAfter.current = { id: current.itemId, scroll: true }
    }
    if (spoken) {
      const item = findItem(columns, current.itemId)!.item
      announce(
        labels.moved(
          item.title,
          ...place(target, moveItem(columns, item.id, target.columnId, target.index)),
        ),
      )
    }
  }

  const commit = (itemId: string, from: Drag['from'], to: DragTarget) => {
    const next = moveItem(columns, itemId, to.columnId, to.index)
    if (from.columnId !== to.columnId || from.index !== to.index) {
      setColumns(next)
      onItemMove?.({ itemId, from, to })
    }
    return next
  }

  const drop = () => {
    const current = dragRef.current
    if (!current) return
    dragRef.current = null
    setDrag(null)
    const to = { columnId: current.columnId, index: current.index }
    const next = commit(current.itemId, current.from, to)
    const item = findItem(next, current.itemId)!.item
    onItemDragEnd?.(item)
    announce(labels.dropped(item.title, ...place(to, next)))
    focusAfter.current = { id: current.itemId, scroll: current.mode === 'keyboard' }
  }

  const cancel = () => {
    const current = dragRef.current
    if (!current) return
    dragRef.current = null
    setDrag(null)
    const item = findItem(columns, current.itemId)!.item
    onItemDragEnd?.(item)
    announce(labels.cancelled(item.title))
    if (current.columnId !== current.from.columnId) {
      focusAfter.current = { id: current.itemId, scroll: current.mode === 'keyboard' }
    }
  }

  const pointer = useDrag({
    preview: previewRef,
    draggingId,
    board: boardRef,
    columns: columnNodes,
    cards: cardNodes,
    canDrag: (itemId) => !dragRef.current && !findItem(columns, itemId)?.item.disabled,
    onStart: (itemId) => start(itemId, 'pointer'),
    onOver: (target) => over(target, false),
    onDrop: drop,
    onCancel: cancel,
  })

  type CardKey = { key: string; preventDefault: () => void }
  const onCardKeyDown = (item: T, event: CardKey) => {
    const current = dragRef.current
    if (current?.mode === 'keyboard' && current.itemId === item.id) {
      const columnIndex = columns.findIndex((column) => column.id === current.columnId)
      const count = previewRef.current[columnIndex]!.items.length
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault()
          const index = current.index + (event.key === 'ArrowUp' ? -1 : 1)
          if (index >= 0 && index < count) over({ columnId: current.columnId, index }, true)
          return
        }
        case 'ArrowLeft':
        case 'ArrowRight': {
          event.preventDefault()
          const column = columns[columnIndex + (event.key === 'ArrowLeft' ? -1 : 1)]
          if (!column) return
          const others = column.items.filter((other) => other.id !== item.id).length
          over({ columnId: column.id, index: Math.min(current.index, others) }, true)
          return
        }
        case ' ':
        case 'Enter':
          event.preventDefault()
          return drop()
        case 'Escape':
          event.preventDefault()
          return cancel()
      }
      return
    }
    if (current) return
    if (event.key === 'Enter' && onItemPress) {
      event.preventDefault()
      onItemPress(item)
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      start(item.id, 'keyboard')
    }
  }

  // Native screen readers: each card's actions move it one step.
  const moveBy = (item: T, action: string) => {
    const found = findItem(columns, item.id)
    if (!found) return
    const columnIndex = columns.indexOf(found.column)
    const from = { columnId: found.column.id, index: found.index }
    let to: DragTarget | null = null
    if (action === 'moveUp') to = { ...from, index: from.index - 1 }
    if (action === 'moveDown') to = { ...from, index: from.index + 1 }
    if (action === 'moveLeft' || action === 'moveRight') {
      const column = columns[columnIndex + (action === 'moveLeft' ? -1 : 1)]
      if (column) to = { columnId: column.id, index: Math.min(from.index, column.items.length) }
    }
    if (!to || to.index < 0) return
    const next = commit(item.id, from, to)
    announce(labels.moved(item.title, ...place(to, next)))
    focusAfter.current = { id: item.id, scroll: true }
  }

  const setRefs = (node: TamaguiElement | null) => {
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const draggedItem = drag ? findItem(columns, drag.itemId)?.item : undefined

  return (
    <KanbanFrame ref={setRefs} {...props}>
      <ScrollArea
        ref={boardRef}
        orientation="horizontal"
        aria-label={label}
        // Native: the board stays put while a card is dragged.
        {...(!isWeb && drag && { scrollEnabled: false })}
      >
        <XStack
          gap="3"
          alignItems="flex-start"
          {...(isWeb && drag?.mode === 'pointer' && { userSelect: 'none', cursor: 'grabbing' })}
          {...pointer.boardProps}
        >
          {preview.map((column, columnIndex) => (
            <ColumnFrame key={column.id} width={columnWidth}>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap="2"
                minHeight="7"
                paddingHorizontal="1"
              >
                <Text size="sm" weight="semibold" numberOfLines={1} flexShrink={1}>
                  {column.title}
                </Text>
                {/* The list's name has the count. */}
                <Badge size="sm" variant="secondary" aria-hidden>
                  {column.items.length}
                </Badge>
              </XStack>
              <View
                ref={(node: TamaguiElement | null) => {
                  if (node) columnNodes.current.set(column.id, node)
                  else columnNodes.current.delete(column.id)
                }}
                // A list needs items: an empty column is a named group.
                role={(isWeb ? (column.items.length ? 'list' : 'group') : undefined) as never}
                {...(isWeb && {
                  'aria-label': labels.column(column.title, column.items.length),
                })}
                gap="2"
                minHeight="16"
                {...pointer.columnProps(column.id)}
              >
                {column.items.map((item, index) => {
                  const state =
                    drag?.itemId !== item.id
                      ? 'rest'
                      : drag.mode === 'keyboard'
                        ? 'lifted'
                        : 'placeholder'
                  return (
                    <View
                      key={item.id}
                      role={(isWeb ? 'listitem' : undefined) as never}
                      {...pointer.cardLayout(item.id, column.id)}
                    >
                      <KanbanCard
                        item={item}
                        state={state}
                        cardRef={(node) => {
                          if (node) cardNodes.current.set(item.id, node)
                          else if (cardNodes.current.get(item.id) === node) {
                            cardNodes.current.delete(item.id)
                          }
                        }}
                        // The default card is named by its title and
                        // described by its description; a custom one is
                        // named by its content.
                        name={renderItem ? undefined : item.title}
                        describedBy={
                          [
                            !renderItem && item.description && descriptionId(item.id),
                            !item.disabled && instructionsId,
                          ]
                            .filter(Boolean)
                            .join(' ') || undefined
                        }
                        onPress={
                          onItemPress
                            ? () => {
                                if (!pointer.consumePress() && !dragRef.current) onItemPress(item)
                              }
                            : undefined
                        }
                        onKeyDown={(event) => onCardKeyDown(item, event)}
                        onBlur={() => {
                          // Focus left a card picked up with the keyboard:
                          // put it back. A card that moved to another column
                          // has focus again by now.
                          setTimeout(() => {
                            const current = dragRef.current
                            if (current?.mode !== 'keyboard' || current.itemId !== item.id) return
                            if (document.activeElement !== cardNodes.current.get(item.id)) cancel()
                          })
                        }}
                        actions={
                          item.disabled
                            ? undefined
                            : [
                                ...(index > 0 ? [{ name: 'moveUp', label: labels.moveUp }] : []),
                                ...(index < column.items.length - 1
                                  ? [{ name: 'moveDown', label: labels.moveDown }]
                                  : []),
                                ...(columns[columnIndex - 1]
                                  ? [
                                      {
                                        name: 'moveLeft',
                                        label: labels.moveTo(columns[columnIndex - 1]!.title),
                                      },
                                    ]
                                  : []),
                                ...(columns[columnIndex + 1]
                                  ? [
                                      {
                                        name: 'moveRight',
                                        label: labels.moveTo(columns[columnIndex + 1]!.title),
                                      },
                                    ]
                                  : []),
                              ]
                        }
                        onAction={(action) => moveBy(item, action)}
                        dragProps={item.disabled ? {} : pointer.cardProps(item.id)}
                      >
                        {renderItem ? (
                          renderItem(item)
                        ) : (
                          <DefaultContent item={item} descriptionId={descriptionId(item.id)} />
                        )}
                      </KanbanCard>
                    </View>
                  )
                })}
                {column.items.length === 0 ? (
                  <View alignItems="center" justifyContent="center" padding="4">
                    <Text size="xs" tone="muted">
                      {labels.empty}
                    </Text>
                  </View>
                ) : null}
              </View>
            </ColumnFrame>
          ))}
        </XStack>
      </ScrollArea>
      {isWeb ? (
        <>
          <VisuallyHidden id={instructionsId}>{labels.instructions}</VisuallyHidden>
          <VisuallyHidden role="status" aria-live="assertive">
            {message.text ? <Text key={message.key}>{message.text}</Text> : null}
          </VisuallyHidden>
        </>
      ) : null}
      {pointer.overlay && draggedItem ? (
        <Portal zIndex="popover">
          <View
            position="absolute"
            left={pointer.overlay.x - pointer.overlay.dx}
            top={pointer.overlay.y - pointer.overlay.dy}
            width={pointer.overlay.width}
            pointerEvents="none"
            aria-hidden
          >
            <KanbanCardFrame {...shadows.md} {...(isWeb && { cursor: 'grabbing' })}>
              {renderItem ? renderItem(draggedItem) : <DefaultContent item={draggedItem} />}
            </KanbanCardFrame>
          </View>
        </Portal>
      ) : null}
    </KanbanFrame>
  )
}

function DefaultContent({ item, descriptionId }: { item: KanbanItem; descriptionId?: string }) {
  return (
    <>
      <Text size="sm" weight="medium">
        {item.title}
      </Text>
      {item.description ? (
        <Text id={descriptionId} size="xs" tone="muted" numberOfLines={3}>
          {item.description}
        </Text>
      ) : null}
    </>
  )
}

type AccessibilityAction = { name: string; label: string }

function KanbanCard({
  item,
  state,
  cardRef,
  name,
  describedBy,
  onPress,
  onKeyDown,
  onBlur,
  actions,
  onAction,
  dragProps,
  children,
}: {
  item: KanbanItem
  state: 'rest' | 'lifted' | 'placeholder'
  cardRef: (node: TamaguiElement | null) => void
  name: string | undefined
  describedBy: string | undefined
  onPress: (() => void) | undefined
  onKeyDown: (event: { key: string; preventDefault: () => void }) => void
  onBlur: () => void
  actions: AccessibilityAction[] | undefined
  onAction: (action: string) => void
  dragProps: Record<string, unknown>
  children: ReactNode
}) {
  const movable = !item.disabled
  // The drag's own onPressOut runs too.
  const ripple = useRipple({
    color: 'foreground',
    radius: 'lg',
    disabled: !onPress,
    onPressOut: dragProps.onPressOut as never,
  })
  return (
    <KanbanCardFrame
      ref={cardRef}
      state={state}
      movable={movable}
      role="button"
      {...(name && {
        // iOS and Android have no descriptions: the description joins the name.
        'aria-label': !isWeb && item.description ? `${name}, ${item.description}` : name,
      })}
      {...(isWeb
        ? {
            tabIndex: 0,
            'aria-describedby': describedBy,
            // So a drag never selects text, nor opens a long-press menu.
            userSelect: 'none',
            onKeyDown,
            onBlur,
          }
        : {
            accessible: true,
            ...(actions?.length && {
              accessibilityActions: actions,
              onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) =>
                onAction(event.nativeEvent.actionName),
            }),
          })}
      {...(state === 'lifted' && shadows.md)}
      {...(onPress && { onPress })}
      {...(ripple.active && { backgroundColor: 'press:card' })}
      {...dragProps}
      {...ripple.props}
    >
      {ripple.element}
      {/* The placeholder keeps the card's size, with nothing in it. */}
      <View gap="1" {...(state === 'placeholder' && { opacity: 0 })}>
        {children}
      </View>
    </KanbanCardFrame>
  )
}
