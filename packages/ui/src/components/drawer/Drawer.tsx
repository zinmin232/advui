import { XIcon } from '@advui/icons'
import { shadows } from '@advui/theme'
import { type ReactNode, forwardRef } from 'react'
import {
  type DialogContentProps as TamaguiDialogContentProps,
  type DialogProps as TamaguiDialogProps,
  type GetProps,
  ScrollView,
  Dialog as TamaguiDialog,
  type TamaguiElement,
  View,
  getTokenValue,
  styled,
  useConfiguration,
  useWindowDimensions,
  withStaticProperties,
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IconButton } from '../icon-button/IconButton'
import {
  descriptionStyle,
  footerStyle,
  headerStyle,
  overlayStyle,
  titleStyle,
} from '../dialog/styles'

// A modal panel pinned to one edge of the screen. It is a Dialog underneath
// (focus trap, Escape, overlay, labelling), so it shares Dialog's styles.

type Side = 'left' | 'right' | 'top' | 'bottom'

const Overlay = styled(TamaguiDialog.Overlay, { name: 'DrawerOverlay', ...overlayStyle })

const ContentFrame = styled(TamaguiDialog.Content, {
  name: 'DrawerContent',
  position: 'absolute',
  backgroundColor: '$popover',
  borderColor: '$border',
  borderWidth: 0,
  borderRadius: 0,
  padding: '$6',
  gap: '$4',
  ...shadows.lg,
  opacity: 1,
  x: 0,
  y: 0,

  variants: {
    side: {
      left: { top: 0, bottom: 0, left: 0, borderRightWidth: 1, maxWidth: '85%' },
      right: { top: 0, bottom: 0, right: 0, borderLeftWidth: 1, maxWidth: '85%' },
      top: { top: 0, left: 0, right: 0, borderBottomWidth: 1, maxHeight: '85%' },
      bottom: { bottom: 0, left: 0, right: 0, borderTopWidth: 1, maxHeight: '85%' },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  } as const,
})

// Panel width for left and right drawers; top and bottom ones fit their content.
const widths = { sm: '$72', md: '$96', lg: '$128' } as const

const Header = styled(View, { name: 'DrawerHeader', ...headerStyle, paddingRight: '$8' })

const Footer = styled(View, { name: 'DrawerFooter', ...footerStyle })

const Title = styled(TamaguiDialog.Title, { name: 'DrawerTitle', ...titleStyle })

const Description = styled(TamaguiDialog.Description, {
  name: 'DrawerDescription',
  ...descriptionStyle,
})

/** Scrolls long content between the header and footer. */
const Body = styled(ScrollView, {
  name: 'DrawerBody',
  flexGrow: 1,
  flexShrink: 1,
  // Room for focus rings of full-width controls inside.
  marginHorizontal: '$-1',
  contentContainerStyle: { gap: '$3', paddingHorizontal: '$1' },
})

export interface DrawerProps extends Omit<TamaguiDialogProps, 'modal'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

function DrawerRoot(props: DrawerProps) {
  return <TamaguiDialog modal {...props} />
}

export interface DrawerContentProps extends Omit<TamaguiDialogContentProps, 'size'> {
  /** Edge the drawer is attached to. Default `right`. */
  side?: Side
  /** Width of a left or right drawer. Default `md`. */
  size?: keyof typeof widths
  /** Hide the top-right close button (keep another way to close!). */
  hideCloseButton?: boolean
  children?: ReactNode
}

const Content = forwardRef<TamaguiElement, DrawerContentProps>(function DrawerContent(
  { children, side = 'right', size = 'md', hideCloseButton = false, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? null : 'medium'
  // Slide in from just past the edge. Window size (not a percentage) because
  // the native animation driver only interpolates numbers.
  const viewport = useWindowDimensions()
  const offscreen = {
    left: { x: -viewport.width },
    right: { x: viewport.width },
    top: { y: -viewport.height },
    bottom: { y: viewport.height },
  }[side]

  // Keep the edge that touches the screen clear of the notch, status bar and
  // home indicator (native; insets come from UniversalProvider).
  const insets = useConfiguration().insets
  const pad = getTokenValue('$6', 'space') as number
  const safe = insets
    ? {
        paddingTop: side === 'bottom' ? pad : pad + insets.top,
        paddingBottom: side === 'top' ? pad : pad + insets.bottom,
        paddingLeft: side === 'right' ? pad : pad + insets.left,
        paddingRight: side === 'left' ? pad : pad + insets.right,
      }
    : null

  const horizontal = side === 'left' || side === 'right'

  return (
    <TamaguiDialog.Portal>
      <Overlay key="overlay" transition={reducedMotion ? null : 'quick'} />
      <ContentFrame
        key="content"
        ref={ref}
        side={side}
        size={size}
        width={horizontal ? widths[size] : undefined}
        enterStyle={offscreen}
        exitStyle={offscreen}
        transition={transition}
        animateOnly={['transform', 'opacity']}
        {...safe}
        {...props}
      >
        {children}
        {hideCloseButton ? null : (
          <Close asChild>
            <IconButton
              aria-label="Close"
              icon={<XIcon />}
              size="sm"
              position="absolute"
              top={safe ? safe.paddingTop - pad + getTokenValue('$4', 'space') : '$4'}
              right={safe ? safe.paddingRight - pad + getTokenValue('$4', 'space') : '$4'}
            />
          </Close>
        )}
      </ContentFrame>
    </TamaguiDialog.Portal>
  )
})

export type DrawerCloseProps = GetProps<typeof TamaguiDialog.Close>

/**
 * Closes the drawer. Like Dialog.Close, it keeps the child's visible text as
 * its accessible name (pass `aria-label` for icon-only closers).
 */
const Close = forwardRef<TamaguiElement, DrawerCloseProps>(function DrawerClose(props, ref) {
  return <TamaguiDialog.Close ref={ref} aria-label={undefined} {...props} />
})

/**
 * A panel that slides in from an edge of the screen, for navigation, filters
 * or details, while the page stays in place behind it. Focus is trapped
 * inside while open; Escape, the overlay and the × button close it.
 */
export const Drawer = withStaticProperties(DrawerRoot, {
  Trigger: TamaguiDialog.Trigger,
  Content,
  Header,
  Body,
  Footer,
  Title,
  Description,
  Close,
})
