import { GripHorizontalIcon, GripVerticalIcon } from '@advui/icons'
import {
  Children,
  type ReactElement,
  type ReactNode,
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { PanResponder } from 'react-native'
import { type GetProps, View, isWeb, withStaticProperties } from 'tamagui'
import { useControllableState } from '../../hooks/useControllableState'

export type ResizableDirection = 'horizontal' | 'vertical'

export interface ResizableLabels {
  /** Name of a handle when it has no `aria-label`. Default: "Resize". */
  handle: string
}

interface PanelConstraints {
  min: number
  max: number
  collapsible: boolean
  collapsedSize: number
}

interface ResizableContextValue {
  direction: ResizableDirection
  sizes: number[]
  panelId: (index: number) => string
  /** Group length along the direction, in pixels (0 until measured). */
  length: number
  constraints: PanelConstraints[]
  keyboardStep: number
  resize: (handle: number, sizeBefore: number) => void
  toggle: (handle: number) => void
  commit: () => void
  handleLabel: string
}

const ResizableContext = createContext<ResizableContextValue | null>(null)
const IndexContext = createContext(0)

function useResizable() {
  const context = useContext(ResizableContext)
  if (!context) throw new Error('Resizable.Panel and Resizable.Handle must be inside Resizable.')
  return context
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value * 100) / 100

/**
 * The sizes after moving handle `i` so the panel before it is `target`% of
 * the group: only the two neighbours change. A collapsible panel dragged
 * below half its minimum snaps shut.
 */
export function resizePanels(
  sizes: number[],
  i: number,
  target: number,
  constraints: PanelConstraints[],
): number[] {
  const a = constraints[i]!
  const b = constraints[i + 1]!
  const total = sizes[i]! + sizes[i + 1]!
  const low = Math.max(a.min, total - b.max)
  const high = Math.min(a.max, total - b.min)
  let before: number
  if (a.collapsible && target < a.min / 2) before = a.collapsedSize
  else if (b.collapsible && total - target < b.min / 2) before = total - b.collapsedSize
  else before = clamp(target, low, Math.max(low, high))
  const next = [...sizes]
  next[i] = round(before)
  next[i + 1] = round(total - before)
  return next
}

type PanelElement = ReactElement<ResizablePanelProps>

export interface ResizableProps extends Omit<GetProps<typeof View>, 'direction'> {
  /** `horizontal` puts panels side by side; `vertical` stacks them. Default: horizontal. */
  direction?: ResizableDirection
  /** Panel sizes in percent (controlled). Otherwise each panel's `defaultSize`. */
  sizes?: number[]
  onSizesChange?: (sizes: number[]) => void
  /** Called once a drag or key press ends, e.g. to save the layout. */
  onSizesCommit?: (sizes: number[]) => void
  /** Percent moved by one arrow key press. Default: 5. */
  keyboardStep?: number
  labels?: Partial<ResizableLabels>
  children: ReactNode
}

function ResizableRoot({
  direction = 'horizontal',
  sizes: sizesProp,
  onSizesChange,
  onSizesCommit,
  keyboardStep = 5,
  labels,
  children,
  ...props
}: ResizableProps) {
  const items = Children.toArray(children).filter(isValidElement)
  const panels = items.filter((item): item is PanelElement => item.type === ResizablePanel)
  const constraints = panels.map(({ props: p }) => ({
    min: p.minSize ?? 0,
    max: p.maxSize ?? 100,
    collapsible: p.collapsible ?? false,
    collapsedSize: p.collapsedSize ?? 0,
  }))

  // Panels without a defaultSize share what the others leave.
  const initial = useMemo(() => {
    const given = panels.map((panel) => panel.props.defaultSize)
    const rest = 100 - given.reduce<number>((sum, size) => sum + (size ?? 0), 0)
    const open = given.filter((size) => size == null).length
    return given.map((size) => size ?? rest / Math.max(1, open))
    // Only the first render's defaults matter, like `defaultValue`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [sizes, setSizes] = useControllableState<number[]>({
    value: sizesProp,
    defaultValue: initial,
    onChange: onSizesChange,
  })
  const sizesRef = useRef(sizes)
  sizesRef.current = sizes
  // Sizes before a collapse, so Enter can restore them.
  const restore = useRef<Record<number, number>>({})
  const [length, setLength] = useState(0)
  const baseId = useId()

  const context: ResizableContextValue = {
    direction,
    sizes,
    panelId: (index) => `${baseId}-panel-${index}`,
    length,
    constraints,
    keyboardStep,
    handleLabel: labels?.handle ?? 'Resize',
    resize: (handle, sizeBefore) => {
      const next = resizePanels(sizesRef.current, handle, sizeBefore, constraints)
      if (next.some((size, i) => size !== sizesRef.current[i])) {
        sizesRef.current = next
        setSizes(next)
      }
    },
    toggle: (handle) => {
      const current = sizesRef.current
      const a = constraints[handle]!
      if (!a.collapsible) return
      const collapsed = current[handle]! <= a.collapsedSize
      const target = collapsed
        ? (restore.current[handle] ?? Math.max(a.min, 100 / panels.length))
        : a.collapsedSize
      if (!collapsed) restore.current[handle] = current[handle]!
      const next = resizePanels(current, handle, target, constraints)
      sizesRef.current = next
      setSizes(next)
      onSizesCommit?.(next)
    },
    commit: () => onSizesCommit?.(sizesRef.current),
  }

  let panelIndex = -1
  let handleIndex = -1
  return (
    <ResizableContext.Provider value={context}>
      <View
        flexDirection={direction === 'horizontal' ? 'row' : 'column'}
        width="100%"
        overflow="hidden"
        onLayout={(event: { nativeEvent: { layout: { width: number; height: number } } }) => {
          const { width, height } = event.nativeEvent.layout
          setLength(direction === 'horizontal' ? width : height)
        }}
        {...props}
      >
        {items.map((item, i) => {
          if (item.type === ResizablePanel) panelIndex += 1
          else if (item.type === ResizableHandle) handleIndex += 1
          else return item
          return (
            <IndexContext.Provider
              key={item.key ?? i}
              value={item.type === ResizablePanel ? panelIndex : handleIndex}
            >
              {item}
            </IndexContext.Provider>
          )
        })}
      </View>
    </ResizableContext.Provider>
  )
}

export interface ResizablePanelProps extends GetProps<typeof View> {
  /** Starting size in percent of the group. Default: an equal share of what is left. */
  defaultSize?: number
  /** Percent. Default: 0. */
  minSize?: number
  /** Percent. Default: 100. */
  maxSize?: number
  /** Dragging below half of `minSize`, or Enter on its handle, collapses it. */
  collapsible?: boolean
  /** Size when collapsed, in percent. Default: 0. */
  collapsedSize?: number
  children?: ReactNode
}

function ResizablePanel({
  defaultSize: _defaultSize,
  minSize: _minSize,
  maxSize: _maxSize,
  collapsible: _collapsible,
  collapsedSize: _collapsedSize,
  children,
  ...props
}: ResizablePanelProps) {
  const { sizes, panelId, direction } = useResizable()
  const index = useContext(IndexContext)
  const size = sizes[index] ?? 0
  // A panel collapsed to nothing leaves the tab order too.
  const hidden = size === 0
  return (
    <View
      id={panelId(index)}
      // Sizes are shares of the group: flex-grow does the arithmetic.
      flexGrow={size}
      flexShrink={1}
      flexBasis={0}
      {...(direction === 'horizontal' ? { minWidth: 0 } : { minHeight: 0 })}
      overflow="hidden"
      {...(hidden && { display: 'none' as const })}
      {...props}
    >
      {children}
    </View>
  )
}

export interface ResizableHandleProps {
  /** Shows a grip, a hint that the edge can be dragged. */
  withHandle?: boolean
  /** Names the handle by what it resizes, e.g. "Resize sidebar". */
  'aria-label'?: string
  disabled?: boolean
}

/** Web: pointer events with capture. Native: a PanResponder. Both report the offset in pixels. */
function useDrag(
  onStart: (group?: HTMLElement | null) => void,
  onMove: (offset: number) => void,
  onEnd: () => void,
) {
  const handlers = useRef({ onStart, onMove, onEnd })
  handlers.current = { onStart, onMove, onEnd }
  const origin = useRef<{ x: number; y: number } | null>(null)
  const horizontalRef = useRef(true)

  const native = useMemo(
    () =>
      isWeb
        ? null
        : PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            // Keep the drag when the finger drifts over a scroll view.
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: () => handlers.current.onStart(),
            onPanResponderMove: (_, gesture) =>
              handlers.current.onMove(horizontalRef.current ? gesture.dx : gesture.dy),
            onPanResponderRelease: () => handlers.current.onEnd(),
            onPanResponderTerminate: () => handlers.current.onEnd(),
          }),
    [],
  )

  return (horizontal: boolean) => {
    horizontalRef.current = horizontal
    if (native) return native.panHandlers
    type Pointer = {
      clientX: number
      clientY: number
      pointerId: number
      currentTarget: HTMLElement
      preventDefault: () => void
    }
    return {
      onPointerDown: (event: Pointer) => {
        // No text selection while dragging; focus stays with the handle.
        event.preventDefault()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        origin.current = { x: event.clientX, y: event.clientY }
        handlers.current.onStart(event.currentTarget.parentElement)
      },
      onPointerMove: (event: Pointer) => {
        if (!origin.current) return
        handlers.current.onMove(
          horizontal ? event.clientX - origin.current.x : event.clientY - origin.current.y,
        )
      },
      onPointerUp: (event: Pointer) => {
        if (!origin.current) return
        origin.current = null
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        handlers.current.onEnd()
      },
    }
  }
}

