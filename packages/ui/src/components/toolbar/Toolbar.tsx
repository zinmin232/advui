import {
  type ReactNode,
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useRef,
} from 'react'
import {
  type GetProps,
  type TamaguiElement,
  isWeb,
  styled,
  useComposedRefs,
  withStaticProperties,
} from 'tamagui/unstyled'
import { isTextContent } from '../../utils/isTextContent'
import type { Responsive } from '../../utils/responsive'
import { Stack, type StackAlign, type StackDistribute } from '../layout/Stack'
import { Separator, type SeparatorProps } from '../separator/Separator'
import { Text } from '../typography/Text'
import { useArrowKeys } from './arrowKeys'

export type ToolbarOrientation = 'horizontal' | 'vertical'
export type ToolbarVariant = 'default' | 'outline' | 'filled' | 'ghost'
export type ToolbarSize = 'sm' | 'md' | 'lg'
export type ToolbarRole = 'group' | 'toolbar'

const ToolbarFrame = styled(Stack, {
  displayName: 'Toolbar',
  borderRadius: 'lg',
  variants: {
    variant: {
      default: {
        backgroundColor: 'background',
      },
      outline: {
        backgroundColor: 'background',
        borderWidth: 1,
        borderColor: 'border',
      },
      filled: {
        backgroundColor: 'muted',
      },
      // No fill, border or padding: for a bar inside a card or panel.
      ghost: {},
    },
  } as const,
})

// `min` is a control's height plus the padding on both sides, so a bar that
// holds only text is as tall as one with buttons of the same size.
const sizes = {
  sm: { gap: '1', groupGap: '0-5', padding: '1', control: '8', min: '10' },
  md: { gap: '2', groupGap: '1', padding: '2', control: '10', min: '14' },
  lg: { gap: '3', groupGap: '2', padding: '4', control: '12', min: '20' },
} as const

type ToolbarState = {
  orientation: ToolbarOrientation
  size: ToolbarSize
  wrap: boolean
  align: Responsive<StackAlign>
}

const ToolbarContext = createContext<ToolbarState | null>(null)

function useToolbar(part: string) {
  const toolbar = useContext(ToolbarContext)
  if (!toolbar) throw new Error(`Toolbar.${part} must be rendered inside <Toolbar>.`)
  return toolbar
}

const textOr = (content: ReactNode, center = false) =>
  isTextContent(content) ? (
    <Text textAlign={center ? 'center' : undefined}>{content}</Text>
  ) : (
    content
  )

const slotDistribute = { leading: 'start', center: 'center', trailing: 'end' } as const

const present = (node: ReactNode) => node !== undefined && node !== null && node !== false

type FrameProps = GetProps<typeof ToolbarFrame>

export interface ToolbarProps extends Omit<
  FrameProps,
  'role' | 'direction' | 'align' | 'distribute' | 'wrap' | 'variant' | 'children'
> {
  /**
   * `group` (default): a named set of controls, each its own Tab stop.
   * `toolbar`: the WAI-ARIA toolbar, one Tab stop with arrow-key movement
   * between its controls (web).
   */
  role?: ToolbarRole
  /** Names the bar, e.g. "Formatting". Recommended; needed when a page has several. */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Lay the controls out in a row or a column. Default `horizontal`. */
  orientation?: ToolbarOrientation
  variant?: ToolbarVariant
  /** Gap, padding and minimum height. Controls keep their own size. */
  size?: ToolbarSize
  /** Cross-axis alignment. Default `center` in a row, `stretch` in a column. */
  align?: Responsive<StackAlign>
  /** Main-axis distribution of the children when there is free space. Default `start`. */
  distribute?: Responsive<StackDistribute>
  /** Let controls wrap onto more lines when the bar is too narrow. */
  wrap?: boolean
  /** Content at the start edge, such as a title or a back button. */
  leading?: ReactNode
  /** Content that takes the free space between the others, centered in it. */
  center?: ReactNode
  /** Content kept at the end edge, such as the main actions. */
  trailing?: ReactNode
  children?: ReactNode
}

