import { shadows, zIndex } from '@advui/theme'
import { composeEventHandlers } from '@advui/utils'
import {
  type ReactNode,
  type RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
} from 'react'
import {
  Adapt,
  type GetProps,
  Popover as TamaguiPopover,
  type PopoverProps as TamaguiPopoverProps,
  Sheet,
  type TamaguiElement,
  View,
  isWeb,
  useComposedRefs,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useSheetMaxHeight } from '../../hooks/useSheetMaxHeight'
import { Text } from '../typography/Text'
import { transformOpacity } from '../../utils/transition'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'start' | 'center' | 'end'

// Links the dialog to its title for screen readers.
const TitleIdContext = createContext<string | undefined>(undefined)
// The trigger's element, where focus goes back when the popover closes.
const TriggerRefContext = createContext<RefObject<TamaguiElement | null> | null>(null)

export interface PopoverProps extends Omit<
  TamaguiPopoverProps,
  'placement' | 'children' | 'onOpenChange'
> {
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Side of the trigger to open on (desktop web). Default `bottom`. */
  side?: Side
  /** Alignment along that side. Default `center`. */
  align?: Align
  /** Gap between trigger and panel in px. Default 8. */
  offset?: number
}

function PopoverRoot({
  children,
  side = 'bottom',
  align = 'center',
  offset = 8,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: PopoverProps) {
  const reducedMotion = useReducedMotion()
  const sheetMaxHeight = useSheetMaxHeight()
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  // Android (where the popover is a bottom sheet): the back button closes it
  // instead of leaving the screen.
  useBackToClose(open, () => setOpen(false))
  const titleId = useId()
  const triggerRef = useRef<TamaguiElement | null>(null)
  const placement = (
    align === 'center' ? side : `${side}-${align}`
  ) as TamaguiPopoverProps['placement']
  return (
    <TitleIdContext.Provider value={titleId}>
      <TriggerRefContext.Provider value={triggerRef}>
        <TamaguiPopover
          placement={placement}
          offset={offset}
          allowFlip
          stayInFrame={{ padding: 8 }}
          zIndex={zIndex.popover}
          open={open}
          onOpenChange={(next) => setOpen(next)}
          {...props}
        >
          {children}
          {/* Phones and native apps get a bottom sheet instead of a floating panel. */}
          <Adapt when={isWeb ? 'max-md' : true} platform="touch">
            <Sheet
              modal
              // Rise above the keyboard: popovers hold fields (Color Picker's hex).
              moveOnKeyboardChange
              dismissOnSnapToBottom
              snapPointsMode="fit"
              transition={reducedMotion ? undefined : 'medium'}
            >
              <Sheet.Overlay
                backgroundColor="overlay"
                opacity="enter:0 exit:0"
                transition={reducedMotion ? undefined : 'quick'}
              />
              <Sheet.Handle backgroundColor="borderStrong" />
              <Sheet.Container
                paddingTop="5"
                paddingRight="5"
                paddingLeft="5"
                paddingBottom="8"
                maxHeight={sheetMaxHeight}
              >
                <Sheet.Background backgroundColor="popover" borderTopLeftRadius="dialog" borderTopRightRadius="dialog" />
                {/* Scrolls when the content is taller than the sheet may be (a
                    calendar on a phone in landscape). Color Picker's drag area
                    keeps its gesture from it. */}
                <Sheet.ScrollView>
                  {/* Not on Sheet.Frame: Tamagui copies its props onto a decorative cover view. */}
                  <View role="dialog" aria-labelledby={titleId} gap="3">
                    <Adapt.Contents />
                  </View>
                </Sheet.ScrollView>
              </Sheet.Container>
            </Sheet>
          </Adapt>
        </TamaguiPopover>
      </TriggerRefContext.Provider>
    </TitleIdContext.Provider>
  )
}

export type PopoverTriggerProps = GetProps<typeof TamaguiPopover.Trigger>

const PopoverTrigger = forwardRef<TamaguiElement, PopoverTriggerProps>(
  function PopoverTrigger(props, ref) {
    const triggerRef = useContext(TriggerRefContext)
    const composedRef = useComposedRefs(ref, triggerRef ?? undefined)
    return <TamaguiPopover.Trigger ref={composedRef as never} aria-haspopup="dialog" {...props} />
  },
)

export type PopoverContentProps = GetProps<typeof TamaguiPopover.Content>

const PopoverContent = forwardRef<TamaguiElement, PopoverContentProps>(function PopoverContent(
  { children, onCloseAutoFocus, onPointerDownOutside, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const triggerRef = useContext(TriggerRefContext)
  // A right click outside opens a menu there, so focus stays where it is.
  const rightClick = useRef(false)
  return (
    <TamaguiPopover.Content
      ref={ref as never}
      backgroundColor="popover"
      borderWidth={1}
      borderColor="border"
      borderRadius="lg"
      padding="4"
      gap="3"
      width="72"
      maxWidth="100%"
      {...shadows.md}
      opacity="1 enter:0 exit:0"
      scale="1 enter:0.96 exit:0.96"
      y="0 enter:-4px exit:-4px"
      transition={transformOpacity(reducedMotion ? null : 'quick')}
      {...props}
      onPointerDownOutside={composeEventHandlers(
            onPointerDownOutside,
            (details) => {
              const pointer = details.event
              rightClick.current = !!pointer && (pointer.button === 2 || (pointer.button === 0 && pointer.ctrlKey))
            },
            { checkDefaultPrevented: false },
          )}
      onCloseAutoFocus={
            onCloseAutoFocus === false
              ? false
              : composeEventHandlers(onCloseAutoFocus, (details) => {
                  const trigger = triggerRef?.current
                  if (!trigger) return
                  details.cancel()
                  if (!rightClick.current) trigger.focus()
                })
          }
    >
      {children}
    </TamaguiPopover.Content>
  )
})

export type PopoverTitleProps = GetProps<typeof Text>

/** Names the popover dialog for screen readers. */
function PopoverTitle(props: PopoverTitleProps) {
  const titleId = useContext(TitleIdContext)
  const ref = useRef<TamaguiElement>(null)

  // On web, Tamagui's floating wrapper carries role="dialog"; point its label
  // at this title once both are in the document.
  useEffect(() => {
    if (!isWeb || !titleId) return
    const dialog = (ref.current as HTMLElement | null)?.closest('[role="dialog"]')
    dialog?.setAttribute('aria-labelledby', titleId)
  }, [titleId])

  return <Text ref={ref} id={titleId} size="sm" weight="semibold" {...props} />
}

function PopoverDescription(props: GetProps<typeof Text>) {
  return <Text size="sm" tone="muted" {...props} />
}

/**
 * Rich, interactive content anchored to a trigger: settings, filters, short
 * forms. For plain hints use Tooltip; for blocking tasks use Dialog.
 */
export const Popover = withStaticProperties(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: TamaguiPopover.Close,
})
