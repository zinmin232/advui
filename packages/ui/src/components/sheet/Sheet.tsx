import { XIcon } from '@advui/icons'
import { Dismissable } from '@tamagui/dismissable'
import { FocusScope } from '@tamagui/focus-scope'
import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  createContext,
  useContext,
  useId,
} from 'react'
import {
  type GetProps,
  Sheet as TamaguiSheet,
  View,
  isWeb,
  styled,
  withStaticProperties,
} from 'tamagui/unstyled'
import { useBackToClose } from '../../hooks/useBackToClose'
import { useControllableState } from '../../hooks/useControllableState'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IconButton } from '../icon-button/IconButton'
import { Text, type TextProps } from '../typography/Text'
import { SheetHandle } from './SheetHandle'

type SheetState = {
  open: boolean
  setOpen: (open: boolean) => void
  titleId: string
  descriptionId: string
}

const SheetContext = createContext<SheetState | null>(null)

function useSheet() {
  const sheet = useContext(SheetContext)
  if (!sheet) throw new Error('Sheet parts must be rendered inside <Sheet>.')
  return sheet
}

export interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

function SheetRoot({ open: openProp, defaultOpen = false, onOpenChange, children }: SheetProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  // Android: the back button closes the sheet instead of leaving the screen.
  useBackToClose(open, () => setOpen(false))
  const id = useId()
  return (
    <SheetContext.Provider
      value={{ open, setOpen, titleId: `${id}-title`, descriptionId: `${id}-description` }}
    >
      {children}
    </SheetContext.Provider>
  )
}

type PressableChild = ReactElement<{
  onPress?: (event: unknown) => void
  'aria-haspopup'?: string
  'aria-expanded'?: boolean
}>

export interface SheetTriggerProps {
  /** One pressable element, usually a Button. */
  children: ReactElement
}

function SheetTrigger({ children }: SheetTriggerProps) {
  const { open, setOpen } = useSheet()
  const child = children as PressableChild
  return cloneElement(child, {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    onPress: (event: unknown) => {
      child.props.onPress?.(event)
      setOpen(!open)
    },
  })
}

export interface SheetCloseProps {
  /** One pressable element, usually a Button. Its text stays its accessible name. */
  children: ReactElement
}

function SheetClose({ children }: SheetCloseProps) {
  const { setOpen } = useSheet()
  const child = children as PressableChild
  return cloneElement(child, {
    onPress: (event: unknown) => {
      child.props.onPress?.(event)
      setOpen(false)
    },
  })
}

export interface SheetContentProps extends Omit<GetProps<typeof View>, 'children'> {
  children: ReactNode
  /**
   * Heights as percentages of the screen, largest first, e.g. `[85, 50]`.
   * By default the sheet fits its content.
   */
  snapPoints?: number[]
  /** Close on swipe down and on a press outside. Escape always closes on web. */
  dismissible?: boolean
  /** Hide the top-right close button (keep another way to close!). */
  hideCloseButton?: boolean
}

function SheetContent({
  children,
  snapPoints,
  dismissible = true,
  hideCloseButton = false,
  ...props
}: SheetContentProps) {
  const sheet = useSheet()
  const { open, setOpen, titleId, descriptionId } = sheet
  const reducedMotion = useReducedMotion()

  const body = (
    <View
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      position="relative"
      gap="4"
      width="100%"
      maxWidth="168"
      alignSelf="center"
      flex={snapPoints ? 1 : undefined}
      {...(isWeb ? { inert: !open } : { accessibilityViewIsModal: open })}
      {...props}
      aria-hidden={!open || undefined}
    >
      {children}
      {hideCloseButton ? null : (
        <IconButton
          aria-label="Close"
          icon={<XIcon />}
          size="sm"
          position="absolute"
          top="-2"
          right="-2"
          onPress={() => setOpen(false)}
        />
      )}
    </View>
  )

  return (
    <TamaguiSheet
      open={open}
      onOpenChange={setOpen}
      modal
      // Rise above the keyboard, so a field near the bottom stays in view.
      moveOnKeyboardChange
      dismissOnSnapToBottom={dismissible}
      dismissOnOverlayPress={dismissible}
      snapPointsMode={snapPoints ? 'percent' : 'fit'}
      snapPoints={snapPoints}
      transition={reducedMotion ? undefined : 'medium'}
    >
      <TamaguiSheet.Overlay
        backgroundColor="overlay"
        opacity="enter:0 exit:0"
        transition={reducedMotion ? undefined : 'quick'}
      />
      <SheetHandle />
      <TamaguiSheet.Container paddingTop="6" paddingRight="6" paddingLeft="6" paddingBottom="8">
        <TamaguiSheet.Background
          backgroundColor="popover"
          borderTopLeftRadius="dialog"
          borderTopRightRadius="dialog"
        />
        {/* The native sheet renders in a portal, which does not carry React context. */}
        <SheetContext.Provider value={sheet}>
          {isWeb ? (
            // Tamagui's sheet is only a surface; add what a modal dialog needs on
            // web: Escape to close, and focus kept inside, then returned on close.
            <Dismissable
              forceUnmount={!open}
              disableOutsidePointerEvents={open}
              onPointerDownOutside={(details) => {
                if (!dismissible) details.cancel()
              }}
              onDismiss={() => setOpen(false)}
            >
              <FocusScope loop trapped={open} enabled={open} forceUnmount={!open}>
                {body}
              </FocusScope>
            </Dismissable>
          ) : (
            body
          )}
        </SheetContext.Provider>
      </TamaguiSheet.Container>
    </TamaguiSheet>
  )
}

function SheetTitle({ children, ...props }: TextProps) {
  const { titleId } = useSheet()
  return (
    <Text
      id={titleId}
      render="h2"
      size="lg"
      weight="semibold"
      margin={0}
      {...(!isWeb && { role: 'heading' })}
      {...props}
    >
      {children}
    </Text>
  )
}

function SheetDescription({ children, ...props }: TextProps) {
  const { descriptionId } = useSheet()
  return (
    <Text id={descriptionId} size="sm" tone="muted" margin={0} {...props}>
      {children}
    </Text>
  )
}

export type SheetScrollViewProps = GetProps<typeof TamaguiSheet.ScrollView>

/** Scrolls long content inside a sheet with snap points, filling the space left. */
function SheetScrollView(props: SheetScrollViewProps) {
  return <TamaguiSheet.ScrollView flex={1} {...props} />
}

const Header = styled(View, {
  displayName: 'SheetHeader',
  gap: '1-5',
  paddingRight: '8',
})

const Footer = styled(View, {
  displayName: 'SheetFooter',
  flexDirection: 'column-reverse sm:row',
  gap: '2',
  justifyContent: 'sm:flex-end',
})

/**
 * A panel that slides up from the bottom of the screen, for extra actions,
 * details or a short form without leaving the page. Swipe down, press outside
 * or press Escape to close.
 */
export const Sheet = withStaticProperties(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Header,
  Footer,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
  ScrollView: SheetScrollView,
})