const ToolbarRoot = forwardRef<TamaguiElement, ToolbarProps>(function Toolbar(
  {
    role = 'group',
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    align,
    distribute = 'start',
    wrap = false,
    leading,
    center,
    trailing,
    children,
    gap,
    onFocus,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const ref = useRef<TamaguiElement>(null)
  const composedRef = useComposedRefs(ref, forwardedRef)
  const arrowKeys = useArrowKeys(
    ref as RefObject<HTMLElement | null>,
    role === 'toolbar',
    orientation,
  )
  const horizontal = orientation === 'horizontal'
  const direction = horizontal ? 'row' : 'column'
  const spacing = sizes[size]
  const ghost = variant === 'ghost'
  const state: ToolbarState = {
    orientation,
    size,
    wrap,
    align: align ?? (horizontal ? 'center' : 'stretch'),
  }

  // One box per region given, none for the rest. The free space goes to
  // `center`, or else to `trailing`, which keeps its content at the end edge.
  // Leading and center may shrink (a title wraps, a field narrows); trailing
  // keeps its size unless the bar wraps. On web, regions other than a center
  // of controls shrink no further than their content (CSS `min-width: auto`,
  // which Tamagui resets to 0), so a title never runs into its neighbour. A
  // center of controls can, so a search field narrows; one that cannot
  // shrink (a Toggle Group) needs `wrap` on narrow screens.
  const region = (content: ReactNode, slot: 'leading' | 'center' | 'trailing') =>
    present(content) ? (
      <Stack
        direction={direction}
        align={state.align}
        distribute={slotDistribute[slot]}
        wrap={wrap ? 'wrap' : 'nowrap'}
        gap={gap ?? spacing.gap}
        flexGrow={slot === 'center' || (slot === 'trailing' && !present(center)) ? 1 : 0}
        // With `wrap`, trailing shrinks too, so its own controls wrap; its
        // auto start margin keeps it at the end edge on a line of its own.
        flexShrink={slot === 'trailing' && !wrap ? 0 : 1}
        {...(slot === 'trailing' && {
          [horizontal ? 'marginInlineStart' : 'marginBlockStart']: 'auto',
        })}
        // Native has no `min-width: auto`, and Yoga sizes a center holding a
        // growing field (`flex={1}`) at the whole bar, so shrinking took the
        // title down to a letter a line. On one line the center gets only
        // the free space; with `wrap` its size still decides the line breaks.
        {...(!isWeb && slot === 'center' && !wrap && { flexBasis: 0 })}
        {...(isWeb &&
          (slot !== 'center' || isTextContent(content)) && {
            minWidth: 'auto',
            minHeight: 'auto',
          })}
      >
        {textOr(content, slot === 'center')}
      </Stack>
    ) : null

  return (
    <ToolbarContext.Provider value={state}>
      <ToolbarFrame
        ref={composedRef}
        role={role}
        aria-orientation={role === 'toolbar' ? orientation : undefined}
        variant={variant}
        direction={direction}
        align={state.align}
        distribute={distribute}
        wrap={wrap ? 'wrap' : 'nowrap'}
        gap={gap ?? spacing.gap}
        padding={ghost ? 0 : spacing.padding}
        {...(horizontal
          ? { minHeight: ghost ? spacing.control : spacing.min }
          : // A column hugs its controls instead of stretching across its parent.
            { minWidth: ghost ? spacing.control : spacing.min, alignSelf: 'flex-start' })}
        // Style props given here win over the variant and size.
        {...props}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        {...(arrowKeys && {
          ...arrowKeys,
          onFocus: (event: Parameters<NonNullable<typeof onFocus>>[0]) => {
            onFocus?.(event)
            arrowKeys.onFocus(event)
          },
          onKeyDown: (event: Parameters<NonNullable<typeof onKeyDown>>[0]) => {
            onKeyDown?.(event)
            arrowKeys.onKeyDown(event as never)
          },
        })}
      >
        {region(leading, 'leading')}
        {textOr(children)}
        {region(center, 'center')}
        {region(trailing, 'trailing')}
      </ToolbarFrame>
    </ToolbarContext.Provider>
  )
})

export interface ToolbarGroupProps extends Omit<
  GetProps<typeof Stack>,
  'role' | 'direction' | 'children'
> {
  /** Names the group, e.g. "History". */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** Defaults to the toolbar's. */
  orientation?: ToolbarOrientation
  children?: ReactNode
}

/** Related controls kept together, with a tighter gap than the toolbar's. */
const ToolbarGroup = forwardRef<TamaguiElement, ToolbarGroupProps>(function ToolbarGroup(
  { orientation, children, ...props },
  ref,
) {
  const toolbar = useToolbar('Group')
  const own = orientation ?? toolbar.orientation
  const horizontal = own === 'horizontal'
  return (
    <ToolbarContext.Provider value={{ ...toolbar, orientation: own }}>
      <Stack
        ref={ref}
        role="group"
        direction={horizontal ? 'row' : 'column'}
        align={own === toolbar.orientation ? toolbar.align : horizontal ? 'center' : 'stretch'}
        wrap={toolbar.wrap ? 'wrap' : 'nowrap'}
        gap={sizes[toolbar.size].groupGap}
        {...props}
      >
        {textOr(children)}
      </Stack>
    </ToolbarContext.Provider>
  )
})

export type ToolbarSeparatorProps = Omit<
  SeparatorProps,
  'orientation' | 'label' | 'labelPosition' | 'children'
>

/** A line between groups, across the toolbar's direction. Decorative by default. */
function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const { orientation } = useToolbar('Separator')
  return (
    <Separator orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} {...props} />
  )
}

/**
 * A row or column of related controls: actions, filters, formatting. Place
 * controls as children, or in `leading`, `center` and `trailing`; group them
 * with `Toolbar.Group` and `Toolbar.Separator`.
 */
export const Toolbar = withStaticProperties(ToolbarRoot, {
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
})