function ResizableHandle({
  withHandle = false,
  'aria-label': ariaLabel,
  disabled = false,
}: ResizableHandleProps) {
  const {
    direction,
    sizes,
    panelId,
    length,
    constraints,
    keyboardStep,
    resize,
    toggle,
    commit,
    handleLabel,
  } = useResizable()
  const index = useContext(IndexContext)
  const horizontal = direction === 'horizontal'
  const size = sizes[index] ?? 0
  const a = constraints[index]
  const b = constraints[index + 1]
  const total = size + (sizes[index + 1] ?? 0)
  const min = Math.round(
    a && b ? Math.max(a.collapsible ? a.collapsedSize : a.min, total - b.max) : 0,
  )
  const max = Math.round(
    a && b ? Math.min(a.max, total - (b.collapsible ? b.collapsedSize : b.min)) : 100,
  )
  const start = useRef({ size, length })
  const [dragging, setDragging] = useState(false)

  const drag = useDrag(
    (group) => {
      // Web measures the group as the drag starts; native has it from onLayout.
      const measured = group ? (horizontal ? group.offsetWidth : group.offsetHeight) : 0
      start.current = { size: sizes[index] ?? 0, length: measured || length }
      setDragging(true)
    },
    (offset) => {
      const { size: from, length: total } = start.current
      if (total > 0) resize(index, from + (offset / total) * 100)
    },
    () => {
      setDragging(false)
      commit()
    },
  )

  const step = (delta: number) => {
    resize(index, size + delta)
    commit()
  }

  const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
    const back = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const forward = horizontal ? 'ArrowRight' : 'ArrowDown'
    if (event.key === back || event.key === forward) {
      event.preventDefault()
      step(event.key === forward ? keyboardStep : -keyboardStep)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      resize(index, event.key === 'Home' ? 0 : 100)
      commit()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      toggle(index)
    }
  }

  const label = ariaLabel ?? handleLabel
  const Grip = horizontal ? GripVerticalIcon : GripHorizontalIcon

  return (
    <View
      {...(isWeb
        ? {
            role: 'separator',
            tabIndex: disabled ? -1 : 0,
            'aria-orientation': horizontal ? 'vertical' : 'horizontal',
            'aria-valuenow': Math.round(size),
            'aria-valuemin': min,
            'aria-valuemax': max,
            'aria-valuetext': `${Math.round(size)}%`,
            'aria-controls': panelId(index),
            'aria-disabled': disabled || undefined,
            onKeyDown: disabled ? undefined : onKeyDown,
          }
        : {
            accessible: true,
            accessibilityRole: 'adjustable',
            accessibilityValue: { min, max, now: Math.round(size), text: `${Math.round(size)}%` },
            accessibilityActions: [
              { name: 'increment' },
              { name: 'decrement' },
              ...(a?.collapsible ? [{ name: 'activate' }] : []),
            ],
            onAccessibilityAction: (event: { nativeEvent: { actionName: string } }) => {
              const action = event.nativeEvent.actionName
              if (action === 'activate') toggle(index)
              else step(action === 'increment' ? keyboardStep : -keyboardStep)
            },
            // A 1px line is too thin to grab: widen the touch target.
            hitSlop: horizontal ? { left: 16, right: 16 } : { top: 16, bottom: 16 },
          })}
      aria-label={label}
      {...(disabled ? {} : drag(horizontal))}
      position="relative"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      backgroundColor={dragging ? '$ring' : '$border'}
      {...(horizontal ? { width: 1 } : { height: 1 })}
      cursor={disabled ? 'default' : horizontal ? 'col-resize' : 'row-resize'}
      hoverStyle={disabled ? {} : { backgroundColor: '$ring' }}
      focusVisibleStyle={{
        backgroundColor: '$ring',
        outlineColor: '$ring',
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 2,
      }}
      style={isWeb ? ({ touchAction: 'none' } as never) : undefined}
      zIndex={1}
    >
      {/* A wider, invisible grab area on web; native uses hitSlop. */}
      {isWeb ? (
        <View
          aria-hidden
          position="absolute"
          {...(horizontal
            ? { top: 0, bottom: 0, left: -6, right: -6 }
            : { left: 0, right: 0, top: -6, bottom: -6 })}
        />
      ) : null}
      {withHandle ? (
        <View
          aria-hidden
          alignItems="center"
          justifyContent="center"
          borderRadius="$sm"
          borderWidth={1}
          borderColor="$border"
          backgroundColor="$background"
          {...(horizontal ? { width: '$3', height: '$5' } : { width: '$5', height: '$3' })}
        >
          <Grip size={10} color="$mutedForeground" />
        </View>
      ) : null}
    </View>
  )
}

/**
 * Panels that share a row or column, with handles between them to drag
 * (or move with the arrow keys) to change their sizes.
 */
export const Resizable = withStaticProperties(ResizableRoot, {
  Panel: ResizablePanel,
  Handle: ResizableHandle,
})
