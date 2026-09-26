import { XIcon } from '@advui/icons'
import { shadows } from '@advui/theme'
import { type ReactNode, forwardRef } from 'react'
import {
  Dialog as TamaguiDialog,
  type DialogContentProps as TamaguiDialogContentProps,
  type DialogProps as TamaguiDialogProps,
  type GetProps,
  type TamaguiElement,
  View,
  styled,
  withStaticProperties,
} from 'tamagui'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IconButton } from '../icon-button/IconButton'
import { Text } from '../typography/Text'

const Overlay = styled(TamaguiDialog.Overlay, {
  name: 'DialogOverlay',
  backgroundColor: '$overlay',
  opacity: 1,
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
})

const ContentFrame = styled(TamaguiDialog.Content, {
  name: 'DialogContent',
  backgroundColor: '$popover',
  borderColor: '$border',
  borderWidth: 1,
  borderRadius: '$xl',
  padding: '$6',
  gap: '$4',
  width: '92%',
  maxWidth: '$128',
  maxHeight: '90%',
  ...shadows.lg,
  opacity: 1,
  scale: 1,
  y: 0,
  enterStyle: { opacity: 0, scale: 0.96, y: 8 },
  exitStyle: { opacity: 0, scale: 0.98, y: 4 },

  variants: {
    size: {
      sm: { maxWidth: '$96' },
      md: { maxWidth: '$128' },
      lg: { maxWidth: '$168' },
      xl: { maxWidth: '$224' },
    },
  } as const,
})

const Header = styled(View, { name: 'DialogHeader', gap: '$1.5', paddingRight: '$6' })

const Footer = styled(View, {
  name: 'DialogFooter',
  flexDirection: 'column-reverse',
  gap: '$2',
  $sm: { flexDirection: 'row', justifyContent: 'flex-end' },
})

const Title = styled(TamaguiDialog.Title, {
  name: 'DialogTitle',
  fontFamily: '$heading',
  fontSize: '$5',
  lineHeight: '$5',
  fontWeight: '600',
  color: '$foreground',
  margin: 0,
})

const Description = styled(TamaguiDialog.Description, {
  name: 'DialogDescription',
  fontFamily: '$body',
  fontSize: '$2',
  lineHeight: '$2',
  color: '$mutedForeground',
  margin: 0,
})

export type DialogProps = TamaguiDialogProps

export interface DialogContentProps extends Omit<TamaguiDialogContentProps, 'size'> {
  size?: GetProps<typeof ContentFrame>['size']
  /** Hide the top-right close button (keep another way to close!). */
  hideCloseButton?: boolean
  children?: ReactNode
}

const Content = forwardRef<TamaguiElement, DialogContentProps>(function DialogContent(
  { children, hideCloseButton, size = 'md', ...props },
  ref,
) {
  const reducedMotion = useReducedMotion()
  const transition = reducedMotion ? null : 'quick'
  return (
    <TamaguiDialog.Portal>
      <Overlay key="overlay" transition={transition} />
      <ContentFrame
        key="content"
        ref={ref}
        size={size}
        transition={transition}
        animateOnly={['transform', 'opacity']}
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
              top="$3"
              right="$3"
            />
          </Close>
        )}
      </ContentFrame>
    </TamaguiDialog.Portal>
  )
})

export type DialogCloseProps = GetProps<typeof TamaguiDialog.Close>

/**
 * Closes the dialog. Tamagui's Close sets `aria-label="Dialog Close"`, which
 * would override visible labels such as "Cancel"; we clear it so the child's
 * text stays the accessible name (pass `aria-label` for icon-only closers).
 */
const Close = forwardRef<TamaguiElement, DialogCloseProps>(function DialogClose(props, ref) {
  return <TamaguiDialog.Close ref={ref} aria-label={undefined} {...props} />
})

function DialogRoot(props: DialogProps) {
  return <TamaguiDialog modal {...props} />
}

/**
 * Modal window for focused tasks. Focus is trapped inside while open, Escape
 * closes it, and focus returns to the trigger on close. Title and Description
 * are wired to `aria-labelledby` / `aria-describedby`.
 */
export const Dialog = withStaticProperties(DialogRoot, {
  Trigger: TamaguiDialog.Trigger,
  Content,
  Header,
  Footer,
  Title,
  Description,
  Close,
  Body: styled(View, { name: 'DialogBody', gap: '$3' }),
  Text,
})
